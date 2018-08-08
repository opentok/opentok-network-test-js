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
import OTKAnalytics = require('opentok-solutions-logging');
/* tslint:enable */
import * as Promise from 'promise';
import {
  NetworkTestOptions,
} from '../index';
import { OT } from '../types/opentok';
import { AverageStats, AV, Bandwidth, HasAudioVideo } from './types/stats';
import { UpdateCallback, UpdateCallbackStats } from '../types/callbacks';
import { pick } from '../util';
import * as e from './errors/';
import { OTErrorType, errorHasName } from '../errors/types';
import subscriberMOS from './helpers/subscriberMOS';
import MOSState from './helpers/MOSState';
import config from './helpers/config';
import isSupportedBrowser from './helpers/isSupportedBrowser';

interface QualityTestResultsBuilder {
  state: MOSState;
  subscriber: OT.Subscriber;
  credentials: OT.SessionCredentials;
  mosScore?: number;
  bandwidth?: Bandwidth;
}

export interface QualityTestResults extends HasAudioVideo<AverageStats> {}

type MOSResultsCallback = (state: MOSState) => void;
type DeviceMap = { [deviceId: string]: OT.Device };
type AvailableDevices = { audio: DeviceMap, video: DeviceMap };

let audioOnly = false; // By default, the initial test is audio-video
let testTimeout: number;
let stopTest: Function | undefined;
let stopTestTimeoutId: number;
let stopTestTimeoutCompleted = false;
let stopTestCalled = false;

/**
 * If not already connected, connect to the OpenTok Session
 */
function connectToSession(session: OT.Session, token: string): Promise<OT.Session> {
  return new Promise((resolve, reject) => {
    if (session.connection) {
      resolve(session);
    } else {
      session.connect(token, (error?: OT.OTError) => {
        if (error) {
          if (errorHasName(error, OTErrorType.OT_AUTHENTICATION_ERROR)) {
            reject(new e.ConnectToSessionTokenError());
          } else if (errorHasName(error, OTErrorType.OT_INVALID_SESSION_ID)) {
            reject(new e.ConnectToSessionSessionIdError());
          } else if (errorHasName(error, OTErrorType.OT_CONNECT_FAILED)) {
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
function validateDevices(OT: OT.Client): Promise<AvailableDevices> {
  return new Promise((resolve, reject) => {
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
        } else {
          resolve(availableDevices);
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
      let publisherOptions: OT.PublisherProperties;
      type StreamCreatedEvent = OT.Event<'streamCreated', OT.Publisher> & { stream: OT.Stream };
      const containerDiv = document.createElement('div');
      containerDiv.style.position = 'fixed';
      containerDiv.style.bottom = '-1px';
      containerDiv.style.width = '1px';
      containerDiv.style.height = '1px';
      containerDiv.style.opacity = '0';
      document.body.appendChild(containerDiv);
      validateDevices(OT)
        .then((availableDevices: AvailableDevices) => {
          if (!Object.keys(availableDevices.video).length) {
            audioOnly = true;
          }
          let publisherOptions: OT.PublisherProperties = {
            resolution: '1280x720',
            width: '100%',
            height: '100%',
            insertMode: 'append',
            showControls: false,
          };
          if (audioOnly) {
            publisherOptions.videoSource = null;
          }
          const publisher = OT.initPublisher(containerDiv, publisherOptions, (error?: OT.OTError) => {
            if (error) {
              reject(new e.InitPublisherError(error.message));
            } else {
              session.publish(publisher, (publishError?: OT.OTError) => {
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
                (subscribeError?: OT.OTError) => {
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
  const baseProps: (keyof AverageStats)[] = ['bitrate', 'packetLossRatio', 'supported', 'reason', 'mos'];
  builder.state.stats.audio.mos = builder.state.audioQualityScore();
  builder.state.stats.video.mos = builder.state.videoQualityScore();
  return {
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
  onUpdate?: UpdateCallback<OT.SubscriberStats>,
  audioOnlyFallback?: boolean,
): Promise<QualityTestResults> {

  let mosEstimatorTimeoutId: number;

  return new Promise((resolve, reject) => {
    subscribeToTestStream(OT, session, credentials)
      .then((subscriber: OT.Subscriber) => {
        if (!subscriber) {
          reject(new e.MissingSubscriberError());
        } else {
          try {
            const builder: QualityTestResultsBuilder = {
              state: new MOSState(audioOnlyFallback),
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

            const processResults = () => {
              const audioVideoResults: QualityTestResults = buildResults(builder);
              if (!audioOnly && !isAudioQualityAcceptable(audioVideoResults)) {
                audioOnly = true;
                checkSubscriberQuality(OT, session, credentials, onUpdate, true)
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

            stopTest = () => {
              processResults();
            };

            const resultsCallback: MOSResultsCallback = (state: MOSState) => {
              clearTimeout(mosEstimatorTimeoutId);
              processResults();
            };

            subscriberMOS(builder.state, subscriber, getStatsListener, resultsCallback);

            mosEstimatorTimeoutId = window.setTimeout(processResults, testTimeout);

            window.clearTimeout(stopTestTimeoutId);
            stopTestTimeoutId = window.setTimeout(() => {
              stopTestTimeoutCompleted = true;
              if (stopTestCalled && stopTest) {
                stopTest();
              }
            }, 5000);

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
export function testQuality(
  OT: OT.Client,
  credentials: OT.SessionCredentials,
  otLogging: OTKAnalytics,
  options?: NetworkTestOptions,
  onUpdate?: UpdateCallback<UpdateCallbackStats>,
): Promise<QualityTestResults> {
  stopTestTimeoutCompleted = false;
  stopTestCalled = false;
  return new Promise((resolve, reject) => {

    audioOnly = !!(options && options.audioOnly);
    testTimeout = audioOnly ? config.getStatsAudioOnlyDuration :
     config.getStatsVideoAndAudioTestDuration;
    if (options && options.timeout) {
      testTimeout = Math.min(testTimeout, options.timeout, 30000);
    }
    const onSuccess = (results: QualityTestResults) => {
      stopTest = undefined;
      otLogging.logEvent({ action: 'testQuality', variation: 'Success' });
      resolve(results);
    };

    const onError = (error: Error) => {
      stopTest = undefined;
      otLogging.logEvent({ action: 'testQuality', variation: 'Failure' });
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

export function stopQualityTest() {
  stopTestCalled = true;
  if (stopTestTimeoutCompleted && stopTest) {
    stopTest();
  }
}
