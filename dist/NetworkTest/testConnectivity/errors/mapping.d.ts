/**
 * @module Errors/Connectivity/Mapping
 */
/**
 * Map Connectivity Errors to Failure Types
 */
import { ConnectivityError } from './index';
export declare enum FailureType {
    Api = "api",
    Messaging = "messaging",
    OpentokJs = "OpenTok.js",
    Media = "media",
    Logging = "logging",
    ConnectivityError = "OpenTok.js"
}
export declare type FailureCase = {
    type: FailureType;
    error: ConnectivityError;
};
export declare const mapErrors: (...errors: ConnectivityError[]) => FailureCase[];
