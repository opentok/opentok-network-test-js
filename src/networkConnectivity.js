

class NetworkConnectivity {

  constructor(credentials) {
     if (!credentials || credentials.apiKey || !credentials.sessionId || !credentials.token) {
        throw new Error('An apiKey, sessionId, and token are required')
     }
     this.credentials = credentials;
  }

  checkConnectivity(credentials, onStatus, onComplete) {
   // ???
  }

  testPublishing(credentials, onStatus, onComplete) {
    // ???
  }
}

module.exports = NetworkConnectivity;
