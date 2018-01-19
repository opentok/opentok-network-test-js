/**
 * @module Errors/Connectivity/Mapping
 */

/**
 * Map Connectivity Errors to Failure Types
 */


import { ConnectivityError } from './index';

export enum FailureType {
  APIConnectivityError = 'api',
  ConnectToSessionNetworkError =  'api',
  ConnectToSessionError = 'messaging',
  MediaDeviceError = 'OpenTok.js',
  PublishToSessionError = 'media',
  SubscribeToSessionError = 'media',
  LoggingServerConnectionError = 'logging',
  ConnectivityError = 'OpenTok.js',
}

export type FailureCase = {
  type: FailureType,
  error: ConnectivityError,
};

const mapErrorToCase = (error: ConnectivityError): FailureCase => {

  const getType = (): FailureType => {
    switch (error.name) {
      case 'APIConnectivityError':
        return FailureType[error.name];
      case 'ConnectToSessionError':
        return FailureType[error.name];
      case 'ConnectToSessionNetworkError':
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
  return { error, type: getType() };
};

export const mapErrors = (...errors: ConnectivityError[]): FailureCase[] => errors.map(mapErrorToCase);
