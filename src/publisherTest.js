import Promise from 'promise';
import OT from '@opentok/client';
import * as e from './errors';
import { getOrElse } from './util';

const defaultSubsribeOptions = {
  getStatsInterval: 1000,
  getStatsVideoAndAudioTestDuration: 5000,
  getStatsAudioOnlyDuration: 10000,
  subscribeOptions: {
    testNetwork: true,
    audioVolume: 0,
  },
  getStatsListenerInterval: 1000,
};


const connectToSession = ({ apiKey, sessionId, token }) =>
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
const getDevices = type =>
  new Promise((resolve, reject) => {
    OT.getDevices((error, devices = []) => {
      const deviceList = devices.filter(d => d.kind === type);
      if (deviceList.length !== 0) {
        resolve(deviceList);
      } else if (type === 'videoInput') {
        reject(new e.NoVideoCaptureDevicesError('No video capture devices found!'));
      } else if (type === 'audioInput') {
        reject(new e.NoAudioCaptureDevicesError('No audio capture devices found!'));
      }
    });
  });


const getVideoDevices = () => getDevices('videoInput');
const getAudioDevices = () => getDevices('audioInput');

const checkCreateLocalPublisher = (options) => {
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
const checkPublishToSession = options =>
  new Promise((resolve, reject) => {
    const { session } = options;
    checkCreateLocalPublisher()
      .then((localPublisher) => {
        const publisher = session.publish(localPublisher, (error) => {
          if (error && error.code === 1010) {
            reject(new e.FailedPublishToSessionNotConnectedError());
          }
          if (error && error.code === 1500) {
            reject(new e.FailedPublishToSessionPermissionOrTimeoutError());
          }
          if (error && error.code === 1601) {
            reject(new e.FailedPublishToSessionNetworkError());
          } else {
            resolve(Object.asign({}, options, { publisher }));
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
const checkSubscribeToSession = options =>
  new Promise((resolve, reject) => {
    const subOpts = Object.assign({}, defaultSubsribeOptions);
    const { session, publisher } = options;
    // The null in the argument is the element selector to insert the subscriber UI
    const subscriber = session.subscribe(publisher.stream, null, subOpts, (error) => {
      if (error && error.code === 1600) {
        reject(new e.FailedSubscribeToStreamNetworkError());
      } else {
        resolve(Object.assign({}, options, { subscriber }));
      }
    });
  });

/**
 * @param {Object} options
 * @param {String} options.apiKey
 * @param {String} options.sessionId
 * @param {String} options.token
 * @param {Function} [callback] - An optional callback function: (error, results) => void
 * @returns {Promise} <resolve: Object, reject: Error>
 */
const checkConnectivity = (credentials, onStatus, onComplete) =>
  new Promise((resolve, reject) => {

    const onSuccess = (result) => {
      onComplete && onComplete(null, result); // eslint-disable-line no-unused-expressions
      return resolve(result);
    };

    const onFailure = (error) => {
      onComplete && onComplete(error, null); // eslint-disable-line no-unused-expressions
      return reject(error);
    };

    connectToSession(credentials)
      .then(checkPublishToSession)
      .then(checkSubscribeToSession)
      .then(onSuccess)
      .catch(onFailure);
  });

export default checkConnectivity;
