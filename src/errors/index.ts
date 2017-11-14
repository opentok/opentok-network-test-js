/**
 * @module Errors
 */

import * as Promise from 'promise';

 /**
  * Base class for errors used throughout Network Connectivity tests.
  */
export class NetworkTestError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NetworkTestError.prototype);
    this.name = this.constructor.name;
    this.stack = (new Error(message)).stack;
  }
}

export class MissingOpenTokInstanceError extends NetworkTestError {
  constructor() {
    super('An instance of OT, the OpenTok.js client SDK, is required.');
  }
}

export class IncompleteSessionCredentialsError extends NetworkTestError {
  constructor() {
    super('NetworkTest requires an apiKey, sessionId, and token.');
  }
}

export class InvalidOnUpdateCallback extends NetworkTestError {
  constructor() {
    super('The onUpdatate callback must be a function that accepts a single parameter.');
  }
}
export class InvalidOnCompleteCallback extends NetworkTestError {
  constructor() {
    super('The onComplete callback must be a function that accepts error and results parameters');
  }
}

export class InvalidSessionCredentialsError extends NetworkTestError {
  constructor() {
    super('NetworkTest requires an apiKey, sessionId, and token.');
  }
}

export class UnsupportedBrowserError extends NetworkTestError {
  constructor() {
    super('This browser is not supported by OpenTok.');
  }
}

export class FailedToObtainMediaDevices extends NetworkTestError {
  constructor() {
    super('Failed to obtain media devices from OT.getDevices()');
  }
}

export class NoVideoCaptureDevicesError extends NetworkTestError {
  constructor() {
    super('This browser has no video capture devices');
  }
}

export class NoAudioCaptureDevicesError extends NetworkTestError {
  constructor() {
    super('This browser has no audio capture devices.');
  }
}

export class MissingCaptureDevicesError extends NetworkTestError {
  constructor() {
    super('This browser is missing media capture devices for audio or video.');
  }
}

export class FailedCreateLocalPublisherError extends NetworkTestError {
  constructor() {
    super('Failed to create local publisher.');
  }
}

export class FailedConnectToSessionTokenError extends NetworkTestError {
  constructor() {
    super('Precall failed to connect to the session due to an incorrect token.');
  }
}

export class FailedConnectToSessionSessionIdError extends NetworkTestError {
  constructor() {
    super('Precall failed to connect to the session due to an incorrect session Id.');
  }
}

export class FailedConnectToSessionNetworkError extends NetworkTestError {
  constructor() {
    super('Precall failed to connect to the session due to a network error.');
  }
}

export class FailedConnectToSessionError extends NetworkTestError {
  constructor() {
    super('Precall failed to connect to the session due to a network error.');
  }
}

export class FailedPublishToSessionNotConnectedError extends NetworkTestError {
  constructor() {
    super('Precall failed to publish to the session because it was not connected.');
  }
}

export class FailedPublishToSessionPermissionOrTimeoutError extends NetworkTestError {
  constructor() {
    super('Precall failed to publish to the session due a permissions error or timeout.');
  }
}

export class FailedPublishToSessionNetworkError extends NetworkTestError {
  constructor() {
    super('Precall failed to publish to the session due a network error.');
  }
}

export class FailedSubscribeToStreamNetworkError extends NetworkTestError {
  constructor() {
    super('Precall failed to subscribe to a stream due a network error.');
  }
}

export class FailedPublishToSessionError extends NetworkTestError {
  constructor() {
    super('Precall encountered an unknown error while attempting to publish to a session.');
  }
}

export class FailedSubscribeToSessionError extends NetworkTestError {
  constructor() {
    super('Precall encountered an unknown error while attempting to subscribe to a session.');
  }
}

export class FailedCheckSubscriberQualityGetStatsError extends NetworkTestError {
  constructor() {
    super('Precall failed to get network stats for a subscriber.');
  }
}

export class FailedCheckSubscriberQualityMissingSubscriberError extends NetworkTestError {
  constructor() {
    super('Call checkSubscribeToSession before calling checkSubscriberQuality.');
  }
}

export class FailedDestroyPrecallObjectsError extends NetworkTestError {
  constructor() {
    super('Precall failed to teardown some OpenTok objects.');
  }
}

/* TBD:
export class PrecallError extends Promise.OperationalError {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Promise.OperationalError.captureStackTrace === 'function') {
      Promise.OperationalError.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Promise.OperationalError(message)).stack;
    }
  }
}
*/
