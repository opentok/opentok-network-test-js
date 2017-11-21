/**
 * @module Types/NetworkTest
 */

/**
 * Define global types
 */

interface OpenTok {
  initSession: (partnerId: string, sessionId: string) => OT.Session;
  initPublisher: (targetElement?: HTMLElement | string, properties?: OT.PublisherProperties, callback?: (error?: OT.OTError) => void) => OT.Publisher;
  getDevices(callback: (error: OT.OTError | undefined, devices?: OT.Device[]) => void): void;
  properties: OT.Properties
}

type SessionCredentials = {
  apiKey: string,
  sessionId: string,
  token: string
}
type CompletionCallback<A> = (error: Error | undefined, results: A | null) => void
type UpdateCallback<A> = (stats: OT.SubscriberStats) => void
type AV = 'audio' | 'video';
type TestQualityResults = {
  mos: number,
  audio: {
    bitrate: number,
    packetLoss: number,
    supported: boolean,
    reason?: string,
  },
  video: {
    bitrate: number,
    packetLoss: number,
    frameRate: number,
    recommendedResolution?: string,
    supported: boolean,
    reason?: string,
  },
}


type DeviceId = string;
type InputDeviceType = 'audioInput' | 'videoInput';
type DeviceOptions = {
  audioDevice?: DeviceId,
  videoDevice?: DeviceId
}


/**
 * Quality Test
 */

 interface HasAudioVideo<A> {
   audio: A;
   video: A;
 }

interface QualityTestResults extends HasAudioVideo<AverageStats> {
  mos: number;
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

interface AverageStats {
  bitrate?: number;
  packetLossRatio?: number;
  supported?: boolean;
  reason?: string;
  frameRate?: number;
  recommendedResolution?: string;
}

type QualityEvaluationResults = {
  supported: boolean,
  recommendedResolution: string,
  reason?: string,
};

type QualityStats = {
  averageBitrate: number,
  packetLossRatio: number,
  frameRate?: number,
};

// type OTLoggingData = {
//   action: string,
//   variation: string
// }

// interface OTLogging {
//   logEvent: (data: OTLoggingData) => void;
// }

type StreamCreatedEvent = OT.Event<'streamCreated', OT.Publisher> & { stream: OT.Stream };
