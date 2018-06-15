import { Stream } from './stream';
import { Session } from './session';
import { Event, OTEventEmitter, VideoDimensionsChangedEvent } from './events';
import { Dimensions, WidgetProperties, WidgetStyle } from './widget';

export interface OutgoingTrackStats {
  bytesSent: number;
  packetsLost: number;
  packetsSent: number;
}

export interface PublisherStats {
  audio: OutgoingTrackStats;
  video: OutgoingTrackStats & { frameRate: number; };
  timestamp: number;
}

export interface PublisherStatContainer {
  subscriberId?: string;
  connectionId?: string;
  stats: PublisherStats;
}

export type PublisherStatsArr = PublisherStatContainer[];

export interface PublisherStyle extends WidgetStyle {
  archiveStatusDisplayMode: 'auto' | 'off';
}

export interface GetUserMediaProperties {
  audioSource?: string | null | boolean | MediaStreamTrack;
  disableAudioProcessing?: boolean;
  facingMode?: 'user' | 'environment' | 'left' | 'right';
  frameRate?: 30 | 15 | 7 | 1;
  maxResolution?: Dimensions;
  resolution?: (
    '1280x960' |
    '1280x720' |
    '640x480' |
    '640x360' |
    '320x240' |
    '320x180'
  );
  videoSource?: string | null | boolean | MediaStreamTrack;
}

export interface PublisherProperties extends WidgetProperties, GetUserMediaProperties {
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
}

export interface Publisher extends OTEventEmitter<{
  accessAllowed: Event<'accessAllowed', Publisher>;
  accessDenied: Event<'accessDenied', Publisher>;
  accessDialogClosed: Event<'accessDialogClosed', Publisher>;
  accessDialogOpened: Event<'accessDialogOpened', Publisher>;

  audioLevelUpdated: Event<'audioLevelUpdated', Publisher> & {
    audioLevel: number,
  };

  destroyed: Event<'destroyed', Publisher>;

  getStats(callback: (error?: Error, stats?: PublisherStatsArr) => void): void;

  mediaStopped: Event<'mediaStopped', Publisher> & {
    track: MediaStreamTrack | undefined,
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
  cycleVideo(): Promise<{ deviceId: string }>;
  setStyle<Style extends keyof PublisherStyle>(style: Style, value: PublisherStyle[Style]): void;
  videoWidth(): number | undefined;
  videoHeight(): number | undefined;
}
