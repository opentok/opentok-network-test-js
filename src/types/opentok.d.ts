/**
 * @module Types/OpenTok
 */

/**
 * OpenTok Client SDK types
 */

declare module OT {

  type Properties = {
    version: string,
    buildHash: string,
    debug: boolean,
    websiteURL: string,
    cdnURL: string,
    loggingURL: string,
    apiURL: string,
    supportSSL: boolean,
    cdnURLSSL: string,
    loggingURLSSL: string,
    apiURLSSL: string,
    minimumVersion: { firefox: number, chrome: number },
    sentryDSN: string,
    enableErrorReporting: boolean,
    assetURL: string,
    cssURL: string
  }

  type OTError = {
    name: string;
    message: string;
  };

  type Dimensions = {
    width: number;
    height: number;
  }

  type ScreenSharingCapabilityResponse = {
    extensionInstalled: boolean;
    supported: boolean;
    supportedSources: {
      application: boolean;
      screen: boolean;
      window: boolean;
    };
    extensionRegistered?: string;
  };

  export function checkScreenSharingCapability(
    callback: (response: ScreenSharingCapabilityResponse) => void
  ): void;

  export function checkSystemRequirements(): number;

  type Device = {
    kind: 'audioInput' | 'videoInput';
    deviceId: string;
    label: string;
  };

  export function getDevices(
    callback: (error: OTError | undefined, devices?: Device[]) => void
  ): void;

  type WidgetStyle = {
    audioLevelDisplayMode: 'auto' | 'on' | 'off';
    backgroundImageURI: string;
    buttonDisplayMode: 'auto' | 'on' | 'off';
    nameDisplayMode: 'auto' | 'on' | 'off';
  };

  type WidgetProperties = {
    fitMode?: 'cover' | 'contain';
    insertDefaultUI?: boolean;
    insertMode?: 'replace' | 'after' | 'before' | 'append';
    showControls?: boolean;
    width?: string | number;
    height?: string | number;
  };

  type PublisherStyle = WidgetStyle & {
    archiveStatusDisplayMode: 'auto' | 'off';
  };

  type PublisherProperties = WidgetProperties & {
    audioBitrate?: number;
    audioFallbackEnabled?: boolean;
    audioSource?: string | null;
    disableAudioProcessing?: boolean;
    frameRate?: 30 | 15 | 7 | 1;
    maxResolution?: Dimensions;
    mirror?: boolean;
    name?: string;
    publishAudio?: boolean;
    publishVideo?: boolean;
    resolution?: (
      '1280x960' |
      '1280x720' |
      '640x480' |
      '640x360' |
      '320x240' |
      '320x180'
    );
    style?: Partial<PublisherStyle>;
    usePreviousDeviceSelection?: boolean;
    videoSource?: string | null;
  };

  type SubscriberStyle = WidgetStyle & {
    videoDisabledDisplayMode: 'auto' | 'on' | 'off';
    audioBlockedDisplayMode: 'auto' | 'on' | 'off';
  };

  type SubscriberProperties = WidgetProperties & {
    audioVolume?: number;
    preferredFrameRate?: number;
    preferredResolution?: Dimensions;
    style?: Partial<SubscriberStyle>;
    subscribeToAudio?: boolean;
    subscribeToVideo?: boolean;
    testNetwork?: boolean;
  };

  export class Connection {
    connectionId: string;
    creationTime: number;
    data: string;
  }

  export class Stream {
    connection: Connection;
    creationTime: number;
    frameRate: number;
    hasAudio: boolean;
    hasVideo: boolean;
    name: string;
    streamId: string;
    videoDimensions: {
      width: number;
      height: number;
    };
    videoType: 'camera' | 'screen';
  }

  type Event<Type, Target> = {
    type: Type;
    cancelable: boolean;
    target: Target;

    isDefaultPrevented(): boolean;
    preventDefault(): void;
  };

  type VideoDimensionsChangedEvent<Target> = Event<'videoDimensionsChanged', Target> & {
    oldValue: Dimensions;
    newValue: Dimensions;
  };

  class OTEventEmitter<EventMap> {
    on<EventName extends keyof EventMap>(
      eventName: EventName,
      callback: (event: EventMap[EventName]) => void
    ): void;

    once<EventName extends keyof EventMap>(
      eventName: EventName,
      callback: (event: EventMap[EventName]) => void
    ): void;

    off<EventName extends keyof EventMap>(
      eventName?: EventName,
      callback?: (event: EventMap[EventName]) => void
    ): void;
  }

  export class Publisher extends OTEventEmitter<{
    accessAllowed: Event<'accessAllowed', Publisher>;
    accessDenied: Event<'accessDenied', Publisher>;
    accessDialogClosed: Event<'accessDialogClosed', Publisher>;
    accessDialogOpened: Event<'accessDialogOpened', Publisher>;

    audioLevelUpdated: Event<'audioLevelUpdated', Publisher> & {
      audioLevel: number
    };

    destroyed: Event<'destroyed', Publisher>;

    mediaStopped: Event<'mediaStopped', Publisher> & {
      track: MediaStreamTrack | undefined
    };

    streamCreated: Event<'streamCreated', Publisher> & {
      stream: Stream;
    };

    streamDestroyed: Event<'streamDestroyed', Publisher> & {
      stream: Stream;
      reason: string;
    };

    videoDimensionsChanged: VideoDimensionsChangedEvent<Publisher>;

