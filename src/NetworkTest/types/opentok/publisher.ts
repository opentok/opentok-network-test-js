import { Stream } from './stream';
import { Session } from './session';
import { Event, OTEventEmitter, VideoDimensionsChangedEvent } from './events';
import { Dimensions, WidgetProperties, WidgetStyle } from './widget';

export interface PublisherStyle extends WidgetStyle {
  archiveStatusDisplayMode: 'auto' | 'off';
}

export interface PublisherProperties extends WidgetProperties {
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
    audioLevel: number;
  };

  destroyed: Event<'destroyed', Publisher>;

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
  setStyle<Style extends keyof PublisherStyle>(style: Style, value: PublisherStyle[Style]): void;
  videoWidth(): number | undefined;
  videoHeight(): number | undefined;
}
