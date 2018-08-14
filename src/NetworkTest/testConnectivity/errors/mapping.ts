/**
 * @module Errors/Connectivity/Mapping
 */

/**
 * Map Connectivity Errors to Failure Types
 */

import { ConnectivityError } from './index';
import { ErrorNames } from '../../errors/types';

export enum FailureType {
  Api = 'api',
  Messaging = 'messaging',
  OpentokJs = 'OpenTok.js',
  Media = 'media',
  Logging = 'logging',
  ConnectivityError = 'OpenTok.js',
}

export type FailureCase = {
  type: FailureType,
  error: ConnectivityError,
};

const mapErrorToCase = (error: ConnectivityError): FailureCase => {

  const getType = (): FailureType => {
    switch (error.name) {
      case ErrorNames.API_CONNECTIVITY_ERROR:
      case ErrorNames.CONNECT_TO_SESSION_NETWORK_ERROR:
        return FailureType.Api;
      case ErrorNames.CONNECT_TO_SESSION_ERROR:
      case ErrorNames.CONNECT_TO_SESSION_TOKEN_ERROR:
      case ErrorNames.CONNECT_TO_SESSION_ID_ERROR:
        return FailureType.Messaging;
      case ErrorNames.MEDIA_DEVICE_ERROR:
      case ErrorNames.FAILED_TO_OBTAIN_MEDIA_DEVICES:
      case ErrorNames.NO_VIDEO_CAPTURE_DEVICES:
      case ErrorNames.NO_AUDIO_CAPTURE_DEVICES:
      case ErrorNames.FAILED_TO_CREATE_LOCAL_PUBLISHER:
      case ErrorNames.PUBLISH_TO_SESSION_NOT_CONNECTED:
      case ErrorNames.PUBLISH_TO_SESSION_PERMISSION_OR_TIMEOUT_ERROR:
      case ErrorNames.PUBLISH_TO_SESSION_NETWORK_ERROR:
        return FailureType.OpentokJs;
      case ErrorNames.PUBLISH_TO_SESSION_ERROR:
      case ErrorNames.SUBSCRIBE_TO_SESSION_ERROR:
      case ErrorNames.FAILED_MESSAGING_SERVER_TEST:
        return FailureType.Media;
      case ErrorNames.LOGGING_SERVER_CONNECTION_ERROR:
        return FailureType.Logging;
      default:
        return FailureType.OpentokJs;
    }
  };
  return { error, type: getType() };
};

export const mapErrors = (...errors: ConnectivityError[]): FailureCase[] => errors.map(mapErrorToCase);
