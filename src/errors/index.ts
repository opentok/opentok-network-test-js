/**
 * @module Errors
 */

 /**
  * Base class for errors used throughout Network Connectivity tests.
  */
export class NetworkConnectivityError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NetworkConnectivityError.prototype);
    this.name = this.constructor.name;
    this.stack = (new Error(message)).stack;
  }
}

export class MissingOpenTokInstanceError extends NetworkConnectivityError {
  constructor() {
    super('An instance of OT, the OpenTok.js client SDK, is required.');
  }
}

export class IncompleteSessionCredentialsError extends NetworkConnectivityError {
  constructor() {
    super('NetworkConnectivity requires an apiKey, sessionId, and token.');
  }
}

export class InvalidOnStatusCallback extends NetworkConnectivityError {
  constructor() {
    super('The onStatus callback must be a function that accepts a single parameter.');
  }
}
export class InvalidOnCompleteCallback extends NetworkConnectivityError {
  constructor() {
    super('The onComplete callback must be a function that accepts error and results parameters');
  }
}

export class InvalidSessionCredentialsError extends NetworkConnectivityError {
  constructor() {
    super('NetworkConnectivity requires an apiKey, sessionId, and token.');
  }
}

export class UnsupportedBrowserError extends NetworkConnectivityError {
  constructor() {
    super('This browser is not supported by OpenTok.');
  }
}

export class FailedToObtainMediaDevices extends NetworkConnectivityError {
  constructor() {
    super('Failed to obtain media devices from OT.getDevices()');
  }
}

export class NoVideoCaptureDevicesError extends NetworkConnectivityError {
  constructor() {
    super('This browser has no video capture devices');
  }
}

export class NoAudioCaptureDevicesError extends NetworkConnectivityError {
  constructor() {
    super('This browser has no audio capture devices.');
  }
}

export class MissingCaptureDevicesError extends NetworkConnectivityError {
  constructor() {
    super('This browser is missing media capture devices for audio or video.');
  }
}

export class FailedCreateLocalPublisherError extends NetworkConnectivityError {
  constructor() {
    super('Failed to create local publisher.');
  }
}

export class FailedConnectToSessionTokenError extends NetworkConnectivityError {
  constructor() {
    super('Precall failed to connect to the session due to an incorrect token.');
  }
}

export class FailedConnectToSessionSessionIdError extends NetworkConnectivityError {
  constructor() {
    super('Precall failed to connect to the session due to an incorrect session Id.');
  }
}

export class FailedConnectToSessionNetworkError extends NetworkConnectivityError {
  constructor() {
    super('Precall failed to connect to the session due to a network error.');
  }
}

export class FailedConnectToSessionError extends NetworkConnectivityError {
  constructor() {
    super('Precall failed to connect to the session due to a network error.');
  }
}

export class FailedPublishToSessionNotConnectedError extends NetworkConnectivityError {
  constructor() {
    super('Precall failed to publish to the session because it was not connected.');
  }
}

export class FailedPublishToSessionPermissionOrTimeoutError extends NetworkConnectivityError {
  constructor() {
    super('Precall failed to publish to the session due a permissions error or timeout.');
  }
}

export class FailedPublishToSessionNetworkError extends NetworkConnectivityError {
  constructor() {
    super('Precall failed to publish to the session due a network error.');
  }
}

export class FailedSubscribeToStreamNetworkError extends NetworkConnectivityError {
  constructor() {
    super('Precall failed to subscribe to a stream due a network error.');
  }
}

export class FailedPublishToSessionError extends NetworkConnectivityError {
  constructor() {
    super('Precall encountered an unknown error while attempting to publish to a session.');
  }
}

export class FailedSubscribeToSessionError extends NetworkConnectivityError {
  constructor() {
    super('Precall encountered an unknown error while attempting to subscribe to a session.');
  }
}

export class FailedCheckSubscriberQualityGetStatsError extends NetworkConnectivityError {
  constructor() {
    super('Precall failed to get network stats for a subscriber.');
  }
}

export class FailedCheckSubscriberQualityMissingSubscriberError extends NetworkConnectivityError {
  constructor() {
    super('Call checkSubscribeToSession before calling checkSubscriberQuality.');
  }
}

export class FailedDestroyPrecallObjectsError extends NetworkConnectivityError {
  constructor() {
    super('Precall failed to teardown some OpenTok objects.');
  }
}

