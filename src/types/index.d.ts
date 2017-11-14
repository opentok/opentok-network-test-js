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
type OpenTokEnvironment = 'standard' | 'enterprise'
type CompletionCallback<A> = (error: Error | undefined, results: A | null) => void
type UpdateCallback<A> = (stats: OT.SubscriberStats) => void
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

interface OpenTok {
  initSession: (partnerId: string, sessionId: string) => OT.Session;
  initPublisher: (targetElement?: HTMLElement | string, properties?: OT.PublisherProperties, callback?: (error?: OT.OTError) => void) => OT.Publisher;
  getDevices(callback: (error: OT.OTError | undefined, devices?: OT.Device[]) => void): void;
  properties: OT.Properties
}

type StreamCreatedEvent = OT.Event<'streamCreated', OT.Publisher> & { stream: OT.Stream };
