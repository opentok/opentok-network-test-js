import connectivityTest from './connectivityTest';
import { IncompleteSessionCredentialsError, InvalidOnStatusCallback, InvalidOnCompleteCallback } from '../errors';
import { getOrElse } from '../util';

export default class NetworkConnectivity {

  credentials: SessionCredentials;
  environment: OpenTokEnvironment;

  /**
   * Returns an instance of NetworkConnectivity
   */
  constructor(credentials: SessionCredentials, options?: { environment: OpenTokEnvironment }) {
    this.validateCredentials(credentials);
    this.credentials = credentials;
    this.environment = getOrElse('standard', 'environment', options);
  }

  private validateCredentials (credentials: SessionCredentials) {
    if (!credentials || !credentials.apiKey || !credentials.sessionId || !credentials.token) {
      throw new IncompleteSessionCredentialsError();
    }
  }

  private validateCallbacks(onStatus?: StatusCallback, onComplete?: CompletionCallback<any>){
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
    console.log(this.credentials);
  }

  /**
   * This method checks to see if the client can connect to TokBox servers required for using OpenTok
   */
  checkConnectivity(
    deviceOptions?: DeviceOptions,
    onStatus?: StatusCallback,
    onComplete?: CompletionCallback<any>): Promise<any> {
    this.validateCallbacks(onStatus, onComplete);
    return connectivityTest(this.credentials, this.environment, deviceOptions, onStatus, onComplete);
  }
}

