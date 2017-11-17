/**
 * Analytics
 */

declare module 'opentok-solutions-logging' {
  type SessionInfo = { sessionId: string, connectionId: string, partnerId: string };
  class OTKAnalytics {
    addSessionInfo(info: SessionInfo): void;
    logEvent(action: string, variation: string): void;
  }
  namespace OTKAnalytics { }
  export = OTKAnalytics;
}