    videoElementCreated: Event<'videoElementCreated', Publisher> & {
      element: HTMLVideoElement | HTMLObjectElement;
    };
  }> {
    accessAllowed: boolean;
    element?: HTMLElement | undefined;
    id?: string;
    stream?: Stream;
    session?: Session;

    destroy(): void;
    getImgData(): string | null;
    getStyle(): PublisherProperties;
    publishAudio(value: boolean): void;
    publishVideo(value: boolean): void;
    setStyle<Style extends keyof PublisherStyle>(style: Style, value: PublisherStyle[Style]): void;
    videoWidth(): number | undefined;
    videoHeight(): number | undefined;
  }

  export function initPublisher(
    targetElement?: HTMLElement | string,
    properties?: PublisherProperties,
    callback?: () => void
  ): Publisher;

  export class Session extends OTEventEmitter<{
    archiveStarted: Event<'archiveStarted', Session> & {
      id: string;
      name: string;
    };

    archiveStopped: Event<'archiveStopped', Session> & {
      id: string;
      name: string;
    };

    connectionCreated: Event<'connectionCreated', Session> & {
      connection: Connection;
    };

    connectionDestroyed: Event<'connectionDestroyed', Session> & {
      connection: Connection;
      reason: string;
    };

    sessionConnected: Event<'sessionConnected', Session>;

    sessionDisconnected: Event<'sessionDisconnected', Session> & {
      reason: string;
    };

    sessionReconnected: Event<'sessionReconnected', Session>;
    sessionReconnecting: Event<'sessionReconnecting', Session>;

    signal: Event<'signal', Session> & {
      type?: string;
      data?: string;
      from: Connection;
    };

    streamCreated: Event<'streamCreated', Session> & {
      stream: Stream;
    };

    streamDestroyed: Event<'streamDestroyed', Session> & {
      stream: Stream;
      reason: string;
    };

    streamPropertyChanged: (
      Event<'streamPropertyChanged', Session> & {
        stream: Stream;
      } & (
        { changedProperty: 'hasAudio'; oldValue: boolean; newValue: boolean; } |
        { changedProperty: 'hasVideo'; oldValue: boolean; newValue: boolean; } |
        { changedProperty: 'videoDimensions'; oldValue: Dimensions; newValue: Dimensions; }
      )
    );
  }> {
    capabilities: {
      forceDisconnect: number;
      forceUnpublish: number;
      publish: number;
      subscribe: number;
    };

    connection?: Connection;
    sessionId: string;

    connect(token: string, callback: (error?: OTError) => void): void;
    disconnect(): void;
    forceDisconnect(connection: Connection, callback: (error?: OTError) => void): void;
    forceUnpublish(stream: Stream, callback: (error?: OTError) => void): void;
    getPublisherForStream(stream: Stream): Publisher | undefined;
    getSubscribersForStream(stream: Stream): [Subscriber];
    publish(publisher: Publisher, callback: (error?: OTError) => void): void;

    signal(
      signal: { type?: string, data?: string, to?: Connection },
      callback: (error?: OTError) => void
    ): void;

    subscribe(
      stream: Stream,
      targetElement?: HTMLElement | string,
      properties?: SubscriberProperties,
      callback?: (error?: OTError) => void
    ): Subscriber;

    unpublish(publisher: Publisher): void;
    unsubscribe(subscriber: Subscriber): void;
  }

  export function initSession(
    partnerId: string,
    sessionId: string
  ): Session;

  type TrackStats = {
    bytesReceived: number;
    packetsLost: number;
    packetsReceived: number;
  };

  type SubscriberStats = {
    audio: TrackStats;
    video: TrackStats & { frameRate: number; };
    timestamp: number;
  }

  export class SessionInfo {
    get: (sessionId: string, token: string, connectionId: string) => Promise<void>
  }

  export class Subscriber extends OTEventEmitter<{
    audioLevelUpdated: Event<'audioLevelUpdated', Subscriber> & {
      audioLevel: number
    };

    connected: Event<'connected', Subscriber>;

    destroyed: Event<'destroyed', Subscriber> & {
      reason: string;
    };

    videoDimensionsChanged: VideoDimensionsChangedEvent<Subscriber>;

    videoDisabled: Event<'videoDisabled', Subscriber> & {
      reason: string;
    };

    videoDisableWarning: Event<'videoDisableWarning', Subscriber>;
    videoDisableWarningLifted: Event<'videoDisableWarningLifted', Subscriber>;

    videoElementCreated: Event<'videoElementCreated', Subscriber> & {
      element: HTMLVideoElement | HTMLObjectElement;
    };

    videoEnabled: Event<'videoEnabled', Subscriber> & {
      reason: string;
    };
  }> {
    element?: HTMLElement;
    id?: string;
    stream?: Stream;

    getAudioVolume(): number;
    getImgData(): string | null;
    getStats(callback: (error?: OTError, stats?: SubscriberStats) => void): void;
    restrictFrameRate(value: boolean): void;
    setAudioVolume(volume: number): void;
    setPreferredFrameRate(frameRate: number): void;
    setPreferredResolution(resolution: Dimensions): void;

    setStyle<Style extends keyof SubscriberStyle>(
      style: Style,
      value: SubscriberStyle[Style]
    ): void;

    videoHeight(): number | undefined;
    videoWidth(): number | undefined;
  }

  export function registerScreenSharingExtension(
    kind: string,
    id: string,
    version: number
  ): void;

  export function reportIssue(callback: (error?: OTError, reportId?: string) => void): void;

  export function setLogLevel(level: number): void;

  export function upgradeSystemRequirements(): void;
}