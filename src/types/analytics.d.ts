/**
 * Analytics
 */

type Config = {
  sessionId: string
  partnerId: string,
  source: string,
  clientVersion: string,
  name: string,
  componentId: string,
}

type SessionInfo = {
  sessionId: string,
  connectionId: string,
  partnerId: string
};

type LogEvent = {
  action: string,
  variation: string
}

declare class OTKAnalytics {
  constructor(config: Config);
  addSessionInfo(info: SessionInfo): void;
  logEvent(event: LogEvent): void;
}

declare module 'opentok-solutions-logging' {
  namespace OTKAnalytics { }
  export = OTKAnalytics;
}
