/**
 * @module NetworkTest
 */

/**
* Define Network Connectivy class
*/

const version = require('../../package.json').version;
import { testConnectivity, ConnectivityTestResults } from './testConnectivity';
import testQuality from './testQuality';
import {
  IncompleteSessionCredentialsError,
  InvalidOnCompleteCallback,
  InvalidOnUpdateCallback,
  MissingOpenTokInstanceError,
  MissingSessionCredentialsError,
} from './errors';
import { getOr } from '../util';

/* tslint:disable */
const OTKAnalytics = require('opentok-solutions-logging');
/* tslint:enable */

export class NetworkTest {
  credentials: SessionCredentials;
  OT: OpenTok;
  otLogging: OTKAnalytics;

  /**
   * Returns an instance of NetworkConnectivity. See the "API reference" section of the
   * README.md file in the root of the opentok-network-test-js project for details.
   */
  constructor(OT: OpenTok, credentials: SessionCredentials) {
    this.validateOT(OT);
    this.validateCredentials(credentials);
    this.otLogging = this.startLoggingEngine(credentials.apiKey, credentials.sessionId);
    this.OT = OT;
    this.credentials = credentials;
  }

  private validateOT(OT: OpenTok) {
    if (!OT || typeof OT !== 'object' || !OT.initSession) {
      throw new MissingOpenTokInstanceError();
    }
  }

  private validateCredentials(credentials: SessionCredentials) {
    if (!credentials) {
      throw new MissingSessionCredentialsError();
    }
    if (!credentials.apiKey || !credentials.sessionId || !credentials.token) {
      throw new IncompleteSessionCredentialsError();
    }
  }

  private startLoggingEngine(apiKey: string, sessionId: string): OTKAnalytics {
    return new OTKAnalytics({
      sessionId,
      partnerId: apiKey,
      source: window.location.href,
      clientVersion: 'js-network-test-' + version,
      name: 'opentok-network-test',
      componentId: 'opentok-network-test',
    });
  }

  /**
   * This method checks to see if the client can connect to TokBox servers required for
   * using OpenTok.
   *
   * See the "API reference" section of the README.md file in the root of the
   * opentok-network-test-js project for details.
   */
  testConnectivity(
    onComplete?: TestConnectivityCallback): Promise<ConnectivityTestResults> {
    this.otLogging.logEvent({ action: 'testConnectivity', variation: 'Attempt' });
    if (typeof onComplete !== 'function' || onComplete.length !== 1) {
      this.otLogging.logEvent({ action: 'testConnectivity', variation: 'Failure' });
      throw new InvalidOnCompleteCallback();
    }
    return testConnectivity(this.OT, this.credentials, this.otLogging, onComplete);
  }

  /**
   * This function runs a test publisher and based on the measured video bitrate,
   * audio bitrate, and the audio packet loss for the published stream, it returns
   * results indicating the recommended supported publisher settings.
   *
   * See the "API reference" section of the README.md file in the root of the
   * opentok-network-test-js project for details.
   */
  testQuality(
    updateCallback?: UpdateCallback<UpdateCallbackStats>,
    completionCallback?: TestQualityCompletionCallback): Promise<any> {
    this.otLogging.logEvent({ action: 'testQuality', variation: 'Attempt' });
    if (updateCallback) {
      if (typeof updateCallback !== 'function' || updateCallback.length !== 1) {
        this.otLogging.logEvent({ action: 'testQuality', variation: 'Failure' });
        throw new InvalidOnUpdateCallback();
      }
    }
    if (completionCallback) {
      if (typeof completionCallback !== 'function' || completionCallback.length !== 2) {
        this.otLogging.logEvent({ action: 'testQuality', variation: 'Failure' });
        throw new InvalidOnCompleteCallback();
      }
    }

    return testQuality(
      this.OT, this.credentials, this.otLogging, updateCallback, completionCallback);
  }
}

export { ErrorNames } from './errors/types';
