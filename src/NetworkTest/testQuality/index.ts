/**
 * @module Test/Publishing
 * @preferred
 *
 * Defines the methods required for the Publishing Test Flow
 */

/**
 * Publishing Test Flow
 */

/* tslint:disable */
import OTKAnalytics from 'opentok-solutions-logging';
/* tslint:enable */
import * as Promise from 'promise';
import { OT } from '../types/opentok';
import { AV, Bandwidth, HasAudioVideo } from './types';
// import { Subscriber, SubscriberStats } from '../types/opentok/subscriber';
// import { Publisher, PublisherProperties } from '../types/opentok/publisher';
// import { Stream } from '../types/opentok/stream';
// import { Session } from '../types/opentok/session';
// import { OTError } from '../types/opentok/error';
// import { Event } from '../types/opentok/events';
import { CompletionCallback, UpdateCallback, UpdateCallbackStats } from '../types/callbacks';
import { pick } from '../../util';
import * as e from './errors/';
import { OTErrorType, errorHasName } from '../errors/types';
import subscriberMOS from './helpers/subscriberMOS';
import MOSState from './helpers/MOSState';
import config from './helpers/config';
import isSupportedBrowser from './helpers/isSupportedBrowser';
import { AverageStats } from './helpers/stats';

export interface QualityTestResults extends HasAudioVideo<AverageStats> {
  mos: number;
}

interface QualityTestResultsBuilder {
  state: MOSState;
  subscriber: OT.Subscriber;
  credentials: OT.SessionCredentials;
  mosScore?: number;
  bandwidth?: Bandwidth;
}

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
      session.connect(token, (error?: OT.Error) => {
        if (error) {
          if (errorHasName(error, OTErrorType.AUTHENTICATION_ERROR)) {
            reject(new e.ConnectToSessionTokenError());
          } else if (errorHasName(error, OTErrorType.INVALID_SESSION_ID)) {
            reject(new e.ConnectToSessionSessionIdError());
          } else if (errorHasName(error, OTErrorType.CONNECT_FAILED)) {
            reject(new e.ConnectToSessionNetworkError());
          } else {
            reject(new e.ConnectToSessionError());
          }
        }
        resolve(session);
      });
    }
  });
}

/**
 * Ensure that audio and video devices are available
 */
function validateDevices(OT: OT.Client): Promise<void> {
  return new Promise((resolve, reject) => {

    type DeviceMap = { [deviceId: string]: OT.Device };
    type AvailableDevices = { audio: DeviceMap, video: DeviceMap };

    OT.getDevices((error?: OT.Error, devices: OT.Device[] = []) => {

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
function publishAndSubscribe(OT: OT.Client) {
  return (session: OT.Session): Promise<OT.Subscriber> =>
    new Promise((resolve, reject) => {
      type StreamCreatedEvent = OT.Event<'streamCreated', OT.Publisher> & { stream: OT.Stream };
      const containerDiv = document.createElement('div');
      containerDiv.style.position = 'fixed';
      containerDiv.style.bottom = '-1px';
      containerDiv.style.width = '1px';
      containerDiv.style.height = '1px';
      containerDiv.style.opacity = '0';
      document.body.appendChild(containerDiv);
      const publisherOptions: OT.PublisherProperties = {
        resolution: '1280x720',
        width: '100%',
        height: '100%',
        insertMode: 'append',
        showControls: false,
      };
      validateDevices(OT)
        .then(() => {
          const publisher = OT.initPublisher(containerDiv, publisherOptions, (error?: OT.Error) => {
            if (error) {
              reject(new e.InitPublisherError(error.message));
            } else {
              session.publish(publisher, (publishError?: OT.Error) => {
                if (publishError) {
                  if (errorHasName(publishError, OTErrorType.NOT_CONNECTED)) {
                    return reject(new e.PublishToSessionNotConnectedError());
                  }
                  if (errorHasName(publishError, OTErrorType.UNABLE_TO_PUBLISH)) {
                    return reject(new e.PublishToSessionPermissionOrTimeoutError());
                  }
                  return reject(new e.PublishToSessionError());
                  // return reject(new e.PublishToSessionError(publishError.message));
                }
              });
            }
          });
          publisher.on('streamCreated', (event: StreamCreatedEvent) => {
            const subscriber =
              session.subscribe(event.stream,
                containerDiv,
                { testNetwork: true, insertMode: 'append' },
                (subscribeError?: OT.Error) => {
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
  OT: OT.Client,
  session: OT.Session,
  credentials: OT.SessionCredentials): Promise<OT.Subscriber> {
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
  OT: OT.Client,
  session: OT.Session,
  credentials: OT.SessionCredentials,
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

            const getStatsListener = (error?: OT.Error, stats?: OT.SubscriberStats) => {
              const updateStats = (subscriberStats: OT.SubscriberStats): UpdateCallbackStats => ({
                ...subscriberStats,
                phase: audioOnly ? 'audio-only' : 'audio-video',
              });
              stats && onUpdate && onUpdate(updateStats(stats));
            };

            const processResults = () => {
              const audioVideoResults: QualityTestResults = buildResults(builder);
              if (!audioOnly && !isAudioQualityAcceptable(audioVideoResults)) {
                audioOnly = true;
                checkSubscriberQuality(OT, session, credentials, onUpdate)
                  .then((results: QualityTestResults) => {
                    resolve(results);
                  });
              } else {
                session.on('sessionDisconnected', () => {
                  resolve(audioVideoResults);
                  session.off();
                });
                session.disconnect();
              }
            };

            const resultsCallback: MOSResultsCallback = (state: MOSState) => {
              clearTimeout(mosEstimatorTimeoutId);
              processResults();
            };

            subscriberMOS(builder.state, subscriber, getStatsListener, resultsCallback);

            mosEstimatorTimeoutId = window.setTimeout(processResults, audioOnly ? config.getStatsAudioOnlyDuration
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
    return supported ? resolve() : reject(new e.UnsupportedBrowserError(browser));
  });
}

/**
 * This method checks to see if the client can publish to an OpenTok session.
 */
export default function testQuality(
  OT: OT.Client,
  credentials: OT.SessionCredentials,
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
