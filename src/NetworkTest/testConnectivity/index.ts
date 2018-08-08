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
import { OT } from '../types/opentok';
import * as e from './errors';
import { OTErrorType, errorHasName } from '../errors/types';
import { mapErrors, FailureCase } from './errors/mapping';
import { getOr } from '../util';

type AV = 'audio' | 'video';
type CreateLocalPublisherResults = { publisher: OT.Publisher };
type PublishToSessionResults = { session: OT.Session } & CreateLocalPublisherResults;
type SubscribeToSessionResults = { subscriber: OT.Subscriber } & PublishToSessionResults;
type DeviceMap = { [deviceId: string]: OT.Device };
type AvailableDevices = { audio: DeviceMap, video: DeviceMap };

export type ConnectivityTestResults = {
  success: boolean,
  failedTests: FailureCase[],
};

/**
 * Disconnect from a session. Once disconnected, remove all session
 * event listeners and invoke the provided callback function.
 */
function disconnectFromSession(session: OT.Session) {
  return new Promise((resolve, reject) => {
    session.on('sessionDisconnected', () => {
      session.off();
      resolve();
    });
    session.disconnect();
  });
}

/**
 * Attempt to connect to the OpenTok sessionope
 */
function connectToSession(
  OT: OT.Client,
  { apiKey, sessionId, token }: OT.SessionCredentials,
): Promise<OT.Session> {
  return new Promise((resolve, reject) => {
    const session = OT.initSession(apiKey, sessionId);
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
  OT: OT.Client,
  options?: NetworkTestOptions,
): Promise<CreateLocalPublisherResults> {
  return new Promise((resolve, reject) => {
    validateDevices(OT)
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
        };
        if (options && options.audioOnly) {
          publisherOptions.videoSource = null;
        }
        if (!Object.keys(availableDevices.audio).length) {
          publisherOptions.audioSource = null;
        }
        if (!Object.keys(availableDevices.video).length) {
          publisherOptions.videoSource = null;
        }
        const publisher = OT.initPublisher(publisherDiv, publisherOptions, (error?: OT.OTError) => {
          if (!error) {
            resolve({ publisher });
          } else {
            reject(new e.FailedToCreateLocalPublisher());
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
  OT: OT.Client, session: OT.Session,
  options?: NetworkTestOptions,
): Promise<PublishToSessionResults> {
  return new Promise((resolve, reject) => {
    const disconnectAndReject = (rejectError: Error) => {
      disconnectFromSession(session).then(() => {
        reject(rejectError);
      });
    };
    checkCreateLocalPublisher(OT, options)
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
      disconnectFromSession(session).then(() => {
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
function checkLoggingServer(OT: OT.Client, input?: SubscribeToSessionResults): Promise<SubscribeToSessionResults> {
  return new Promise((resolve, reject) => {
    const url = `${getOr('', 'properties.loggingURL', OT)}/logging/ClientEvent`;
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
  OT: OT.Client,
  credentials: OT.SessionCredentials,
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
      return disconnectFromSession(flowResults.session).then(() => {
        return resolve(results);
      });
    };

    const onFailure = (error: Error) => {

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
        checkLoggingServer(OT)
          .then(() => handleResults(error))
          .catch((loggingError: e.LoggingServerConnectionError) => handleResults(error, loggingError));
      }
    };

    connectToSession(OT, credentials)
      .then((session: OT.Session) => checkPublishToSession(OT, session, options))
      .then(checkSubscribeToSession)
      .then((results: SubscribeToSessionResults) => checkLoggingServer(OT, results))
      .then(onSuccess)
      .catch(onFailure);
  });
}
