export interface OpenTok {
  initSession: (partnerId: string, sessionId: string) => OT.Session;
  initPublisher: (targetElement?: HTMLElement | string, properties?: OT.PublisherProperties, callback?: (error?: OT.OTError) => void) => OT.Publisher;
  getDevices(callback: (error: OT.OTError | undefined, devices?: OT.Device[]) => void): void;
  properties: OT.Properties
  SessionInfo: OT.SessionInfo
}

export type SessionCredentials = {
  apiKey: string,
  sessionId: string,
  token: string
}

export interface NetworkTestOptions {
  audioOnly?: boolean
}

export type UpdateCallback<A> = (stats: OT.SubscriberStats) => void
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

export type InputDeviceType = 'audioInput' | 'videoInput';

/**
 * Quality Test
 */

export type UpdateCallbackStats = OT.SubscriberStats & { phase: string; };

 interface HasAudioVideo<A> {
   audio: A;
   video: A;
 }

export interface QualityTestResults extends HasAudioVideo<AverageStats> {}

export type TestConnectivityCallback = (results: ConnectivityTestResults | null) => void
export type TestQualityCompletionCallback = (error: Error | undefined, results: QualityTestResults | null) => void

export interface AudioThreshold { bps: number, plr: number }
export interface VideoThreshold extends AudioThreshold { recommendedSetting: string }

export type StatsListener = (error?: OT.OTError, stats?: OT.SubscriberStats) => void;

export type StreamCreatedEvent = OT.Event<'streamCreated', OT.Publisher> & { stream: OT.Stream };
