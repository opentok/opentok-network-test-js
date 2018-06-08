
import { SubscriberStats } from './opentok/subscriber';
import { Event } from './opentok/events';
import { OTError } from './opentok/error';
import { Publisher } from './opentok/publisher';
import { Stream } from './opentok/stream';

export namespace NetworkTestTypes {
  // Callbacks
  export type CompletionCallback<A> = (error: Error | undefined, results: A | null) => void;
  export type UpdateCallback<A> = (stats: SubscriberStats) => void;
  export type UpdateCallbackStats = SubscriberStats & { phase: string; };

  export interface SessionCredentials {
    apiKey: string;
    sessionId: string;
    token: string;
  }
  export type AV = 'audio' | 'video';

  /**
   * Quality Test
   */

  export interface HasAudioVideo<A> {
    audio: A;
    video: A;
  }
  export interface AudioThreshold { bps: number; plr: number; }
  export interface VideoThreshold extends AudioThreshold { recommendedSetting: string; }

  export type StatsListener = (error?: OTError, stats?: SubscriberStats) => void;
  export interface Kbps { kbps: number; }
  export interface KbpsMap extends HasAudioVideo<Kbps[]> { }
  export interface Bandwidth extends HasAudioVideo<number> { }

  export type StreamCreatedEvent = Event<'streamCreated', Publisher> & { stream: Stream };
}
