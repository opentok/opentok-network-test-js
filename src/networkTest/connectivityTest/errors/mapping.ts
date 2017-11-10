/**
 * @module Errors/Connectivity/Mapping
 */

/**
 * Map Connectivity Errors to Failure Types
 */


import { ConnectivityError } from './index';

export enum FailureType {
  ConnectToSessionError = 'api',
  MediaDeviceError = 'OpenTok.js',
  PublishToSessionError = 'media',
  SubscribeToSessionError = 'media',
  LoggingServerConnectionError = 'logging',
  ConnectivityError = 'OpenTok.js',
}

const mapErrorToType = (error: ConnectivityError): FailureType => {
  switch (error.name) {
    case 'ConnectToSessionError':
      return FailureType[error.name];
    case 'MediaDeviceError':
      return FailureType[error.name];
    case 'PublishToSessionError':
      return FailureType[error.name];
    case 'SubscribeToSessionError':
      return FailureType[error.name];
    case 'LoggingServerConnectionError':
      return FailureType[error.name];
    default:
      return FailureType['ConnectivityError'];
  }
};

export const mapErrors = (...errors: ConnectivityError[]): FailureType[] => errors.map(mapErrorToType);
