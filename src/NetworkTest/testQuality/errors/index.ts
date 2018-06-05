/**
 * @module Errors/Quality
 */

/**
 * Define errors for Connectivity Test
 */

import { NetworkTestError } from '../../errors';

 /**
  * Base class for errors used throughout Network Quality test.
  */
export class QualityTestError extends NetworkTestError {
  constructor(message: string, name: string) {
    super(message, name);
  }
}

/**
 * Browser Error
 */
export class UnsupportedBrowserError extends QualityTestError {
  constructor(browser: string) {
    const message =
      `Your current browser (${browser}) does not support the audio-video quality test. Please run the test in Chrome or Firefox.`;
    super(message, 'UnsupportedBrowserError');
  }
}

/**
 * Session Errors
 */
export class ConnectToSessionError extends QualityTestError {
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

export class MediaDeviceError extends QualityTestError {
  constructor(message?: string, name?: string) {
    const defaultMessage = 'OpenTok failed to find media devices for this browser.';
    super(message || defaultMessage, name || 'MediaDeviceError');
  }
}

export class FailedToObtainMediaDevices extends QualityTestError {
  constructor() {
    super('Failed to obtain media devices.', 'FailedToObtainMediaDevices');
  }
}

export class NoVideoCaptureDevicesError extends QualityTestError {
  constructor() {
    super('This browser has no video capture devices', 'NoVideoCaptureDevicesError');
  }
}

export class NoAudioCaptureDevicesError extends QualityTestError {
  constructor() {
    super('This browser has no audio capture devices.', 'NoAudioCaptureDevicesError');
  }
}

/**
 * Publisher Errors
 */

export class PublishToSessionError extends QualityTestError {
  constructor(message?: string, name?: string) {
    const defaultMessage = 'Encountered an unknown error while attempting to publish to a session.';
    super(message || defaultMessage, name || 'PublishToSessionError');
  }
}

export class InitPublisherError extends PublishToSessionError {
  constructor(message?: string) {
    super(message || 'Failed to initialize publisher.', 'InitPublisherError');
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

/**
 * Subscriber Errors
 */
export class SubscribeToSessionError extends QualityTestError {
  constructor(message?: string, name?: string) {
    const defaultMessage = 'Encountered an unknown error while attempting to publish to a session.';
    super(message || defaultMessage, name || 'SubscribeToSessionError');
  }
}

export class SubscriberGetStatsError extends SubscribeToSessionError {
  constructor() {
    super('Failed to get network stats for a subscriber.', 'SubscriberGetStatsError');
  }
}

export class MissingSubscriberError extends SubscribeToSessionError {
  constructor() {
    super('Call checkSubscribeToSession before calling checkSubscriberQuality.',
      'MissingSubscriberError');
  }
}
