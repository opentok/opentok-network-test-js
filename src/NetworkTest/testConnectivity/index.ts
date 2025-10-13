/**
 * @module Test/Connectivity
 * @preferred
 *
 * Defines the methods required for the Connectivity Test Flow
 */

/**
 * Connectivity Test Flow
 */
import axios from 'axios';
import * as Promise from 'promise';
/* tslint:disable */
import OTKAnalytics = require('opentok-solutions-logging');
/* tslint:enable */
import {
  NetworkTestOptions,
} from '../index';
import * as e from './errors';
import { OTErrorType, errorHasName } from '../errors/types';
import { mapErrors, FailureCase } from './errors/mapping';
import { getOr } from '../util';
import { SessionCredentials, InitSessionOptions } from '../types/session';
import { PermissionDeniedError } from '../errors';

type AV = 'audio' | 'video';
type CreateLocalPublisherResults = { publisher: OT.Publisher };
type PublishToSessionResults = { session: OT.Session } & CreateLocalPublisherResults;
type SubscribeToSessionResults = { subscriber: OT.Subscriber } & PublishToSessionResults;
type DeviceMap = { [deviceId: string]: OT.Device };
type AvailableDevices = { audio: DeviceMap; video: DeviceMap };

export type ConnectivityTestResults = {
  success: boolean;
  failedTests: FailureCase[];
};

/**
 * Disconnect from a session. Once disconnected, remove all session
 * event listeners and invoke the provided callback function.
 */
function disconnectFromSession(session: OT.Session) {
  return new Promise((resolve) => {
    session.on('sessionDisconnected', () => {
      session.off();
      resolve();
    });
    session.disconnect();
  });
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

function cleanPublisher(publisher: OT.Publisher) {
  return new Promise((resolve) => {
    publisher.on('destroyed', () => {
      resolve();
    });
    if (!publisher) {
      resolve();
    }
    publisher.destroy();
  });
}

/**
 * Attempt to connect to the OpenTok sessionope
 */
function connectToSession(
  OTInstance: typeof OT,
  { apiKey, sessionId, token }: SessionCredentials,
  options?: NetworkTestOptions,
): Promise<OT.Session> {
  return new Promise((resolve, reject) => {
    let sessionOptions: InitSessionOptions = {};
    if (options && options.initSessionOptions) {
      sessionOptions = options.initSessionOptions;
    }
    if (options && options.proxyServerUrl) {
      // eslint-disable-next-line no-prototype-builtins
      if (!OTInstance.hasOwnProperty('setProxyUrl')) { // Fallback for OT.version < 2.17.4
        sessionOptions.proxyUrl = options.proxyServerUrl;
      }
    }
    const session = OTInstance.initSession(apiKey, sessionId, sessionOptions);
    session.connect(token, (error?: OT.OTError) => {
      if (errorHasName(error, OTErrorType.OT_AUTHENTICATION_ERROR)) {
        reject(new e.ConnectToSessionTokenError());
      } else if (errorHasName(error, OTErrorType.OT_INVALID_SESSION_ID)) {
        reject(new e.ConnectToSessionSessionIdError());
      } else if (errorHasName(error, OTErrorType.OT_CONNECT_FAILED)) {
        reject(new e.ConnectToSessionNetworkError());
      } else if (errorHasName(error, OTErrorType.OT_INVALID_HTTP_STATUS)) {
        reject(new e.APIConnectivityError());
      } else if (error) {
        reject(new e.ConnectToSessionError());
      } else {
        resolve(session);
      }
    });
  });
}

/**
 * Ensure that audio and video devices are available
 */
function validateDevices(OTInstance: typeof OT): Promise<AvailableDevices> {
  return new Promise((resolve, reject) => {
    OTInstance.getDevices((error?: OT.OTError, devices: OT.Device[] = []) => {

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

        if (!Object.keys(availableDevices.audio).length && !Object.keys(availableDevices.video).length) {
          reject(new e.FailedToObtainMediaDevices());
        } else {
          resolve(availableDevices);
        }
      }
    });
  });
}

