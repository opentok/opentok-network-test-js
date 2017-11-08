/**
 * @module Errors/Connectivity
 */

/**
 * Define errors for Connectivity Test
 */

import { NetworkTestError } from '../../errors';

/**
 * Base class for errors used throughout Network Connectivity test.
 */
export class ConnectivityError extends NetworkTestError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ConnectivityError.prototype);
    this.name = this.constructor.name;
  }
}


/**
 * Session Errors
 */
export class ConnectToSessionError extends ConnectivityError {
  name: string;
  constructor(message?: string) {
    const defaultMessage = 'Precall failed to connect to the session due to a network error.';
    super(message || defaultMessage);
    Object.setPrototypeOf(this, ConnectToSessionError.prototype);
    this.name = this.constructor.name;
  }
}

export class ConnectToSessionTokenError extends ConnectToSessionError {
  constructor() {
    super('Precall failed to connect to the session due to an incorrect token.');
  }
}

export class ConnectToSessionSessionIdError extends ConnectToSessionError {
  constructor() {
    super('Precall failed to connect to the session due to an incorrect session Id.');
  }
}

export class ConnectToSessionNetworkError extends ConnectToSessionError {
  constructor() {
    super('Precall failed to connect to the session due to a network error.');
  }
}

/**
 * Missing Device Errors
 */
export class FailedToObtainMediaDevices extends ConnectivityError {
  constructor() {
    super('Failed to obtain media devices from OT.getDevices()');
  }
}

export class NoVideoCaptureDevicesError extends ConnectivityError {
  constructor() {
    super('This browser has no video capture devices');
  }
}

export class NoAudioCaptureDevicesError extends ConnectivityError {
  constructor() {
    super('This browser has no audio capture devices.');
  }
}

export class MissingCaptureDevicesError extends ConnectivityError {
  constructor() {
    super('This browser is missing media capture devices for audio or video.');
  }
}

/**
 * Publishing Errors
 */

export class PublishToSessionError extends ConnectivityError {
  name: string;
  constructor(message?: string) {
    const defaultMessage = 'Encountered an unknown error while attempting to publish to a session.';
    super(message || defaultMessage);
    Object.setPrototypeOf(this, PublishToSessionError.prototype);
    this.name = this.constructor.name;
  }
}

export class FailedToCreateLocalPublisher extends PublishToSessionError {
  constructor() {
    super('Failed to create a local publisher object.');
  }
}

export class PublishToSessionNotConnectedError extends PublishToSessionError {
  constructor() {
    super('Precall failed to publish to the session because it was not connected.');
  }
}

export class PublishToSessionPermissionOrTimeoutError extends PublishToSessionError {
  constructor() {
    super('Precall failed to publish to the session due a permissions error or timeout.');
  }
}

export class PublishToSessionNetworkError extends PublishToSessionError {
  constructor() {
    super('Precall failed to publish to the session due a network error.');
  }
}

/**
 * Subscribing Errors
 */

export class SubscribeToSessionError extends ConnectivityError {
  name: string;
  constructor(message?: string) {
    const defaultMessage = 'Encountered an unknown error while attempting to subscribe to a session.';
    super(message || defaultMessage);
    Object.setPrototypeOf(this, SubscribeToSessionError.prototype);
    this.name = this.constructor.name;
  }
}

