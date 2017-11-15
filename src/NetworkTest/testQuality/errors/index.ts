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
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, QualityTestError.prototype);
    this.name = this.constructor.name;
    this.stack = (new Error(message)).stack;
  }
}

export class SessionConnectionError extends QualityTestError {
  constructor() {
    super('Failed to connect to the OpenTok session.');
  }
}

export class InitPublisherError extends QualityTestError {
  constructor() {
    super('Failed to initialize publisher');
  }
}

export class PublishToSessionError extends QualityTestError {
  constructor() {
    super('Failed to publisher to the OpenTok session.');
  }
}

export class SubscribeError extends QualityTestError {
  constructor() {
    super('Failed to subscribe to the test publisher stream.');
  }
}

export class SubscriberGetStatsError extends QualityTestError {
  constructor() {
    super('Failed to get network stats for a subscriber.');
  }
}

export class MissingSubscriberError extends QualityTestError {
  constructor() {
    super('Call checkSubscribeToSession before calling checkSubscriberQuality.');
  }
}
