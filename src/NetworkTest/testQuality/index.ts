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
import getUpdateCallbackStats from './helpers/getUpdateCallbackStats';
import { PermissionDeniedError, UnsupportedResolutionError } from '../errors';

const FULL_HD_WIDTH = 1920;
const FULL_HD_HEIGHT = 1080;
const FULL_HD_RESOLUTION = '1920x1080';
const HD_RESOUTION = '1280x720';

interface QualityTestResultsBuilder {
  state: MOSState;
  subscriber: OT.Subscriber;
  credentials: OT.SessionCredentials;
  mosScore?: number;
  bandwidth?: Bandwidth;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface QualityTestResults extends HasAudioVideo<AverageStats> { }

type MOSResultsCallback = (state: MOSState) => void;
type DeviceMap = { [deviceId: string]: OT.Device };
type AvailableDevices = { audio: DeviceMap; video: DeviceMap };
type PublisherSubscriber = { publisher: OT.Publisher; subscriber: OT.Subscriber };

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
 * Checks for camera support for a given resolution.
 *
 * See the "API reference" section of the README.md file in the root of the
 * opentok-network-test-js project for details.
 */
function checkCameraSupport(width: number, height: number): Promise<void> {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { exact: width },
        height: { exact: height },
      },
      audio: false,
    }).then((mediaStream) => {
      if (mediaStream) {
        resolve();
      }
    }).catch((error) => {
      switch (error.name) {
      case 'OverconstrainedError':
        reject(new UnsupportedResolutionError());
        break;
      case 'NotAllowedError':
        reject(new PermissionDeniedError());
        break;
      default:
        reject(error);
      }
    });
  });
}
/**
 * Ensure that audio and video devices are available
 */
function validateDevices(OT: OT.Client, options?: NetworkTestOptions): Promise<AvailableDevices> {
  return new Promise((resolve, reject) => {
    OT.getDevices((error?: OT.OTError, devices: OT.Device[] = []) => {
      if (error) {
        reject(new e.FailedToObtainMediaDevices());
        return;
      }

      const availableDevices: AvailableDevices = devices.reduce(
        (acc: AvailableDevices, device: OT.Device) => {
          const type: AV = device.kind === 'audioInput' ? 'audio' : 'video';
          return { ...acc, [type]: { ...acc[type], [device.deviceId]: device } };
        },
        { audio: {}, video: {} },
      );

      if (!Object.keys(availableDevices.audio).length) {
        reject(new e.NoAudioCaptureDevicesError());
        return;
      }
      if (options?.fullHd) {
        checkCameraSupport(FULL_HD_WIDTH, FULL_HD_HEIGHT)
          .then(() => resolve(availableDevices))
          .catch(reject);
      } else {
        resolve(availableDevices);
      }
    });
  });
}

/**
 * Create a test publisher and subscribe to the publihser's stream
 */
