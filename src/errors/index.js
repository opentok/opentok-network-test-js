
export class NetworkConnectivityError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

export class InvalidSessionCredentialsError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'NetworkConnectivity requires an apiKey, sessionId, and token.';
  }
}

// TODO: Do we want to check the arity of callback functions?
export class InvalidOnStatusCallback extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'The onStatus callback must be a function.';
  }
}
export class InvalidOnCompleteCallback extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'The onComplete callback must be a function.';
  }
}

export class UnsupportedBrowserError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'This browser is not supported by OpenTok.';
  }
}

export class NoVideoCaptureDevicesError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'This browser has no video capture devices';
  }
}

export class NoAudioCaptureDevicesError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'This browser has no audio capture devices.';
  }
}

export class MissingCaptureDevicesError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'This browser is missing media capture devices for audio or video.';
  }
}

export class FailedCreateLocalPublisherError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'Failed to create local publisher.';
  }
}

export class FailedConnectToSessionTokenError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'Precall failed to connect to the session due to an incorrect token.';
  }
}

export class FailedConnectToSessionSessionIdError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'Precall failed to connect to the session due to an incorrect session Id.';
  }
}

export class FailedConnectToSessionNetworkError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'Precall failed to connect to the session due to a network error.';
  }
}

export class FailedPublishToSessionNotConnectedError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'Precall failed to publish to the session because it was not connected.';
  }
}

export class FailedPublishToSessionPermissionOrTimeoutError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'Precall failed to publish to the session due a permissions error or timeout.';
  }
}

export class FailedPublishToSessionNetworkError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'Precall failed to publish to the session due a network error.';
  }
}

export class FailedSubscribeToStreamNetworkError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'Precall failed to subscribe to a stream due a network error.';
  }
}

export class FailedCheckPublishToSessionError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'Precall encountered an unknown error while attempting to publish to a session.';
  }
}

export class FailedCheckSubscribeToSessionError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'Precall encountered an unknown error while attempting to subscribe to a session.';
  }
}

export class FailedCheckSubscriberQualityGetStatsError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'Precall failed to get network stats for a subscriber.';
  }
}

export class FailedCheckSubscriberQualityMissingSubscriberError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'Call checkSubscribeToSession before calling checkSubscriberQuality.';
  }
}

export class FailedDestroyPrecallObjectsError extends NetworkConnectivityError {
  constructor() {
    super();
    this.message = 'Precall failed to teardown some OpenTok objects.';
  }
}

