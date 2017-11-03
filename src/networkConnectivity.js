
import publisherTest from './publisherTest';
import { validateCallbacks } from './validation';
import { InvalidSessionCredentialsError } from './errors';
import { getOrElse } from './util';

class NetworkConnectivity {
  /**
   * @param {Object} credentials
   * @param {String} credentials.apiKey
   * @param {String} credentials.sessionId
   * @param {String} credentials.token
   * @param {Object} [options]
   * @param {Object} [options.environment] - 'standard' or 'enterprise'
   */
  constructor(credentials, options = null) {
    if (!credentials || credentials.apiKey || !credentials.sessionId || !credentials.token) {
      throw new InvalidSessionCredentialsError();
    }
    this.credentials = credentials;
    this.environment = getOrElse('standard', 'environment', options);
  }

  checkConnectivity(onStatus, onComplete) {
    validateCallbacks(onStatus, onComplete);
    console.log(this.credentials);
  }

  /**
   * @param {Object} [deviceOptions]
   * @param {String} [deviceOptions.audioSource]
   * @param {String} [deviceOptions.videoSource]
   * @param {Function} onStatus
   * @param {Function} onComplete
   * @returns {Promise} <resolve: Object, reject: NetworkConnectivityError>
   */
  testPublishing(deviceOptions, onStatus, onComplete) {
    validateCallbacks(onStatus, onComplete);
    publisherTest(this.credentials, Object.assign({}, this.options, deviceOptions), onStatus, onComplete);
  }
}

export default NetworkConnectivity;
