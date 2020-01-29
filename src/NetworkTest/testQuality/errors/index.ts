/**
 * @module Errors/Quality
 */

/**
 * Define errors for Connectivity Test
 */

import { NetworkTestError } from '../../errors';
import { ErrorNames } from '../../errors/types';

 /**
  * Base class for errors used throughout Network Quality test.
  */
export class QualityTestError extends NetworkTestError {
  constructor(message: string, name: string) {
    super(message, name || ErrorNames.QUALITY_TEST_ERROR);
  }
}

/**
 * Browser Error
 */
export class UnsupportedBrowserError extends QualityTestError {
  constructor(browser: string) {
    const message =
      `Your current browser (${browser}) does not support the audio-video quality test. Please run the test in a supported browser.`;
    super(message, ErrorNames.UNSUPPORTED_BROWSER);
  }
}

/**
 * Session Errors
 */
export class ConnectToSessionError extends QualityTestError {
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

export class MediaDeviceError extends QualityTestError {
  constructor(message?: string, name?: string) {
    const defaultMessage = 'OpenTok failed to find media devices for this browser.';
    super(message || defaultMessage, name || ErrorNames.MEDIA_DEVICE_ERROR);
  }
}

export class FailedToObtainMediaDevices extends QualityTestError {
  constructor() {
    super('Failed to obtain media devices.', ErrorNames.FAILED_TO_OBTAIN_MEDIA_DEVICES);
  }
}

export class NoVideoCaptureDevicesError extends QualityTestError {
  constructor() {
    super('This browser has no video capture devices', ErrorNames.NO_VIDEO_CAPTURE_DEVICES);
  }
}

export class NoAudioCaptureDevicesError extends QualityTestError {
  constructor() {
    super('This browser has no audio capture devices.', ErrorNames.NO_AUDIO_CAPTURE_DEVICES);
  }
}

/**
 * Publisher Errors
 */

export class PublishToSessionError extends QualityTestError {
  constructor(message?: string, name?: string) {
    const defaultMessage = 'Encountered an unknown error while attempting to publish to a session.';
    super(message || defaultMessage, name || ErrorNames.PUBLISH_TO_SESSION_ERROR);
  }
}

export class InitPublisherError extends PublishToSessionError {
  constructor(message?: string) {
    super(message || 'Failed to initialize publisher.', ErrorNames.INIT_PUBLISHER_ERROR);
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

/**
 * Subscriber Errors
 */
export class SubscribeToSessionError extends QualityTestError {
  constructor(message?: string, name?: string) {
    const defaultMessage = 'Encountered an unknown error while attempting to publish to a session.';
    super(message || defaultMessage, name || ErrorNames.SUBSCRIBE_TO_SESSION_ERROR);
  }
}

export class SubscriberGetStatsError extends SubscribeToSessionError {
  constructor() {
    super('Failed to get network stats for a subscriber.', ErrorNames.SUBSCRIBER_GET_STATS_ERROR);
  }
}

export class MissingSubscriberError extends SubscribeToSessionError {
  constructor() {
    super('Call checkSubscribeToSession before calling checkSubscriberQuality.',
      ErrorNames.MISSING_SUBSCRIBER_ERROR);
  }
}
