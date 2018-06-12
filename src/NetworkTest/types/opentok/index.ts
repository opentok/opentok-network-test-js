
import * as OTSession from './session';
import * as OTStream from './stream';
import * as OTConnection from './connection';
import * as OTPublisher from './publisher';
import * as OTSubscriber from './subscriber';
import * as OTError from './error';
import * as OTEvent from './events';

export namespace OT {

  /**
   * OpenTok.js Client SDK
   */
  export interface Client {
    properties?: {
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
    };

    checkScreenSharingCapability(
      callback: (response: ScreenSharingCapabilityResponse) => void,
    ): void;

    checkSystemRequirements(): number;
    getDevices(
      callback: (error: OTError | undefined, devices?: Device[]) => void,
    ): void;
    initPublisher(
      targetElement?: HTMLElement | string,
      properties?: OTPublisher.PublisherProperties,
      callback?: (error?: Error) => void,
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

  export interface SessionCredentials {
    apiKey: string;
    sessionId: string;
    token: string;
  }

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

  export type Session = OTSession.Session;
  export type Event<Type, Target> = OTEvent.Event<Type, Target>;
  export type Connection  = OTConnection.Connection;
  export type Stream  = OTStream.Stream;
  export type Publisher = OTPublisher.Publisher;
  export type PublisherProperties = OTPublisher.PublisherProperties;
  export type Subscriber = OTSubscriber.Subscriber;
  export type SubscriberStats = OTSubscriber.SubscriberStats;
  export type SubscriberProperties = OTSubscriber.SubscriberProperties;
  export type TrackStats = OTSubscriber.TrackStats;
  export type OTError = OTError.OTError;
}
