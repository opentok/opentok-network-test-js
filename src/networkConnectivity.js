
import publisherTest from './publisherTest';
import { validateCallbacks } from './validation';
import { InvalidSessionCredentialsError } from './errors';

class NetworkConnectivity {
  constructor(credentials) {
    if (!credentials || credentials.apiKey || !credentials.sessionId || !credentials.token) {
      throw new InvalidSessionCredentialsError();
    }
    this.credentials = credentials;
  }

  checkConnectivity(onStatus, onComplete) {
    validateCallbacks(onStatus, onComplete);
    console.log(this.credentials);
  }

  testPublishing(onStatus, onComplete) {
    validateCallbacks(onStatus, onComplete);
    publisherTest(this.credentials, onStatus, onComplete);
  }
}

export default NetworkConnectivity;
