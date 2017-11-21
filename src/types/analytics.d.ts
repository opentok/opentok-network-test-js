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
  type SessionInfo = { sessionId: string, connectionId: string, partnerId: string };
  class OTKAnalytics {
    constructor(options: {
      sessionId: string,
      partnerId: string,
      source: string,
      clientVersion: string,
      name: string,
      componentId: string,
    });
    addSessionInfo(info: SessionInfo): void;
    logEvent(options: { action: string, variation: string }): void;
  }
  namespace OTKAnalytics { }
  export = OTKAnalytics;
}
