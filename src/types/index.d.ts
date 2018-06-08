/**
 * @module Types/NetworkTest
 */

/**
 * Define global types
 */



type SessionCredentials = {
  apiKey: string,
  sessionId: string,
  token: string
}
type CompletionCallback<A> = (error: Error | undefined, results: A | null) => void
type AV = 'audio' | 'video';

type InputDeviceType = 'audioInput' | 'videoInput';

/**
 * Quality Test
 */

type UpdateCallbackStats = OT.SubscriberStats & { phase: string; };

 interface HasAudioVideo<A> {
   audio: A;
   video: A;
 }


interface AudioThreshold { bps: number, plr: number }
interface VideoThreshold extends AudioThreshold { recommendedSetting: string }

type StatsListener = (error?: OT.OTError, stats?: OT.SubscriberStats) => void;
interface Kbps { kbps: number }
interface KbpsMap extends HasAudioVideo<Kbps[]> {}
interface Bandwidth extends HasAudioVideo<number> {}

interface AverageStatsBase {
  bitrate: number;
  packetLossRatio: number;
}



type StreamCreatedEvent = OT.Event<'streamCreated', OT.Publisher> & { stream: OT.Stream };