/**
 * Create a local publisher object using any specified device options
 */
function checkCreateLocalPublisher(
  OTInstance: typeof OT,
  options?: NetworkTestOptions,
): Promise<CreateLocalPublisherResults> {
  return new Promise((resolve, reject) => {
    validateDevices(OTInstance)
      .then((availableDevices: AvailableDevices) => {
        const publisherDiv = document.createElement('div');
        publisherDiv.style.position = 'fixed';
        publisherDiv.style.bottom = '-1px';
        publisherDiv.style.width = '1px';
        publisherDiv.style.height = '1px';
        publisherDiv.style.opacity = '0.01';
        document.body.appendChild(publisherDiv);
        const publisherOptions: OT.PublisherProperties = {
          width: '100%',
          height: '100%',
          insertMode: 'append',
          showControls: false,
          scalableVideo: false,
        };
        if (options && options.audioSource) {
          publisherOptions.audioSource = options.audioSource;
        }
        if (options && options.videoSource) {
          publisherOptions.videoSource = options.videoSource;
        }
        if (options && options.audioOnly) {
          publisherOptions.videoSource = null;
        }
        if (!Object.keys(availableDevices.audio).length) {
          publisherOptions.audioSource = null;
        }
        if (!Object.keys(availableDevices.video).length) {
          publisherOptions.videoSource = null;
        }
        if (options && options.scalableVideo) {
          publisherOptions.scalableVideo = options.scalableVideo;
        }
        const publisher = OTInstance.initPublisher(publisherDiv, publisherOptions, (error?: OT.OTError) => {
          if (!error) {
            resolve({ publisher });
          } else {
            // Clean up the DOM element
            publisherDiv.parentNode?.removeChild(publisherDiv);

            if (error && (error.name === 'OT_USER_MEDIA_ACCESS_DENIED' ||
                (error.message && (error.message.toLowerCase().includes('permission') ||
                error.message.toLowerCase().includes('access denied') ||
                error.message.toLowerCase().includes('not allowed'))))) {
              reject(new PermissionDeniedError());
            } else {
              reject(new e.FailedToCreateLocalPublisher());
            }
          }
        });
        publisher.on('streamCreated', () => {
          publisherDiv.style.visibility = 'hidden';
        });
      })
      .catch(reject);
  });
}

/**
 * Attempt to publish to the session
 */
function checkPublishToSession(
  OTInstance: typeof OT, session: OT.Session,
  options?: NetworkTestOptions,
): Promise<PublishToSessionResults> {
  return new Promise((resolve, reject) => {
    const disconnectAndReject = (rejectError: Error) => {
      disconnectFromSession(session).then(() => {
        reject(rejectError);
      });
    };
    checkCreateLocalPublisher(OTInstance, options)
      .then(({ publisher }: CreateLocalPublisherResults) => {
        session.publish(publisher, (error?: OT.OTError) => {
          if (error) {
            if (errorHasName(error, OTErrorType.NOT_CONNECTED)) {
              disconnectAndReject(new e.PublishToSessionNotConnectedError());
            } else if (errorHasName(error, OTErrorType.UNABLE_TO_PUBLISH)) {
              disconnectAndReject(
                new e.PublishToSessionPermissionOrTimeoutError());
            } else if (error) {
              disconnectAndReject(new e.PublishToSessionError());
            }
          } else {
            resolve({ ...{ session }, ...{ publisher } });
          }
        });
      }).catch((error: e.ConnectivityError) => {
        disconnectAndReject(error);
      });
  });
}

/**
 * Attempt to subscribe to our publisher
 */
