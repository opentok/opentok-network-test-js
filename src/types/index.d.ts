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
  SessionInfo: OT.SessionInfo
}

type SessionCredentials = {
  apiKey: string,
  sessionId: string,
  token: string
}

interface NetworkTestOptions {
  audioOnly?: boolean
}

type UpdateCallback<A> = (stats: OT.SubscriberStats) => void
type AV = 'audio' | 'video';
type TestQualityResults = {
  mos: number,
  audio: {
    bitrate: number,
    packetLoss: number,
    supported: boolean,
    reason?: string,
    mos?: number,
  },
  video: {
    bitrate: number,
    packetLoss: number,
    frameRate: number,
    recommendedFrameRate?: string,
    recommendedResolution?: string,
    supported: boolean,
    reason?: string,
    mos?: number,
  },
}

type InputDeviceType = 'audioInput' | 'videoInput';

/**
 * Quality Test
 */

type UpdateCallbackStats = OT.SubscriberStats & { phase: string; };

 interface HasAudioVideo<A> {
   audio: A;
   video: A;
 }

interface QualityTestResults extends HasAudioVideo<AverageStats> {}

type TestConnectivityCallback = (results: ConnectivityTestResults | null) => void
type TestQualityCompletionCallback = (error: Error | undefined, results: QualityTestResults | null) => void

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
  recommendedFrameRate?: number;
  recommendedResolution?: string;
  mos?: number;
}

type QualityEvaluationResults = {
  supported: boolean,
  recommendedFrameRate?: number,
  recommendedResolution?: string,
  reason?: string,
};

type QualityStats = {
  averageBitrate: number,
  packetLossRatio: number,
  frameRate?: number,
};

type StreamCreatedEvent = OT.Event<'streamCreated', OT.Publisher> & { stream: OT.Stream };
