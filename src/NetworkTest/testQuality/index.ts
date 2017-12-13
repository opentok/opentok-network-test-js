/**
 * @module Test/Publishing
 * @preferred
 *
 * Defines the methods required for the Publishing Test Flow
 */

/**
 * Publishing Test Flow
 */


import * as Promise from 'promise';
import { get, getOr, pick } from '../../util';
import * as e from './errors/';
import subscriberMOS from './helpers/subscriberMOS';
import MOSState from './helpers/MOSState';
import config from './helpers/config';
import isSupportedBrowser from './helpers/isSupportedBrowser';

type QualityTestResultsBuilder = {
  state: MOSState,
  subscriber: OT.Subscriber,
  credentials: SessionCredentials,
  mosScore?: number,
  bandwidth?: Bandwidth,
};

type MOSResultsCallback = (state: MOSState) => void;

let audioOnly = false; // The initial test is audio-video

/**
 * If not already connected, connect to the OpenTok Session
 */
function connectToSession(session: OT.Session, token: string): Promise<OT.Session> {
  return new Promise((resolve, reject) => {
    if (session.connection) {
      resolve(session);
    } else {
      session.connect(token, (error?: OT.OTError) => {
        error ? reject(new e.ConnectToSessionError(error.message)) : resolve(session);
      });
    }
  });
}

/**
 * Ensure that audio and video devices are available
 */
function validateDevices(OT: OpenTok): Promise<void> {
  return new Promise((resolve, reject) => {

    type DeviceMap = { [deviceId: string]: OT.Device };
    type AvailableDevices = { audio: DeviceMap, video: DeviceMap };

    OT.getDevices((error?: OT.OTError, devices: OT.Device[] = []) => {

      if (error) {
        reject(new e.FailedToObtainMediaDevices());
      } else {

        const availableDevices: AvailableDevices = devices.reduce(
          (acc: AvailableDevices, device: OT.Device) => {
            const type: AV = device.kind === 'audioInput' ? 'audio' : 'video';
            return { ...acc, [type]: { ...acc[type], [device.deviceId]: device } };
          },
          { audio: {}, video: {} },
        );

        if (!Object.keys(availableDevices.audio).length) {
          reject(new e.NoAudioCaptureDevicesError());
        } else if (!Object.keys(availableDevices.video).length) {
          reject(new e.NoVideoCaptureDevicesError());
        } else {
          resolve();
        }
      }
    });
  });
}

/**
 * Create a test publisher and subscribe to the publihser's stream
 */
function publishAndSubscribe(OT: OpenTok) {
  return (session: OT.Session): Promise<OT.Subscriber> =>
    new Promise((resolve, reject) => {
      type StreamCreatedEvent = OT.Event<'streamCreated', OT.Publisher> & { stream: OT.Stream };
      const containerDiv = document.createElement('div');
      const publisherOptions: OT.PublisherProperties = { resolution: '1280x720' };
      const resolution  = '1280x720';
      const publiserOptions = Object.assign({}, { resolution }, audioOnly ? { videoSource: null } : {});
      validateDevices(OT)
        .then(() => {
          const containerDiv = document.createElement('div');
          const publisher = OT.initPublisher(containerDiv, publisherOptions, (error?: OT.OTError) => {
            if (error) {
              reject(new e.InitPublisherError(error.message));
            } else {
              session.publish(publisher, (publishError?: OT.OTError) => {
                if (publishError) {
                  return reject(new e.PublishToSessionError(publishError.message));
                }
              });
            }
          });
          publisher.on('streamCreated', (event: StreamCreatedEvent) => {
            const subscriber =
              session.subscribe(event.stream, containerDiv, { testNetwork: true }, (subscribeError?: OT.OTError) => {
                return subscribeError ?
                  reject(new e.SubscribeToSessionError(subscribeError.message)) :
                  resolve(subscriber);
              });
          });
        })
        .catch(reject);
    });
}
/**
 *  Connect to the OpenTok session, create a publisher, and subsribe to the publisher's stream
 */
function subscribeToTestStream(
  OT: OpenTok,
  session: OT.Session,
  credentials: SessionCredentials): Promise<OT.Subscriber> {
  return new Promise((resolve, reject) => {
    connectToSession(session, credentials.token)
      .then(publishAndSubscribe(OT))
      .then(resolve)
      .catch(reject);
  });
}

