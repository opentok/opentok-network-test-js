
type OpenTokEnvironment = 'standard' | 'enterprise'
type SessionCredentials = {
  apiKey: string,
  sessionId: string,
  token: string
}

type InputDeviceType = 'audioInput' | 'videoInput';

type DeviceOptions = {
  audioDevice?: string,
  videoDevice?: string
}

type StatusCallback = (status: string) => void
type CompletionCallback<A> = (error: Error | null, results: A | null) => void

interface HasSession {
  session: OT.Session
}

interface HasPublisher {
  publisher: OT.Publisher
}

interface HasSessionAndPublisher extends HasSession, HasPublisher {}
