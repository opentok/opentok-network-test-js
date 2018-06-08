import { OTError } from './error';
import { Session } from './session';
import { Publisher, PublisherProperties } from './publisher';

export interface Device {
  kind: 'audioInput' | 'videoInput';
  deviceId: string;
  label: string;
}

export interface ScreenSharingCapabilityResponse {
  extensionInstalled: boolean;
  supported: boolean;
  supportedSources: {
    application: boolean;
    screen: boolean;
    window: boolean;
  };
  extensionRegistered?: string;
}

export interface OT {
  /* tslint:disable */
  properties: {
    version: string;
    buildHash: string;
    debug: boolean;
    websiteURL: string;
    cdnURL: string;
    loggingURL: string;
    apiURL: string;
    supportSSL: boolean;
    cdnURLSSL: string;
    loggingURLSSL: string;
    apiURLSSL: string;
    minimumVersion: { firefox: number, chrome: number };
    sentryDSN: string;
    enableErrorReporting: boolean;
    assetURL: string;
    cssURL: string;
  }
  checkScreenSharingCapability(
    callback: (response: ScreenSharingCapabilityResponse) => void,
  ): void;

  checkSystemRequirements(): number;
  getDevices(
    callback: (error: OTError | undefined, devices?: Device[]) => void,
  ): void;
  initPublisher(
    targetElement?: HTMLElement | string,
    properties?: PublisherProperties,
    callback?: () => void,
  ): Publisher;
  initSession(
    partnerId: string,
    sessionId: string,
  ): Session;

registerScreenSharingExtension(
  kind: string,
  id: string,
  version: number,
): void;

reportIssue(callback: (error?: OTError, reportId?: string) => void): void;

setLogLevel(level: number): void;

upgradeSystemRequirements(): void;
}
