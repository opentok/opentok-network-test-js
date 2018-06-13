/**
 * @module Errors
 */

import { ErrorNames } from './types';

/**
 * Class defining the OTNetworkTest.errorNames object
 */
export class ErrorNameObj {
  [key: string]: any;
  constructor() {
    for (const key in ErrorNames) {
      this[key] = ErrorNames[key];
    }
  }
}

 /**
  * Base class for errors used throughout Network Connectivity tests.
  */
export class NetworkTestError extends Error {
  name: string;
  constructor(message: string, name?: string) {
    super(message);
    this.name = ErrorNames.NETWORK_TEST_ERROR;
    this.stack = (new Error(message)).stack;
  }
}

export class MissingOpenTokInstanceError extends NetworkTestError {
  constructor() {
    super('An instance of OT, the OpenTok.js client SDK, is required.');
    this.name = ErrorNames.MISSING_OPENTOK_INSTANCE;
  }
}

export class IncompleteSessionCredentialsError extends NetworkTestError {
  constructor() {
    super('NetworkConnectivity requires an apiKey, sessionId, and token.',
      ErrorNames.INCOMPLETE_SESSON_CREDENTIALS);
  }
}

export class MissingSessionCredentialsError extends NetworkTestError {
  constructor() {
    super('NetworkConnectivity requires OpenTok session credentials.',
      ErrorNames.MISSING_SESSON_CREDENTIALS);
  }
}

export class InvalidSessionCredentialsError extends NetworkTestError {
  constructor() {
    super('NetworkConnectivity session credentials must include an apiKey, sessionId, and token.',
      ErrorNames.INVALID_SESSON_CREDENTIALS);
  }
}

export class InvalidOnUpdateCallback extends NetworkTestError {
  constructor() {
    super('The onUpdate callback must be a function that accepts a single parameter.',
      ErrorNames.INVALID_ON_UPDATE_CALLBACK);
  }
}

export class InvalidOnCompleteCallback extends NetworkTestError {
  constructor() {
    super('The onComplete callback must be a function that accepts error and results parameters',
      ErrorNames.INVALID_ON_COMPLETE_CALLBACK);
  }
}
