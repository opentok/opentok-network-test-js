/**
 * @module Errors/Connectivity
 */

/**
 * Define errors for Connectivity Test
 */

import { NetworkTestError } from '../../errors';
import { ErrorNames } from '../../errors/types';

/**
 * Base class for errors used throughout Network Connectivity test.
 */
export class ConnectivityError extends NetworkTestError {
  constructor(message: string, name?: string) {
    super(message, name || ErrorNames.CONNECTIVITY_ERROR);
  }
}

/**
 * API Connectivity Error
 */
export class APIConnectivityError extends ConnectivityError {
  constructor() {
    const message = 'Failed to connect to OpenTOK API Server';
    super(message, ErrorNames.API_CONNECTIVITY_ERROR);
  }
}

/**
 * Session Errors
 */
export class ConnectToSessionError extends ConnectivityError {
  constructor(message?: string, name?: string) {
    const defaultMessage = 'Failed to connect to the session due to a network error.';
    super(message || defaultMessage, name || ErrorNames.CONNECT_TO_SESSION_ERROR);
  }
}

export class ConnectToSessionTokenError extends ConnectToSessionError {
  constructor() {
    super('Failed to connect to the session due to an invalid token.',
      ErrorNames.CONNECT_TO_SESSION_TOKEN_ERROR);
  }
}

export class ConnectToSessionSessionIdError extends ConnectToSessionError {
  constructor() {
    super('Failed to connect to the session due to an invalid session ID.',
      ErrorNames.CONNECT_TO_SESSION_ID_ERROR);
  }
}

export class ConnectToSessionNetworkError extends ConnectToSessionError {
  constructor() {
    super('Failed to connect to the session due to a network error.',
      ErrorNames.CONNECT_TO_SESSION_NETWORK_ERROR);
  }
}

/**
 * Missing Device Errors
 */

export class MediaDeviceError extends ConnectivityError {
  constructor(message?: string, name?: string) {
    const defaultMessage = 'OpenTok failed to find media devices for this browser.';
    super(message || defaultMessage, name || ErrorNames.MEDIA_DEVICE_ERROR);
  }
}

export class FailedToObtainMediaDevices extends MediaDeviceError {
  constructor() {
    super('Failed to obtain media devices.', ErrorNames.FAILED_TO_OBTAIN_MEDIA_DEVICES);
  }
}

export class NoVideoCaptureDevicesError extends MediaDeviceError {
  constructor() {
    super('This browser has no video capture devices', ErrorNames.NO_VIDEO_CAPTURE_DEVICES);
  }
}

export class NoAudioCaptureDevicesError extends MediaDeviceError {
  constructor() {
    super('This browser has no audio capture devices.', ErrorNames.NO_AUDIO_CAPTURE_DEVICES);
  }
}

/**
 * Publishing Errors
 */

export class PublishToSessionError extends ConnectivityError {
  constructor(message?: string, name?: string) {
    const defaultMessage = 'Encountered an unknown error while attempting to publish to a session.';
    super(message || defaultMessage, name || ErrorNames.PUBLISH_TO_SESSION_ERROR);
  }
}

export class FailedMessagingServerTestError extends PublishToSessionError {
  constructor() {
    const message = 'Failed to connect to media server due to messaging server connection failure';
    super(message, ErrorNames.FAILED_MESSAGING_SERVER_TEST);
  }
}

export class FailedToCreateLocalPublisher extends PublishToSessionError {
  constructor() {
    super('Failed to create a local publisher object.', ErrorNames.FAILED_TO_CREATE_LOCAL_PUBLISHER);
  }
}

export class PublishToSessionNotConnectedError extends PublishToSessionError {
  constructor() {
    super('Precall failed to publish to the session because it was not connected.',
      ErrorNames.PUBLISH_TO_SESSION_NOT_CONNECTED);
  }
}

export class PublishToSessionPermissionOrTimeoutError extends PublishToSessionError {
  constructor() {
    super('Precall failed to publish to the session due a permissions error or timeout.',
      ErrorNames.PUBLISH_TO_SESSION_PERMISSION_OR_TIMEOUT_ERROR);
  }
}

export class PublishToSessionNetworkError extends PublishToSessionError {
  constructor() {
    super('Precall failed to publish to the session due a network error.',
      ErrorNames.PUBLISH_TO_SESSION_NETWORK_ERROR);
  }
}

/**
 * Subscribing Errors
 */
export class SubscribeToSessionError extends ConnectivityError {
  constructor(message?: string) {
    const defaultMessage = 'Encountered an unknown error while attempting to subscribe to a session.';
    super(message || defaultMessage, ErrorNames.SUBSCRIBE_TO_SESSION_ERROR);
  }
}

/**
 * Logger Server Error
 */
export class LoggingServerConnectionError extends ConnectivityError {
  constructor(){
    super('Failed to connect to the OpenTok logging server.', ErrorNames.LOGGING_SERVER_CONNECTION_ERROR);
  }
}