function publishAndSubscribe(OT: OT.Client, options?: NetworkTestOptions) {
  return (session: OT.Session): Promise<PublisherSubscriber> =>
    new Promise((resolve, reject) => {
      type StreamCreatedEvent = OT.Event<'streamCreated', OT.Publisher> & { stream: OT.Stream };
      const containerDiv = document.createElement('div');
      containerDiv.style.position = 'fixed';
      containerDiv.style.bottom = '-1px';
      containerDiv.style.width = '1px';
      containerDiv.style.height = '1px';
      containerDiv.style.opacity = '0';
      document.body.appendChild(containerDiv);

      validateDevices(OT, options)
        .then((availableDevices: AvailableDevices) => {
          if (!Object.keys(availableDevices.video).length) {
            audioOnly = true;
          }
          const publisherOptions: OT.PublisherProperties = {
            resolution: options?.fullHd ? FULL_HD_RESOLUTION : HD_RESOUTION,
            scalableVideo: options?.scalableVideo,
            width: '100%',
            height: '100%',
            insertMode: 'append',
            showControls: false,
          };
          if (options && options.audioSource) {
            publisherOptions.audioSource = options.audioSource;
          }
          if (options && options.videoSource) {
            publisherOptions.videoSource = options.videoSource;
          }
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
                { testNetwork: true, insertMode: 'append', subscribeToAudio: true, subscribeToVideo: true },
                (subscribeError?: OT.OTError) => {
                  return subscribeError ?
                    reject(new e.SubscribeToSessionError(subscribeError.message)) :
                    resolve({ publisher, subscriber });
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
  credentials: OT.SessionCredentials,
  options?: NetworkTestOptions): Promise<PublisherSubscriber> {
  return new Promise((resolve, reject) => {
    connectToSession(session, credentials.token)
      .then(publishAndSubscribe(OT, options))
      .then(resolve)
      .catch(reject);
  });
}

function buildResults(builder: QualityTestResultsBuilder): QualityTestResults {
  const baseProps: (keyof AverageStats)[] = ['bitrate', 'packetLossRatio', 'supported', 'reason', 'mos'];
  builder.state.stats.audio.mos = builder.state.audioQualityScore();
  builder.state.stats.video.mos = builder.state.videoQualityScore();
  if (builder.state.stats.audio.mos >= config.qualityThresholds.audio[0].minMos) {
    builder.state.stats.audio.supported = true;
  } else {
    builder.state.stats.audio.supported = false;
    builder.state.stats.audio.reason = config.strings.bandwidthLow;
  }
  return {
    audio: pick(baseProps, builder.state.stats.audio),
    video: pick(baseProps.concat([
      'frameRate', 'qualityLimitationReason', 'recommendedResolution', 'recommendedFrameRate',
    ]),
    builder.state.stats.video),
  };
}

function isAudioQualityAcceptable(results: QualityTestResults): boolean {
  return !!results.audio.mos && (results.audio.mos >= config.qualityThresholds.audio[0].minMos);
}

/**
 * Clean subscriber objects before disconnecting from the session
 * @param session
 * @param subscriber
 */
function cleanSubscriber(session: OT.Session, subscriber: OT.Subscriber) {
  return new Promise((resolve) => {
    subscriber.on('destroyed', () => {
      resolve();
    });
    if (!subscriber) {
      resolve();
    }
    session.unsubscribe(subscriber);
  });
}

/**
 * Clean publisher objects before disconnecting from the session
 * @param publisher
 */
function cleanPublisher(session: OT.Session, publisher: OT.Publisher) {
  return new Promise((resolve) => {
    publisher.on('destroyed', () => {
      resolve();
    });
    if (!publisher) {
      resolve();
    }
    session.unpublish(publisher);
  });
}

function checkSubscriberQuality(
  OT: OT.Client,
  session: OT.Session,
  credentials: OT.SessionCredentials,
  options?: NetworkTestOptions,
  onUpdate?: UpdateCallback<UpdateCallbackStats>,
  audioOnlyFallback?: boolean,
): Promise<QualityTestResults> {

  let mosEstimatorTimeoutId: number;

  return new Promise((resolve, reject) => {
    subscribeToTestStream(OT, session, credentials, options)
      .then(({ publisher, subscriber }: PublisherSubscriber) => {
        if (!subscriber) {
          reject(new e.MissingSubscriberError());
        } else {
          try {
            const builder: QualityTestResultsBuilder = {
              state: new MOSState(audioOnlyFallback),
              ... { subscriber },
              ... { credentials },
            };

            const getStatsListener = (
              error?: OT.OTError,
              subscriberStats?: OT.SubscriberStats,
              publisherStats?: OT.PublisherStats,
            ) => {
              if (subscriberStats && publisherStats && onUpdate) {
                const updateStats = getUpdateCallbackStats(subscriberStats, publisherStats, audioOnly ?
                  'audio-only' :
                  'audio-video'
                );
                onUpdate(updateStats);
              }
            };

            const processResults = () => {
              const audioVideoResults: QualityTestResults = buildResults(builder);
              if (!audioOnly && !isAudioQualityAcceptable(audioVideoResults) && !stopTestCalled) {
                audioOnly = true;
                // We don't want to lose the videoResults.
                const videoResults = audioVideoResults.video;
                checkSubscriberQuality(OT, session, credentials, options, onUpdate, true)
                  .then((results: QualityTestResults) => {
                    results.video = videoResults;
                    resolve(results);
                  });
              } else {
                session.on('sessionDisconnected', () => {
                  resolve(audioVideoResults);
                  session.off();
                });
                cleanSubscriber(session, subscriber)
                  .then(() => cleanPublisher(session, publisher))
                  .then(() => session.disconnect());
              }
            };

            stopTest = () => {
              clearTimeout(mosEstimatorTimeoutId);
              processResults();
            };

            const resultsCallback: MOSResultsCallback = () => {
              clearTimeout(mosEstimatorTimeoutId);
              processResults();
            };

            subscriberMOS(builder.state, subscriber, publisher, getStatsListener, resultsCallback);

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
        let sessionOptions: OT.InitSessionOptions = {};
        if (options && options.initSessionOptions) {
          sessionOptions = options.initSessionOptions;
        }
        if (options && options.proxyServerUrl) {
          // eslint-disable-next-line no-prototype-builtins
          if (!OT.hasOwnProperty('setProxyUrl')) { // Fallback for OT.version < 2.17.4
            sessionOptions.proxyUrl = options.proxyServerUrl;
          }
        }
        const session = OT.initSession(credentials.apiKey, credentials.sessionId, sessionOptions);
        checkSubscriberQuality(OT, session, credentials, options, onUpdate)
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
