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
export declare class QualityTestError extends NetworkTestError {
    constructor(message: string, name: string);
}
/**
 * Browser Error
 */
export declare class UnsupportedBrowserError extends QualityTestError {
    constructor(browser: string);
}
/**
 * Session Errors
 */
export declare class ConnectToSessionError extends QualityTestError {
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
export declare class MediaDeviceError extends QualityTestError {
    constructor(message?: string, name?: string);
}
export declare class FailedToObtainMediaDevices extends QualityTestError {
    constructor();
}
export declare class NoVideoCaptureDevicesError extends QualityTestError {
    constructor();
}
export declare class NoAudioCaptureDevicesError extends QualityTestError {
    constructor();
}
/**
 * Publisher Errors
 */
export declare class PublishToSessionError extends QualityTestError {
    constructor(message?: string, name?: string);
}
export declare class InitPublisherError extends PublishToSessionError {
    constructor(message?: string);
}
export declare class PublishToSessionNotConnectedError extends PublishToSessionError {
    constructor();
}
export declare class PublishToSessionPermissionOrTimeoutError extends PublishToSessionError {
    constructor();
}
/**
 * Subscriber Errors
 */
export declare class SubscribeToSessionError extends QualityTestError {
    constructor(message?: string, name?: string);
}
export declare class SubscriberGetStatsError extends SubscribeToSessionError {
    constructor();
}
export declare class MissingSubscriberError extends SubscribeToSessionError {
    constructor();
}
