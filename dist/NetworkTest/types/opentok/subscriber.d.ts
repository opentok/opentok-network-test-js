import { Event, OTEventEmitter, VideoDimensionsChangedEvent } from './events';
import { Stream } from './stream';
import { OTError } from './error';
import { Dimensions, WidgetProperties, WidgetStyle } from './widget';
export interface SubscriberStyle extends WidgetStyle {
    videoDisabledDisplayMode: 'auto' | 'on' | 'off';
    audioBlockedDisplayMode: 'auto' | 'on' | 'off';
}
export interface TrackStats {
    bytesReceived: number;
    packetsLost: number;
    packetsReceived: number;
}
export interface SubscriberStats {
    audio: TrackStats;
    video: TrackStats & {
        frameRate: number;
    };
    timestamp: number;
}
export interface SubscriberProperties extends WidgetProperties {
    audioVolume?: number;
    preferredFrameRate?: number;
    preferredResolution?: Dimensions;
    style?: Partial<SubscriberStyle>;
    subscribeToAudio?: boolean;
    subscribeToVideo?: boolean;
    testNetwork?: boolean;
}
export interface Subscriber extends OTEventEmitter<{
    audioLevelUpdated: Event<'audioLevelUpdated', Subscriber> & {
        audioLevel: number;
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
    setStyle<Style extends keyof SubscriberStyle>(style: Style, value: SubscriberStyle[Style]): void;
    videoHeight(): number | undefined;
    videoWidth(): number | undefined;
}