function buildResults(builder: QualityTestResultsBuilder): QualityTestResults {
  const baseProps: (keyof AverageStats)[] = ['bitrate', 'packetLossRatio', 'supported', 'reason'];
  return {
    mos: builder.state.qualityScore(),
    audio: pick(baseProps, builder.state.stats.audio),
    video: pick(baseProps.concat(['frameRate', 'recommendedResolution', 'recommendedFrameRate']),
      builder.state.stats.video),
  };
}

function isAudioQualityAcceptable(results: QualityTestResults): boolean {
  return !!results.audio.bitrate && (results.audio.bitrate > config.qualityThresholds.audio[0].bps)
    && (!!results.audio.packetLossRatio &&
    (results.audio.packetLossRatio < config.qualityThresholds.audio[0].plr)
    || results.audio.packetLossRatio === 0);
}

function checkSubscriberQuality(
  OT: OpenTok,
  session: OT.Session,
  credentials: SessionCredentials,
  onUpdate?: UpdateCallback<OT.SubscriberStats>): Promise<QualityTestResults> {

  let mosEstimatorTimeoutId: number;

  return new Promise((resolve, reject) => {
    subscribeToTestStream(OT, session, credentials)
      .then((subscriber: OT.Subscriber) => {
        if (!subscriber) {
          reject(new e.MissingSubscriberError());
        } else {
          try {
            const builder: QualityTestResultsBuilder = {
              state: new MOSState(),
              ... { subscriber },
              ... { credentials },
            };

            const getStatsListener = (error?: OT.OTError, stats?: OT.SubscriberStats) => {
              const updateStats = (subscriberStats: OT.SubscriberStats): UpdateCallbackStats => ({
                ...subscriberStats,
                phase: audioOnly ? 'audio-only' : 'audio-video',
              });
              stats && onUpdate && onUpdate(updateStats(stats));
            };

            const resultsCallback: MOSResultsCallback = (state: MOSState) => {
              clearTimeout(mosEstimatorTimeoutId);
              const audioVideoResults: QualityTestResults = buildResults(builder);
              if (!audioOnly && !isAudioQualityAcceptable(audioVideoResults)) {
                audioOnly = true;
                checkSubscriberQuality(OT, session, credentials, onUpdate)
                  .then((results: QualityTestResults) => {
                    resolve(results);
                  });
              } else {
                session.disconnect();
                resolve(audioVideoResults);
              }
            };

            subscriberMOS(builder.state, subscriber, getStatsListener, resultsCallback);

            mosEstimatorTimeoutId = window.setTimeout(() => {
              const audioVideoResults: QualityTestResults = buildResults(builder);
              if (!isAudioQualityAcceptable(audioVideoResults)) {
                audioOnly = true;
                checkSubscriberQuality(OT, session, credentials, onUpdate)
                  .then((results: QualityTestResults) => {
                    resolve(results);
                  });
              } else {
                session.disconnect();
                resolve(audioVideoResults);
              }
            }, audioOnly ? config.getStatsAudioOnlyDuration
              : config.getStatsVideoAndAudioTestDuration);

          } catch (exception) {
            reject(new e.SubscriberGetStatsError());
          }
        }
      })
      .catch(reject);
  });
}

/**
 * Ensure that the test is being run in a supported browser.
 */
function validateBrowser(): Promise<void> {
  return new Promise((resolve, reject) => {
    const { supported, browser } = isSupportedBrowser();
    return supported ?  resolve() : reject(new e.UnsupportedBrowserError(browser));
  });
}

/**
 * This method checks to see if the client can publish to an OpenTok session.
 */
export default function testQuality(
  OT: OpenTok,
  credentials: SessionCredentials,
  otLogging: OTKAnalytics,
  onUpdate?: UpdateCallback<UpdateCallbackStats>,
  onComplete?: CompletionCallback<QualityTestResults>): Promise<QualityTestResults> {
  return new Promise((resolve, reject) => {

    const onSuccess = (results: QualityTestResults) => {
      onComplete && onComplete(undefined, results);
      otLogging.logEvent({ action: 'testQuality', variation: 'Success' });
      resolve(results);
    };

    const onError = (error: Error) => {
      otLogging.logEvent({ action: 'testQuality', variation: 'Failure' });
      onComplete && onComplete(error, null);
      reject(error);
    };

    validateBrowser()
    .then(() => {
      const session = OT.initSession(credentials.apiKey, credentials.sessionId);
      checkSubscriberQuality(OT, session, credentials, onUpdate)
        .then(onSuccess)
        .catch(onError);
    })
    .catch(onError);
  });
}