function checkSubscribeToSession({ session, publisher }: PublishToSessionResults): Promise<SubscribeToSessionResults> {
  return new Promise((resolve, reject) => {
    const config = { testNetwork: true, audioVolume: 0 };
    const disconnectAndReject = (rejectError: Error) => {
      cleanPublisher(publisher)
        .then(() => disconnectFromSession(session))
        .then(() => {
          reject(rejectError);
        });
    };
    if (!publisher.stream) {
      disconnectAndReject(new e.SubscribeToSessionError());
    } else {
      const subscriberDiv = document.createElement('div');
      const subscriber = session.subscribe(publisher.stream, subscriberDiv, config, (error?: OT.OTError) => {
        if (error) {
          disconnectAndReject(new e.SubscribeToSessionError());
        } else {
          resolve({ ...{ session }, ...{ publisher }, ...{ subscriber } });
        }
      });
    }
  });
}

/**
 * Attempt to connect to the tokbox client logging server
 */
function checkLoggingServer(OTInstance: typeof OT, options?: NetworkTestOptions, input?: SubscribeToSessionResults):
Promise<SubscribeToSessionResults> {
  return new Promise((resolve, reject) => {
    const loggingUrl =
      `${getOr('', 'properties.loggingURL', OTInstance)}/logging/ClientEvent`; // https://hlg.tokbox.com/prod
    const url = options && options.proxyServerUrl &&
      `${options.proxyServerUrl}/${loggingUrl.replace('https://', '')}` || loggingUrl;
    const handleError = () => reject(new e.LoggingServerConnectionError());

    axios.post(url)
      .then(response => response.status === 200 ? resolve(input) : handleError())
      .catch(handleError);

  });
}

/**
 * This method checks to see if the client can connect to TokBox servers required for using OpenTok
 */
export function testConnectivity(
  OTInstance: typeof OT,
  credentials: SessionCredentials,
  otLogging: OTKAnalytics,
  options?: NetworkTestOptions,
): Promise<ConnectivityTestResults> {
  return new Promise((resolve, reject) => {
    const onSuccess = (flowResults: SubscribeToSessionResults) => {
      const results: ConnectivityTestResults = {
        success: true,
        failedTests: [],
      };
      otLogging.logEvent({ action: 'testConnectivity', variation: 'Success' });
      return cleanSubscriber(flowResults.session, flowResults.subscriber)
        .then(() => cleanPublisher(flowResults.publisher))
        .then(() => disconnectFromSession(flowResults.session))
        .then(() => resolve(results));
    };

    const onFailure = (error: Error) => {
      // Handle permission denied errors specially - reject to pass to sample app
      if (error.name === 'PermissionDeniedError') {
        reject(error);
        return;
      }

      const handleResults = (...errors: e.ConnectivityError[]) => {
        /**
         * If we have a messaging server failure, we will also fail the media
         * server test by default.
         */
        const baseFailures: FailureCase[] = mapErrors(...errors);
        const messagingFailure = baseFailures.find(c => c.type === 'messaging');
        const failedTests = [
          ...baseFailures,
          ...messagingFailure ? mapErrors(new e.FailedMessagingServerTestError()) : [],
        ];

        const results = {
          failedTests,
          success: false,
        };
        otLogging.logEvent({ action: 'testConnectivity', variation: 'Success' });
        resolve(results);
      };

      /**
       * If we encounter an error before testing the connection to the logging server, let's perform
       * that test as well before returning results.
       */
      if (error.name === 'LoggingServerConnectionError') {
        handleResults(error);
      } else {
        checkLoggingServer(OTInstance, options)
          .then(() => handleResults(error))
          .catch((loggingError: e.LoggingServerConnectionError) => handleResults(error, loggingError));
      }
    };

    connectToSession(OTInstance, credentials, options)
      .then((session: OT.Session) => checkPublishToSession(OTInstance, session, options))
      .then(checkSubscribeToSession)
      .then((results: SubscribeToSessionResults) => checkLoggingServer(OTInstance, options, results))
      .then(onSuccess)
      .catch(onFailure);
  });
}
