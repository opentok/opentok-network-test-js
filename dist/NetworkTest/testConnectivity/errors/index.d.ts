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
export declare class ConnectivityError extends NetworkTestError {
    constructor(message: string, name?: string);
}
/**
 * API Connectivity Error
 */
export declare class APIConnectivityError extends ConnectivityError {
    constructor();
}
/**
 * Session Errors
 */
export declare class ConnectToSessionError extends ConnectivityError {
    constructor(message?: string, name?: string);
}
export declare class ConnectToSessionTokenError extends ConnectToSessionError {
    constructor();
}
export declare class ConnectToSessionSessionIdError extends ConnectToSessionError {
    constructor();
}
export declare class ConnectToSessionNetworkError extends ConnectToSessionError {
    constructor();
}
/**
 * Missing Device Errors
 */
export declare class MediaDeviceError extends ConnectivityError {
    constructor(message?: string, name?: string);
}
export declare class FailedToObtainMediaDevices extends MediaDeviceError {
    constructor();
}
export declare class NoVideoCaptureDevicesError extends MediaDeviceError {
    constructor();
}
export declare class NoAudioCaptureDevicesError extends MediaDeviceError {
    constructor();
}
/**
 * Publishing Errors
 */
export declare class PublishToSessionError extends ConnectivityError {
    constructor(message?: string, name?: string);
}
export declare class FailedMessagingServerTestError extends PublishToSessionError {
    constructor();
}
export declare class FailedToCreateLocalPublisher extends PublishToSessionError {
    constructor();
}
export declare class PublishToSessionNotConnectedError extends PublishToSessionError {
    constructor();
}
export declare class PublishToSessionPermissionOrTimeoutError extends PublishToSessionError {
    constructor();
}
export declare class PublishToSessionNetworkError extends PublishToSessionError {
    constructor();
}
/**
 * Subscribing Errors
 */
export declare class SubscribeToSessionError extends ConnectivityError {
    constructor(message?: string);
}
/**
 * Logger Server Error
 */
export declare class LoggingServerConnectionError extends ConnectivityError {
    constructor();
}
