/**
 * @module NetworkConnectivity
 */

/**
* Define Network Connectivy class
*/

import connectivityTest from './connectivityTest';
import {
  IncompleteSessionCredentialsError,
  InvalidOnStatusCallback,
  InvalidOnCompleteCallback,
  MissingOpenTokInstanceError,
} from '../errors';
import { getOrElse } from '../util';

export default class NetworkConnectivity {

  credentials: SessionCredentials;
  environment: OpenTokEnvironment;
  OT: OpenTok;

  /**
   * Returns an instance of NetworkConnectivity
   */
  constructor(OT: OpenTok, credentials: SessionCredentials, options?: { environment: OpenTokEnvironment }) {
    this.validateOT(OT);
    this.validateCredentials(credentials);
    this.OT = OT;
    this.credentials = credentials;
    this.environment = getOrElse('standard', 'environment', options);
  }

  private validateOT(OT: OpenTok) {
    if (!OT || typeof OT !== 'object') {
      throw new MissingOpenTokInstanceError();
    }
  }

  private validateCredentials(credentials: SessionCredentials) {
    if (!credentials || !credentials.apiKey || !credentials.sessionId || !credentials.token) {
      throw new IncompleteSessionCredentialsError();
    }
  }

  private validateCallbacks(onStatus: StatusCallback | null, onComplete?: CompletionCallback<any>) {
    if (onStatus) {
      if (typeof onStatus !== 'function' || onStatus.length !== 1) {
        throw new InvalidOnStatusCallback();
      }
    }
    if (onComplete) {
      if (typeof onComplete !== 'function' || onComplete.length !== 2) {
        throw new InvalidOnCompleteCallback();
      }
    }
  }

  /**
   * This function runs a test publisher and based on the measured video bitrate,
   * audio bitrate, and the audio packet loss for the published stream, it returns
   * results indicating the recommended supported publisher settings.
   */
  testPublishing(onStatus: StatusCallback, onComplete: CompletionCallback<any>): void {
    this.validateCallbacks(onStatus, onComplete);
    console.log(this.OT, this.credentials);
  }

  /**
   * This method checks to see if the client can connect to TokBox servers required for using OpenTok
   */
  checkConnectivity(
    deviceOptions?: DeviceOptions,
    onComplete?: CompletionCallback<any>): Promise<any> {
    this.validateCallbacks(null, onComplete);
    return connectivityTest(this.OT, this.credentials, this.environment, deviceOptions, onComplete);
  }
}

