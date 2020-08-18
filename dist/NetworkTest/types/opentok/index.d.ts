import * as OTSession from './session';
import * as OTStream from './stream';
import * as OTConnection from './connection';
import * as OTPublisher from './publisher';
import * as OTSubscriber from './subscriber';
import * as OTError from './error';
import * as OTEvent from './events';
export declare namespace OT {
    /**
     * OpenTok.js Client SDK
     */
    interface Client {
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
            minimumVersion: {
                firefox: number;
                chrome: number;
            };
            sentryDSN: string;
            enableErrorReporting: boolean;
            assetURL: string;
            cssURL: string;
        };
        checkScreenSharingCapability(callback: (response: ScreenSharingCapabilityResponse) => void): void;
        checkSystemRequirements(): number;
        getDevices(callback: (error: OTError | undefined, devices?: Device[]) => void): void;
        initPublisher(targetElement?: HTMLElement | string, properties?: OTPublisher.PublisherProperties, callback?: (error?: Error) => void): Publisher;
        initSession(partnerId: string, sessionId: string, options?: OTSession.initSessionOptions): Session;
        registerScreenSharingExtension(kind: string, id: string, version: number): void;
        reportIssue(callback: (error?: OTError, reportId?: string) => void): void;
        setLogLevel(level: number): void;
        setProxyUrl(proxyUrl: string): void;
        upgradeSystemRequirements(): void;
    }
    interface SessionCredentials {
        apiKey: string;
        sessionId: string;
        token: string;
    }
    interface Device {
        kind: 'audioInput' | 'videoInput';
        deviceId: string;
        label: string;
    }
    interface ScreenSharingCapabilityResponse {
        extensionInstalled: boolean;
        supported: boolean;
        supportedSources: {
            application: boolean;
            screen: boolean;
            window: boolean;
        };
        extensionRegistered?: string;
    }
    type Session = OTSession.Session;
    type InitSessionOptions = OTSession.initSessionOptions;
    type Event<Type, Target> = OTEvent.Event<Type, Target>;
    type Connection = OTConnection.Connection;
    type Stream = OTStream.Stream;
    type Publisher = OTPublisher.Publisher;
    type PublisherProperties = OTPublisher.PublisherProperties;
    type Subscriber = OTSubscriber.Subscriber;
    type SubscriberStats = OTSubscriber.SubscriberStats;
    type SubscriberProperties = OTSubscriber.SubscriberProperties;
    type TrackStats = OTSubscriber.TrackStats;
    type OTError = OTError.OTError;
}
