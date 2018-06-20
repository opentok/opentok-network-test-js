/**
 * @module NetworkTest
 */

/**
* Define Network Connectivy class
*/

const version = require('../../package.json').version;
import { OT } from './types/opentok';
import { CompletionCallback, UpdateCallback, UpdateCallbackStats } from './types/callbacks';
import { testConnectivity, ConnectivityTestResults } from './testConnectivity';
import testQuality, { QualityTestResults } from './testQuality';
import {
  IncompleteSessionCredentialsError,
  InvalidOnCompleteCallback,
  InvalidOnUpdateCallback,
  MissingOpenTokInstanceError,
  MissingSessionCredentialsError,
} from './errors';
import { get } from './util';
/* tslint:disable */
import OTKAnalytics = require('opentok-solutions-logging');
/* tslint:enable */

export default class NetworkTest {
  credentials: OT.SessionCredentials;
  OT: OT.Client;
  otLogging: OTKAnalytics;

  /**
   * Returns an instance of NetworkConnectivity. See the "API reference" section of the
   * README.md file in the root of the opentok-network-test-js project for details.
   */
  constructor(OT: OT.Client, credentials: OT.SessionCredentials) {
    this.validateOT(OT);
    this.validateCredentials(credentials);
    let loggingURL: string = get('properties.loggingURL', OT) || 'https://hlg.tokbox.com/prod';
    loggingURL += '/logging/ClientEvent';
    this.otLogging = this.startLoggingEngine(
      credentials.apiKey,
      credentials.sessionId,
      loggingURL,
    );
    this.OT = OT;
    this.credentials = credentials;
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
  private validateCallbacks(
    action: string,
    updateCallback?: UpdateCallback<any>,
    onComplete?: CompletionCallback<any>) {
    if (updateCallback) {
      if (typeof updateCallback !== 'function' || updateCallback.length !== 1) {
        this.otLogging.logEvent({ action, variation: 'Failure' });
        throw new InvalidOnUpdateCallback();
      }
    }
    if (onComplete) {
      if (typeof onComplete !== 'function' || onComplete.length !== 2) {
        this.otLogging.logEvent({ action, variation: 'Failure' });
        throw new InvalidOnCompleteCallback();
      }
    }
  }

  private startLoggingEngine(
    apiKey: string,
    sessionId: string,
    url: string,
  ): OTKAnalytics {
    return new OTKAnalytics({
      sessionId,
      partnerId: apiKey,
      source: window.location.href,
      clientVersion: 'js-network-test-' + version,
      name: 'opentok-network-test',
      componentId: 'opentok-network-test',
    }, {
      url,
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
    onComplete?: CompletionCallback<ConnectivityTestResults>): Promise<ConnectivityTestResults> {
    this.otLogging.logEvent({ action: 'testConnectivity', variation: 'Attempt' });
    this.validateCallbacks('testConnectivity', undefined, onComplete);
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
    completionCallback?: CompletionCallback<QualityTestResults>): Promise<QualityTestResults> {
    this.otLogging.logEvent({ action: 'testQuality', variation: 'Attempt' });
    this.validateCallbacks('testQuality', updateCallback, completionCallback);
    return testQuality(
      this.OT, this.credentials, this.otLogging, updateCallback, completionCallback);
  }
}
