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
import { OTErrorType } from './errors/types';
import { get, getOr } from '../../util';
import {
  NetworkConnectivityWarning,
  AudioDeviceNotAvailableWarning,
  VideoDeviceNotAvailableWarning,
  FailedToConnectToLoggingServer,
} from '../../warnings';

interface UnavailableDeviceWarnings {
  audio?: AudioDeviceNotAvailableWarning;
  video?: VideoDeviceNotAvailableWarning;
}

interface CreateLocalPublisherResults {
  publisher: OT.Publisher;
  warnings: NetworkConnectivityWarning[];
}

interface PublishToSessionResults extends CreateLocalPublisherResults {
  session: OT.Session;
}

interface SubscribeToSessionResults extends PublishToSessionResults {
  subscriber: OT.Subscriber;
}

interface ConnectivityTestResult {}
interface ConnectivityTestSuccess extends ConnectivityTestResult {
  warnings: NetworkConnectivityWarning[];
}
interface ConnectivityTestFailure extends ConnectivityTestResult {
  passedTests: any[];
  failedAt: e.ConnectivityError;
}

const errorHasName = (error: OT.OTError | null = null, name: OTErrorType): Boolean => get('code', error) === name;

/**
 * Attempt to connect to the OpenTok session
 */
const connectToSession = (OT: OpenTok, { apiKey, sessionId, token }: SessionCredentials): Promise<OT.Session> =>
  new Promise((resolve, reject) => {
    const session = OT.initSession(apiKey, sessionId);
    session.connect(token, (error?: OT.OTError) => {
      if (errorHasName(error, OTErrorType.AUTHENTICATION_ERROR)) {
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

/**
 * Ensure that audio and video devices are available and validate any
 * specified device preferences. Return warnings for any devices preferences
 * that are not available.
 */
const validateDevices = (OT: OpenTok, deviceOptions?: DeviceOptions): Promise<UnavailableDeviceWarnings> =>
  new Promise((resolve, reject) => {

    type DeviceMap = { [deviceId: string]: OT.Device };
    type AvailableDevices = { audio: DeviceMap, video: DeviceMap };

    OT.getDevices((error?: OT.OTError, devices: OT.Device[] = []) => {

      if (error) {
        reject(new e.FailedToObtainMediaDevices());
      } else {

        const availableDevices: AvailableDevices = devices.reduce(
          (acc: AvailableDevices, device: OT.Device) => {
            const type = device.kind === 'audioInput' ? 'audio' : 'video';
            return { ...acc, [type]: { ...acc[type], [device.deviceId]: device } };
          },
          { audio: {}, video: {} },
        );
        if (!Object.keys(availableDevices.audio).length) {
          reject(new e.NoAudioCaptureDevicesError());
        } else if (!Object.keys(availableDevices.video).length) {
          reject(new e.NoVideoCaptureDevicesError());
        } else {

          const audioPreference: string | null = getOr(null, 'audioDevice', deviceOptions);
          const videoPreference: string | null = getOr(null, 'videoDevice', deviceOptions);
          const audioPreferenceAvailable = audioPreference ? availableDevices.audio[audioPreference] : true;
          const videoPreferenceAvailable = videoPreference ? availableDevices.video[videoPreference] : true;

          const audioWarning =
            audioPreference && !audioPreferenceAvailable ?
              { audio: new AudioDeviceNotAvailableWarning(audioPreference) }
              : {};
          const videoWarning =
            videoPreference && !videoPreferenceAvailable ?
              { video: new VideoDeviceNotAvailableWarning(videoPreference) }
              : {};

          resolve({ ...audioWarning, ...videoWarning });
        }
      }
    });
  });

/**
 * Create a local publisher object using any specified device options
 */
const checkCreateLocalPublisher = (OT: OpenTok, deviceOptions?: DeviceOptions): Promise<CreateLocalPublisherResults> =>
  new Promise((resolve, reject) => {
    validateDevices(OT, deviceOptions)
      .then((warnings: UnavailableDeviceWarnings) => {
        const audioDevice = get('audioDevice', deviceOptions);
        const videoDevice = get('videoDevice', deviceOptions);
        const audioSource = audioDevice && !warnings.audio ? { audioInput: audioDevice } : {};
        const videoSource = videoDevice && !warnings.video ? { videoInput: videoDevice } : {};
        const sourceOptions = { ...audioSource, ...videoSource };
        const publisherOptions = !!Object.keys(sourceOptions).length ? sourceOptions : undefined;
        const publisherDiv = document.createElement('div');
        const publisher = OT.initPublisher(publisherDiv, publisherOptions, (error?: OT.OTError) => {
          if (!error) {
            resolve({ ...{ publisher }, warnings: Object.values(warnings) });
          } else {
            reject(new e.FailedToCreateLocalPublisher());
          }
        });
      });
  });

/**
 * Attempt to publish to the session
 */
const checkPublishToSession = (
  OT: OpenTok,
  session: OT.Session,
  deviceOptions?: DeviceOptions): Promise<PublishToSessionResults> =>
  new Promise((resolve, reject) => {
    checkCreateLocalPublisher(OT, deviceOptions)
      .then(({ publisher, warnings }: CreateLocalPublisherResults) => {
        session.publish(publisher, (error?: OT.OTError) => {
          if (errorHasName(error, OTErrorType.NOT_CONNECTED)) {
            reject(new e.PublishToSessionNotConnectedError());
          } else if (errorHasName(error, OTErrorType.UNABLE_TO_PUBLISH)) {
            reject(new e.PublishToSessionPermissionOrTimeoutError());
          } else if (error) {
            reject(new e.PublishToSessionError());
          } else {
            resolve({ ...{ session }, ...{ publisher }, ...{ warnings } });
          }
        });
      }).catch(reject);
  });

/**
 * Attempt to subscribe to our publisher
 */
const checkSubscribeToSession =
  ({ session, publisher, warnings }: PublishToSessionResults): Promise<SubscribeToSessionResults> =>
    new Promise((resolve, reject) => {
      const config = { testNetwork: true, audioVolume: 0 };
      if (!publisher.stream) {
        reject(new e.SubscribeToSessionError()); // TODO: Specific error for this
      } else {
        const subscriberDiv = document.createElement('div');
        const subscriber = session.subscribe(publisher.stream, subscriberDiv, config, (error?: OT.OTError) => {
          if (error) {
            reject(new e.SubscribeToSessionError());
          } else {
            resolve({ ...{ session }, ...{ publisher }, ...{ subscriber }, ...{ warnings } });
          }
        });
      }
    });


/**
 * Attempt to connect to the tokbox client logging server
 */
const checkLoggingServer =
  (OT: OpenTok, input: SubscribeToSessionResults): Promise<SubscribeToSessionResults> =>
    new Promise((resolve, reject) => {
      const url = `${OT.properties.loggingURL}/logging/ClientEvent`;
      const handleFailure = () => {
        const warnings = { warnings: input.warnings.concat(new FailedToConnectToLoggingServer()) };
        resolve({ ...input, ...warnings });
      };
      axios.post(url)
        .then(response => response.status === 200 ? resolve(input) : handleFailure())
        .catch(handleFailure);
    });

/**
 * This method checks to see if the client can connect to TokBox servers required for using OpenTok
 */
const checkConnectivity = (
  OT: OpenTok,
  credentials: SessionCredentials,
  environment: OpenTokEnvironment,
  deviceOptions?: DeviceOptions,
  onComplete?: CompletionCallback<any>): Promise<ConnectivityTestResult> =>
  new Promise((resolve, reject) => {

    const onSuccess = (flowResults: SubscribeToSessionResults) => {
      const results: ConnectivityTestSuccess = { warnings: flowResults.warnings };
      onComplete && onComplete(null, results);
      return resolve(results);
    };

    const onFailure = (error: e.ConnectivityError) => {
      // if (typeof error)
      // onComplete && onComplete(error, null);
      // const failure: ConnectivityTestFailure = {
      //   failedAt: error,
      // };
      return reject(error);
    };


    connectToSession(OT, credentials)
      .then(session => checkPublishToSession(OT, session, deviceOptions))
      .then(checkSubscribeToSession)
      .then(results => checkLoggingServer(OT, results))
      .then(onSuccess)
      .catch(onFailure);

  });

export default checkConnectivity;
