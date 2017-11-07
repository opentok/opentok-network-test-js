/**
 * @module Test/Connectivity
 * @preferred
 *
 * Defines the methods required for the Connectivity Test Flow
 */

/**
 * Connectivity Test Flow
 */

import * as Promise from 'promise';
import * as OT from '@opentok/client';
import axios from 'axios';
import * as e from '../../errors';
import { ErrorType } from '../../errors/types';
import { get, getOrElse } from '../../util';
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

const LOGGING_URL = 'https://hlg.tokbox.com/prod/logging/ClientEvent';
const DEFAULT_SUBSCRIBER_CONFIG = {
  testNetwork: true,
  audioVolume: 0,
};

const errorHasCode = (error: OT.OTError | null = null, code: number): Boolean => get('code', error) === code;
const errorHasName = (error: OT.OTError | null = null, name: ErrorType): Boolean => get('code', error) === name;

const connectToSession = ({ apiKey, sessionId, token }: SessionCredentials): Promise<OT.Session> =>
  new Promise((resolve, reject) => {
    const session = OT.initSession(apiKey, sessionId);
    session.connect(token, (error?: OT.OTError) => {
      if (errorHasName(error, ErrorType.AUTHENTICATION_ERROR)) {
        reject(new e.FailedConnectToSessionTokenError());
      } else if (errorHasName(error, ErrorType.INVALID_SESSION_ID)) {
        reject(new e.FailedConnectToSessionSessionIdError());
      } else if (errorHasName(error, ErrorType.CONNECT_FAILED)) {
        reject(new e.FailedConnectToSessionNetworkError());
      } else {
        resolve(session);
      }
    });
  });

/**
 * Ensure that audio and video devices are available and validate any specified
 * device preferences are valid.
 */
const validateDevices = (deviceOptions?: DeviceOptions): Promise<UnavailableDeviceWarnings> =>
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

          const audioPreference: string | null = getOrElse(null, 'audioDevice', deviceOptions);
          const videoPreference: string | null = getOrElse(null, 'videoDevice', deviceOptions);
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

          resolve(Object.assign({}, audioWarning, videoWarning));
        }
      }
    });
  });

/**
 * Create a local publisher object with any specified device options
 */
const checkCreateLocalPublisher = (deviceOptions?: DeviceOptions): Promise<CreateLocalPublisherResults> =>
  new Promise((resolve, reject) => {
    validateDevices(deviceOptions)
      .then((warnings: UnavailableDeviceWarnings) => {
        const audioDevice = get('audioDevice', deviceOptions);
        const videoDevice = get('videoDevice', deviceOptions);
        const audioSource = audioDevice && !warnings.audio ? { audioInput: audioDevice } : {};
        const videoSource = videoDevice && !warnings.video ? { videoInput: videoDevice } : {};
        const sourceOptions = { ...audioSource, ...videoSource };
        const publisherOptions = !!Object.keys(sourceOptions).length ? sourceOptions : undefined;
        const publisher = OT.initPublisher(undefined, publisherOptions, (error: OT.OTError) => {
          if (!error) {
            resolve({ ...{ publisher }, warnings: Object.values(warnings) });
          } else {
            reject(new e.FailedCreateLocalPublisherError());
          }
        });
      });
  });

/**
 * Attempt to publish to the session
 */
const checkPublishToSession = (session: OT.Session, deviceOptions?: DeviceOptions): Promise<PublishToSessionResults> =>
  new Promise((resolve, reject) => {
    checkCreateLocalPublisher(deviceOptions)
      .then(({ publisher, warnings }: CreateLocalPublisherResults) => {
        session.publish(publisher, (error?: OT.OTError) => {
          if (errorHasName(error, ErrorType.NOT_CONNECTED)) {
            reject(new e.FailedPublishToSessionNotConnectedError());
          } else if (errorHasName(error, ErrorType.UNABLE_TO_PUBLISH)) {
            reject(new e.FailedPublishToSessionPermissionOrTimeoutError());
          } else if (error) {
            reject(new e.FailedPublishToSessionError());
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
      const subOpts = Object.assign({}, DEFAULT_SUBSCRIBER_CONFIG);
      // The null in the argument is the element selector to insert the subscriber UI
      if (!publisher.stream) {
        reject(new e.FailedSubscribeToSessionError()); // TODO: Specific error for this
      } else {
        const subscriber = session.subscribe(publisher.stream, undefined, subOpts, (error?: OT.OTError) => {
          if (error) {
            reject(new e.FailedSubscribeToSessionError());
          } else {
            resolve({ ...{ session }, ...{ publisher }, ...{ subscriber }, ...{ warnings } });
          }
        });
      }
    });


const checkLoggingServer =
  (input: SubscribeToSessionResults): Promise<SubscribeToSessionResults> =>
    new Promise((resolve, reject) => {
      axios.post('https://hlg.tokbox.com/prod/logging/ClientEvent')
        .then((response) => {
          if (response.status === 200) {
            resolve(input);
          } else {
            const warnings = { warnings: input.warnings.concat(new FailedToConnectToLoggingServer()) };
            reject({ ...input, ...warnings });
          }
        });
    });

/**
 * This method checks to see if the client can connect to TokBox servers required for using OpenTok
 */
const checkConnectivity = (
  credentials: SessionCredentials,
  environment: OpenTokEnvironment,
  deviceOptions?: DeviceOptions,
  onComplete?: CompletionCallback<any>): Promise<any> =>
  new Promise((resolve, reject) => {

    const onSuccess = (result: any) => {
      onComplete && onComplete(null, result);
      return resolve(result);
    };

    const onFailure = (error: e.NetworkConnectivityError) => {
      onComplete && onComplete(error, null);
      return reject(error);
    };

    connectToSession(credentials)
      .then(session => checkPublishToSession(session, deviceOptions))
      .then(checkSubscribeToSession)
      .then(checkLoggingServer)
      .then(onSuccess)
      .catch(onFailure);

  });

export default checkConnectivity;
