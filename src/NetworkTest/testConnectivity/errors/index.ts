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
  name: string;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ConnectivityError.prototype);
    this.name = this.constructor.name;
  }
}

/**
 * API Connectivity Error
 */
export class APIConnectivityError extends ConnectivityError {
  name: string;
  constructor() {
    const message = 'Failed to connect to OpenTOK API Server';
    super(message);
    Object.setPrototypeOf(this, APIConnectivityError.prototype);
    this.name = this.constructor.name;
  }
}

/**
 * Session Errors
 */
export class ConnectToSessionError extends ConnectivityError {
  name: string;
  constructor(message?: string) {
    const defaultMessage = 'Failed to connect to the session due to a network error.';
    super(message || defaultMessage);
    Object.setPrototypeOf(this, ConnectToSessionError.prototype);
    this.name = this.constructor.name;
  }
}

export class ConnectToSessionTokenError extends ConnectToSessionError {
  constructor() {
    super('Failed to connect to the session due to an invalid token.');
  }
}

export class ConnectToSessionSessionIdError extends ConnectToSessionError {
  constructor() {
    super('Failed to connect to the session due to an invalid session ID.');
  }
}

export class ConnectToSessionNetworkError extends ConnectToSessionError {
  constructor() {
    super('Failed to connect to the session due to a network error.');
    Object.setPrototypeOf(this, ConnectToSessionNetworkError.prototype);
    this.name = this.constructor.name;
  }
}

/**
 * Missing Device Errors
 */

export class MediaDeviceError extends ConnectivityError {
  name: string;
  constructor(message?: string) {
    const defaultMessage = 'OpenTok failed to find media devices for this browser.';
    super(message || defaultMessage);
    Object.setPrototypeOf(this, MediaDeviceError.prototype);
    this.name = this.constructor.name;
  }
}

export class FailedToObtainMediaDevices extends MediaDeviceError {
  constructor() {
    super('Failed to obtain media devices.');
  }
}

export class NoVideoCaptureDevicesError extends MediaDeviceError {
  constructor() {
    super('This browser has no video capture devices');
  }
}

export class NoAudioCaptureDevicesError extends MediaDeviceError {
  constructor() {
    super('This browser has no audio capture devices.');
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

export class FailedMessagingServerTestError extends PublishToSessionError {
  constructor() {
    const message = 'Failed to connect to media server due to messaging server connection failure';
    super(message);
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

/**
 * Logger Server Error
 */
export class LoggingServerConnectionError extends ConnectivityError {
  constructor(){
    super(`Failed to connect to the OpenTok logging server.`);
    Object.setPrototypeOf(this, LoggingServerConnectionError.prototype);
    this.name = this.constructor.name;
  }
}


