/**
 * @module Types
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
type StatusCallback = (status: string) => void
type CompletionCallback<A> = (error: Error | null, results: A | null) => void


type DeviceId = string;
type InputDeviceType = 'audioInput' | 'videoInput';
type DeviceOptions = {
  audioDevice?: DeviceId,
  videoDevice?: DeviceId
}
