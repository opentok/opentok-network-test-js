import { OT } from '../../types/opentok';

export type AV = 'audio' | 'video';

export interface HasAudioVideo<A> {
  audio: A;
  video: A;
}
export interface AudioThreshold { bps: number; plr: number; }
export interface VideoThreshold extends AudioThreshold { recommendedSetting: string; }

export type StatsListener = (error?: OT.Error, stats?: OT.SubscriberStats) => void;
export interface Kbps { kbps: number; }
export interface KbpsMap extends HasAudioVideo<Kbps[]> { }
export interface Bandwidth extends HasAudioVideo<number> { }

export type StreamCreatedEvent = OT.Event<'streamCreated', OT.Publisher> & { stream: OT.Stream };
