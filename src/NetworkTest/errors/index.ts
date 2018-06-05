/**
 * @module Errors
 */

 /**
  * Base class for errors used throughout Network Connectivity tests.
  */
export class NetworkTestError extends Error {
  name: string;
  constructor(message: string, name?: string) {
    super(message);
    Object.setPrototypeOf(this, NetworkTestError.prototype);
    this.name = name || this.constructor.name;
    this.stack = (new Error(message)).stack;
  }
}

export class MissingOpenTokInstanceError extends NetworkTestError {
  constructor() {
    super('An instance of OT, the OpenTok.js client SDK, is required.',
      'MissingOpenTokInstanceError');
  }
}

export class IncompleteSessionCredentialsError extends NetworkTestError {
  constructor() {
    super('NetworkConnectivity requires an apiKey, sessionId, and token.',
      'IncompleteSessionCredentialsError');
  }
}

export class MissingSessionCredentialsError extends NetworkTestError {
  constructor() {
    super('NetworkConnectivity requires OpenTok session credentials.',
      'MissingSessionCredentialsError');
  }
}

export class InvalidSessionCredentialsError extends NetworkTestError {
  constructor() {
    super('NetworkConnectivity session credentials must include an apiKey, sessionId, and token.',
      'InvalidSessionCredentialsError');
  }
}

export class InvalidOnUpdateCallback extends NetworkTestError {
  constructor() {
    super('The onUpdate callback must be a function that accepts a single parameter.',
      'InvalidOnUpdateCallback');
  }
}

export class InvalidOnCompleteCallback extends NetworkTestError {
  constructor() {
    super('The onComplete callback must be a function that accepts error and results parameters',
      'InvalidOnCompleteCallback');
  }
}
