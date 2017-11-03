

type OpenTokEnvironment = 'standard' | 'enterprise'
type SessionCredentials = {
  apiKey: string,
  sessionId: string,
  token: string
}

type DeviceOptions = {
  audioDevice?: string,
  videoDevice?: string
}

type StatusCallback = (string) => void
type CompletionCallback<A> = (error: Error | null, results: A | null) => void
