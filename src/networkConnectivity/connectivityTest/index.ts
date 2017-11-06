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
import * as e from '../../errors';
import { get, getOrElse } from '../../util';
import {
  NetworkConnectivityWarning,
  AudioDeviceNotAvailableWarning,
  VideoDeviceNotAvailableWarning,
} from '../../warnings';

type UnavailableDeviceWarnings = {
  audio: null | AudioDeviceNotAvailableWarning,
  video: null | VideoDeviceNotAvailableWarning,
};

interface CreateLocalPublisherResults {
  publisher: OT.Publisher;
  warnings: NetworkConnectivityWarning[];
}

interface PublishToSessionResults extends CreateLocalPublisherResults {
  session: OT.Session;
}

const defaultSubsriberOptions = {
  testNetwork: true,
  audioVolume: 0,
};

const hasCode = (obj: OT.OTError, code: number): Boolean => get('code', obj) === code;

const connectToSession = ({ apiKey, sessionId, token }: SessionCredentials): Promise<OT.Session> =>
  new Promise((resolve, reject) => {
    const session = OT.initSession(apiKey, sessionId);
    session.connect(token, (error?: OT.OTError) => {
      if (error && error.code === 1004) {
        reject(new e.FailedConnectToSessionTokenError());
      } else if (error && error.code === 1005) {
        reject(new e.FailedConnectToSessionSessionIdError());
      } else if (error && error.code === 1006) {
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

    OT.getDevices((error: OT.OTError, devices: OT.Device[]) => {
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
          audioPreference && !audioPreferenceAvailable ? new AudioDeviceNotAvailableWarning(audioPreference) : null;
        const videoWarning =
          videoPreference && !videoPreferenceAvailable ? new VideoDeviceNotAvailableWarning(videoPreference) : null;

        const warnings: UnavailableDeviceWarnings = { audio: audioWarning, video: videoWarning };
        resolve(warnings);
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
            const warningList: NetworkConnectivityWarning[] = Object.values(warnings).filter(w => w !== null);
            resolve({ ...{ publisher }, warnings: warningList });
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
        session.publish(publisher, (error: OT.OTError) => {
          if (error && hasCode(error, 1010)) {
            reject(new e.FailedPublishToSessionNotConnectedError());
          }
          if (error && hasCode(error, 1500)) {
            reject(new e.FailedPublishToSessionPermissionOrTimeoutError());
          }
          if (error && hasCode(error, 1601)) {
            reject(new e.FailedPublishToSessionNetworkError());
          } else if (error) {
            reject(new e.FailedPublishToSessionError());
          } else {
            resolve({ ...{ session }, ...{ publisher }, ...{ warnings } });
          }
        });
      }).catch(reject);
  });

// /**
//  * @param {Object} options
//  * @param {Session} options.session
//  * @param {Publisher} options.publisher
//  */
// const checkSubscribeToSession = (options: { session: OT.Session, publisher: OT.Publisher }) =>
//   new Promise((resolve, reject) => {
//     const subOpts = Object.assign({}, defaultSubsriberOptions);
//     const { session, publisher } = options;
//     // The null in the argument is the element selector to insert the subscriber UI
//     if (!publisher.stream) {
//       return reject(new e.NetworkConnectivityError('ahh'));
//     }

//     const subscriber = session.subscribe(publisher.stream, undefined, subOpts, (error: OT.OTError) => {
//       if (error && error.code === 1600) {
//         reject(new e.FailedSubscribeToStreamNetworkError());
//       } else {
//         resolve(Object.assign({}, options, { subscriber }));
//       }
//     });

//   });



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
      .then(onSuccess)
      .catch(onFailure);

  });

export default checkConnectivity;
