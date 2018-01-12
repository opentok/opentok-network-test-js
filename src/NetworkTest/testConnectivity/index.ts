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
type ConnectToAPIServerResults = { session: OT.Session, token: string };
type CreateLocalPublisherResults = { publisher: OT.Publisher };
type PublishToSessionResults = { session: OT.Session } & CreateLocalPublisherResults;
type SubscribeToSessionResults = { subscriber: OT.Subscriber } & PublishToSessionResults;
export type ConnectivityTestResults = {
  success: boolean,
  failedTests: FailureCase[],
};

/**
 * Ensure that we're able to connect to the OpenTok API Server by attempting
 * to connect with a bad token and checking for the appropriate error response.
 */
function connectToAPIServer(
  OT: OpenTok,
  { apiKey, sessionId, token }: SessionCredentials,
): Promise<ConnectToAPIServerResults> {
  const session = OT.initSession(apiKey, sessionId);
  const fauxToken = 'T1==xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx==';
  return new Promise((resolve, reject) => {
    const handleSuccess = () => resolve({ session, token });
    session.connect(fauxToken, (error?: OT.OTError) => {
      if (errorHasName(error, OTErrorType.OT_AUTHENTICATION_ERROR)) {
        handleSuccess();
      } else {
        reject(new e.APIConnectivityError);
      }
    });
  });
}

/**
 * Attempt to connect to the OpenTok session
 */
function connectToSession({ session, token }: ConnectToAPIServerResults): Promise<OT.Session> {
  return new Promise((resolve, reject) => {
    session.connect(token, (error?: OT.OTError) => {
      if (errorHasName(error, OTErrorType.OT_AUTHENTICATION_ERROR)) {
        reject(new e.ConnectToSessionTokenError());
      } else if (errorHasName(error, OTErrorType.INVALID_SESSION_ID)) {
        reject(new e.ConnectToSessionSessionIdError());
      } else if (errorHasName(error, OTErrorType.CONNECT_FAILED)) {
        reject(new e.ConnectToSessionNetworkError());
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
          if (errorHasName(error, OTErrorType.NOT_CONNECTED)) {
            reject(new e.PublishToSessionNotConnectedError());
          } else if (errorHasName(error, OTErrorType.UNABLE_TO_PUBLISH)) {
            reject(new e.PublishToSessionPermissionOrTimeoutError());
          } else if (error) {
            reject(new e.PublishToSessionError());
          } else {
            resolve({ ...{ session }, ...{ publisher } });
          }
        });
      }).catch((error: e.ConnectivityError) => {
        session.disconnect();
        reject(error);
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
      session.disconnect();
      reject(new e.SubscribeToSessionError()); // TODO: Specific error for this
    } else {
      const subscriberDiv = document.createElement('div');
      const subscriber = session.subscribe(publisher.stream, subscriberDiv, config, (error?: OT.OTError) => {
        if (error) {
          session.disconnect();
          reject(new e.SubscribeToSessionError());
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
    if (input) {
      input.session.disconnect();
    }
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
      flowResults.session.disconnect();
      onComplete && onComplete(undefined, results);
      return resolve(results);
    };

    const onFailure = (error: Error) => {

      const handleResults = (...errors: e.ConnectivityError[]) => {
        const results = {
          success: false,
          failedTests: mapErrors(...errors),
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

    connectToAPIServer(OT, credentials)
      .then(connectToSession)
      .then((session: OT.Session) => checkPublishToSession(OT, session))
      .then(checkSubscribeToSession)
      .then((results: SubscribeToSessionResults) => checkLoggingServer(OT, results))
      .then(onSuccess)
      .catch(onFailure);

  });
}
