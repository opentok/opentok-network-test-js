import 'opentok';
import * as Promise from 'promise';
import * as OT from '@opentok/client';
import * as e from './errors';
import { get, getOrElse } from './util';

const defaultSubsriberOptions = {
  testNetwork: true,
  audioVolume: 0,
};

const hasCode = (obj: OT.OTError, code: number): Boolean => get('code', obj) === code;

const connectToSession = ({ apiKey, sessionId, token }: SessionCredentials): Promise<OT.Session> =>
  new Promise((resolve, reject) => {
    const session = OT.initSession(apiKey, sessionId);
    session.connect(token, (error) => {
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
 * @param {String} type videoInput | audioInput
 * @returns {Promise} <resolve: Array, reject: Error>
 */
const getDevices = (deviceType: InputDeviceType): Promise<OT.Device[]> =>
  new Promise((resolve, reject) => {
    OT.getDevices((error, devices = []) => {
      const deviceList = devices.filter(d => d.kind === deviceType);
      if (deviceList.length !== 0) {
        resolve(deviceList);
      } else if (deviceType === 'videoInput') {
        reject(new e.NoVideoCaptureDevicesError());
      } else if (deviceType === 'audioInput') {
        reject(new e.NoAudioCaptureDevicesError());
      }
    });
  });


const getVideoDevices = (): Promise<OT.Device[]> => getDevices('videoInput');
const getAudioDevices = (): Promise<OT.Device[]> => getDevices('audioInput');

const checkCreateLocalPublisher = (options: { localPublisherOptions: object } = { localPublisherOptions: {} }) => {
  const localPublisherOptions = getOrElse(null, 'localPublisherOptions', options);
  return new Promise((resolve, reject) => {
    getVideoDevices()
      .then(getAudioDevices)
      .then(() => {
        const publisher = OT.initPublisher(localPublisherOptions, (error) => {
          if (!error) {
            resolve(publisher);
          } else {
            reject(new e.FailedCreateLocalPublisherError());
          }
        });
      })
      .catch(e.UnsupportedBrowserError, () => {
        reject(new e.UnsupportedBrowserError());
      })
      .catch(e.NoVideoCaptureDevicesError, () => {
        reject(new e.NoVideoCaptureDevicesError());
      })
      .catch(e.NoAudioCaptureDevicesError, () => {
        reject(new e.NoAudioCaptureDevicesError());
      });
  });
};

/**
 * @param {Object} options
 * @param {Session} options.session - An OpenTok Session object
 */
const checkPublishToSession = (options: { session: OT.Session }): Promise<HasSessionAndPublisher> =>
  new Promise((resolve, reject) => {
    const { session } = options;
    checkCreateLocalPublisher()
      .then((publisher: OT.Publisher) => {
        session.publish(publisher, (error: OT.OTError) => {
          if (hasCode(error, 1010)) {
            reject(new e.FailedPublishToSessionNotConnectedError());
          }
          if (hasCode(error, 1500)) {
            reject(new e.FailedPublishToSessionPermissionOrTimeoutError());
          }
          if (hasCode(error, 1601)) {
            reject(new e.FailedPublishToSessionNetworkError());
          } else {
            resolve(Object.assign({}, options, { publisher }));
          }
        });
      })
      .catch((exception) => {
        if (exception instanceof e.NetworkConnectivityError) {
          reject(exception);
        } else {
          reject(new e.FailedCheckPublishToSessionError());
        }
      });
  });

/**
 * @param {Object} options
 * @param {Session} options.session
 * @param {Publisher} options.publisher
 */
const checkSubscribeToSession = (options: { session: OT.Session, publisher: OT.Publisher }) =>
  new Promise((resolve, reject) => {
    const subOpts = Object.assign({}, defaultSubsriberOptions);
    const { session, publisher } = options;
    // The null in the argument is the element selector to insert the subscriber UI
    if (!publisher.stream) {
      return reject(new e.NetworkConnectivityError('ahh'));
    }

    const subscriber = session.subscribe(publisher.stream, undefined, subOpts, (error: OT.OTError) => {
      if (error && error.code === 1600) {
        reject(new e.FailedSubscribeToStreamNetworkError());
      } else {
        resolve(Object.assign({}, options, { subscriber }));
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
  onStatus?: StatusCallback,
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
      .then(checkPublishToSession)
      .then(checkSubscribeToSession)
      .then(onSuccess)
      .catch(onFailure);
  });

export default checkConnectivity;
