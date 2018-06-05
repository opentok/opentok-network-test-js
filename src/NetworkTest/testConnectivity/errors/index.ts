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
  constructor(message: string, name?: string) {
    super(message, name || 'ConnectivityError');
  }
}

/**
 * API Connectivity Error
 */
export class APIConnectivityError extends ConnectivityError {
  constructor() {
    const message = 'Failed to connect to OpenTOK API Server';
    super(message, 'APIConnectivityError');
  }
}

/**
 * Session Errors
 */
export class ConnectToSessionError extends ConnectivityError {
  constructor(message?: string, name?: string) {
    const defaultMessage = 'Failed to connect to the session due to a network error.';
    super(message || defaultMessage, name || 'ConnectToSessionError');
  }
}

export class ConnectToSessionTokenError extends ConnectToSessionError {
  constructor() {
    super('Failed to connect to the session due to an invalid token.',
      'ConnectToSessionTokenError');
  }
}

export class ConnectToSessionSessionIdError extends ConnectToSessionError {
  constructor() {
    super('Failed to connect to the session due to an invalid session ID.',
      'ConnectToSessionSessionIdError');
  }
}

export class ConnectToSessionNetworkError extends ConnectToSessionError {
  constructor() {
    super('Failed to connect to the session due to a network error.',
      'ConnectToSessionNetworkError');
  }
}

/**
 * Missing Device Errors
 */

export class MediaDeviceError extends ConnectivityError {
  constructor(message?: string, name?: string) {
    const defaultMessage = 'OpenTok failed to find media devices for this browser.';
    super(message || defaultMessage, name || 'MediaDeviceError');
  }
}

export class FailedToObtainMediaDevices extends MediaDeviceError {
  constructor() {
    super('Failed to obtain media devices.', 'FailedToObtainMediaDevices');
  }
}

export class NoVideoCaptureDevicesError extends MediaDeviceError {
  constructor() {
    super('This browser has no video capture devices', 'NoVideoCaptureDevicesError');
  }
}

export class NoAudioCaptureDevicesError extends MediaDeviceError {
  constructor() {
    super('This browser has no audio capture devices.', 'NoAudioCaptureDevicesError');
  }
}

/**
 * Publishing Errors
 */

export class PublishToSessionError extends ConnectivityError {
  constructor(message?: string, name?: string) {
    const defaultMessage = 'Encountered an unknown error while attempting to publish to a session.';
    super(message || defaultMessage, name || 'PublishToSessionError');
  }
}

export class FailedMessagingServerTestError extends PublishToSessionError {
  constructor() {
    const message = 'Failed to connect to media server due to messaging server connection failure';
    super(message, 'FailedMessagingServerTestError');
  }
}

export class FailedToCreateLocalPublisher extends PublishToSessionError {
  constructor() {
    super('Failed to create a local publisher object.', 'FailedToCreateLocalPublisher');
  }
}

export class PublishToSessionNotConnectedError extends PublishToSessionError {
  constructor() {
    super('Precall failed to publish to the session because it was not connected.',
      'PublishToSessionNotConnectedError');
  }
}

export class PublishToSessionPermissionOrTimeoutError extends PublishToSessionError {
  constructor() {
    super('Precall failed to publish to the session due a permissions error or timeout.',
      'PublishToSessionPermissionOrTimeoutError');
  }
}

export class PublishToSessionNetworkError extends PublishToSessionError {
  constructor() {
    super('Precall failed to publish to the session due a network error.',
      'PublishToSessionNetworkError');
  }
}

/**
 * Subscribing Errors
 */
export class SubscribeToSessionError extends ConnectivityError {
  constructor(message?: string) {
    const defaultMessage = 'Encountered an unknown error while attempting to subscribe to a session.';
    super(message || defaultMessage, 'SubscribeToSessionError');
  }
}

/**
 * Logger Server Error
 */
export class LoggingServerConnectionError extends ConnectivityError {
  constructor(){
    super('Failed to connect to the OpenTok logging server.', 'LoggingServerConnectionError');
  }
}
