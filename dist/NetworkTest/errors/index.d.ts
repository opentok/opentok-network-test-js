/**
 * @module Errors
 */
/**
  * Base class for errors used throughout Network Connectivity tests.
  */
export declare class NetworkTestError extends Error {
    name: string;
    constructor(message: string, name?: string);
}
export declare class MissingOpenTokInstanceError extends NetworkTestError {
    constructor();
}
export declare class IncompleteSessionCredentialsError extends NetworkTestError {
    constructor();
}
export declare class MissingSessionCredentialsError extends NetworkTestError {
    constructor();
}
export declare class InvalidOnUpdateCallback extends NetworkTestError {
    constructor();
}
