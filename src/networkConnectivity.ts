
import connectivityTest from './connectivityTest';
import { validateCallbacks } from './validation';
import { InvalidSessionCredentialsError } from './errors';
import { getOrElse } from './util';

class NetworkConnectivity {

  credentials: SessionCredentials
  environment: OpenTokEnvironment

  /**
   * Returns an instance of NetworkConnectivity
   */
  constructor(credentials: SessionCredentials, options: { environment: OpenTokEnvironment } = null) {
    if (!credentials || credentials.apiKey || !credentials.sessionId || !credentials.token) {
      throw new InvalidSessionCredentialsError();
    }
    this.credentials = credentials;
    this.environment = getOrElse('standard', 'environment', options);
  }

  /**
   * This function runs a test publisher and based on the measured video bitrate,
   * audio bitrate, and the audio packet loss for the published stream, it returns
   * results indicating the recommended supported publisher settings.
   */
  testPublishing(onStatus: StatusCallback, onComplete: CompletionCallback<any>): void {
    validateCallbacks(onStatus, onComplete);
    console.log(this.credentials);
  }

  /**
   * This method checks to see if the client can connect to TokBox servers required for using OpenTok
   */
  checkConnectivity(deviceOptions: DeviceOptions, onStatus: StatusCallback, onComplete: CompletionCallback<any>): Promise<any> {
    validateCallbacks(onStatus, onComplete);
    return connectivityTest(this.credentials, Object.assign({}, { environment: this.environment }, deviceOptions), onStatus, onComplete);
  }
}

export default NetworkConnectivity;
