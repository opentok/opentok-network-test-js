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
import * as e from './errors';
import { OTErrorType, errorHasName } from '../errors/types';
import { mapErrors, FailureCase } from './errors/mapping';
import { get, getOr } from '../../util';
type CreateLocalPublisherResults = { publisher: OT.Publisher };
type PublishToSessionResults = { session: OT.Session } & CreateLocalPublisherResults;
type SubscribeToSessionResults = { subscriber: OT.Subscriber } & PublishToSessionResults;
export type ConnectivityTestResults = {
  success: boolean,
  failedTests: FailureCase[],
};

/**
 * Attempt to connect to the OpenTok session
 */
function connectToSession(
  OT: OpenTok,
  { apiKey, sessionId, token }: SessionCredentials,
): Promise<OT.Session> {
  return new Promise((resolve, reject) => {
    const session = OT.initSession(apiKey, sessionId);
    session.connect(token, (error?: OT.OTError) => {
      if (errorHasName(error, OTErrorType.OT_AUTHENTICATION_ERROR)) {
        reject(new e.ConnectToSessionTokenError());
      } else if (errorHasName(error, OTErrorType.INVALID_SESSION_ID)) {
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
 * Create a local publisher object using any specified device options
 */
function checkCreateLocalPublisher(OT: OpenTok): Promise<CreateLocalPublisherResults> {
  return new Promise((resolve, reject) => {
    validateDevices(OT)
      .then(() => {
        const publisherDiv = document.createElement('div');
        publisherDiv.style.opacity = '0';
        document.body.appendChild(publisherDiv);
        const publisher = OT.initPublisher(publisherDiv, undefined, (error?: OT.OTError) => {
          if (!error) {
            resolve({ publisher });
          } else {
            reject(new e.FailedToCreateLocalPublisher());
          }
        });
      })
      .catch(reject);
  });
}

/**
 * Attempt to publish to the session
 */
function checkPublishToSession(OT: OpenTok, session: OT.Session): Promise<PublishToSessionResults> {
  return new Promise((resolve, reject) => {
    checkCreateLocalPublisher(OT)
      .then(({ publisher }: CreateLocalPublisherResults) => {
        session.publish(publisher, (error?: OT.OTError) => {
          if (error) {
            session.on('sessionDisconnected', () => {
              if (errorHasName(error, OTErrorType.NOT_CONNECTED)) {
                reject(new e.PublishToSessionNotConnectedError());
              } else if (errorHasName(error, OTErrorType.UNABLE_TO_PUBLISH)) {
                reject(new e.PublishToSessionPermissionOrTimeoutError());
              } else if (error) {
                reject(new e.PublishToSessionError());
              }
            });
            session.disconnect();
          } else {
            resolve({ ...{ session }, ...{ publisher } });
          }
        });
      }).catch((error: e.ConnectivityError) => {
        session.on('sessionDisconnected', () => {
          reject(error);
        });
        session.disconnect();
      });
  });
}

/**
 * Attempt to subscribe to our publisher
 */
function checkSubscribeToSession({ session, publisher }: PublishToSessionResults): Promise<SubscribeToSessionResults> {
  return new Promise((resolve, reject) => {
    const config = { testNetwork: true, audioVolume: 0 };
    if (!publisher.stream) {
      session.on('sessionDisconnected', () => {
        reject(new e.SubscribeToSessionError()); // TODO: Specific error for this
      });
      session.disconnect();
    } else {
      const subscriberDiv = document.createElement('div');
      const subscriber = session.subscribe(publisher.stream, subscriberDiv, config, (error?: OT.OTError) => {
        if (error) {
          session.on('sessionDisconnected', () => {
            reject(new e.SubscribeToSessionError());
          });
          session.disconnect();
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
function checkLoggingServer(OT: OpenTok, input?: SubscribeToSessionResults): Promise<SubscribeToSessionResults> {
  return new Promise((resolve, reject) => {
    const url = `${OT.properties.loggingURL}/logging/ClientEvent`;
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
  OT: OpenTok,
  credentials: SessionCredentials,
  otLogging: OTKAnalytics,
  onComplete?: CompletionCallback<any>): Promise<ConnectivityTestResults> {
  return new Promise((resolve, reject) => {

    const onSuccess = (flowResults: SubscribeToSessionResults) => {
      const results: ConnectivityTestResults = {
        success: true,
        failedTests: [],
      };
      otLogging.logEvent({ action: 'testConnectivity', variation: 'Success' });
      flowResults.session.on('sessionDisconnected', () => {
        onComplete && onComplete(undefined, results);
        return resolve(results);
      });
      flowResults.session.disconnect();
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
        onComplete && onComplete(undefined, results);
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
      .then((session: OT.Session) => checkPublishToSession(OT, session))
      .then(checkSubscribeToSession)
      .then((results: SubscribeToSessionResults) => checkLoggingServer(OT, results))
      .then(onSuccess)
      .catch(onFailure);

  });
}
