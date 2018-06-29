/**
 * @module NetworkTest
 */

/**
* Define Network Connectivy class
*/

const version = require('../../package.json').version;
import { OT } from './types/opentok';
import { CompletionCallback, UpdateCallback, UpdateCallbackStats } from './types/callbacks';
import {
  testConnectivity,
  TestConnectivityCallback,
  ConnectivityTestResults,
} from './testConnectivity';
import { testQuality, TestQualityCompletionCallback, QualityTestResults } from './testQuality';
import {
  IncompleteSessionCredentialsError,
  InvalidOnCompleteCallback,
  InvalidOnUpdateCallback,
  MissingOpenTokInstanceError,
  MissingSessionCredentialsError,
} from './errors';
/* tslint:disable */
import OTKAnalytics = require('opentok-solutions-logging');
/* tslint:enable */

export interface NetworkTestOptions {
  audioOnly?: boolean;
}

export default class NetworkTest {
  credentials: OT.SessionCredentials;
  OT: OT.Client;
  otLogging: OTKAnalytics;
  options?: NetworkTestOptions;

  /**
   * Returns an instance of NetworkConnectivity. See the "API reference" section of the
   * README.md file in the root of the opentok-network-test-js project for details.
   */
  constructor(OT: OT.Client, credentials: OT.SessionCredentials, options?: NetworkTestOptions) {
    this.validateOT(OT);
    this.validateCredentials(credentials);
    this.otLogging = this.startLoggingEngine(credentials.apiKey, credentials.sessionId);
    this.OT = OT;
    this.credentials = credentials;
    this.options = options;
  }

  private validateOT(OT: OT.Client) {
    if (!OT || typeof OT !== 'object' || !OT.initSession) {
      throw new MissingOpenTokInstanceError();
    }
  }

  private validateCredentials(credentials: OT.SessionCredentials) {
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
    if (onComplete && (typeof onComplete !== 'function' || onComplete.length !== 1)) {
      this.otLogging.logEvent({ action: 'testConnectivity', variation: 'Failure' });
      throw new InvalidOnCompleteCallback();
    }
    return testConnectivity(this.OT, this.credentials, this.otLogging, this.options, onComplete);
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
    completionCallback?: TestQualityCompletionCallback): Promise<QualityTestResults> {
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
      this.OT, this.credentials, this.otLogging, this.options, updateCallback, completionCallback);
  }
}

export { ErrorNames } from './errors/types';
