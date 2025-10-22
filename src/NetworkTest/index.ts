/**
 * @module NetworkTest
 */

/**
* Define Network Connectivy class
*/

// eslint-disable-next-line
const version = require('../../package.json').version;
import { SessionCredentials, InitSessionOptions } from './types/session';
import { UpdateCallback, UpdateCallbackStats } from './types/callbacks';
import {
  testConnectivity,
  ConnectivityTestResults,
} from './testConnectivity';
import {
  testQuality,
  stopQualityTest,
  QualityTestResults,
} from './testQuality';
import {
  IncompleteSessionCredentialsError,
  InvalidOnUpdateCallback,
  MissingOpenTokInstanceError,
  MissingSessionCredentialsError,
} from './errors';
import OTKAnalytics = require('opentok-solutions-logging');

export interface NetworkTestOptions {
  audioOnly?: boolean;
  timeout?: number;
  audioSource?: string;
  videoSource?: string;
  initSessionOptions?: InitSessionOptions;
  proxyServerUrl?: string;
  scalableVideo?: boolean;
  fullHd?: boolean;
}

export default class NetworkTest {
  credentials: SessionCredentials;
  OTInstance: typeof OT;
  otLogging: OTKAnalytics;
  options?: NetworkTestOptions;

  /**
   * Returns an instance of NetworkConnectivity. See the "API reference" section of the
   * README.md file in the root of the @vonage/video-client-network-test project for details.
   */
  constructor(OTInstance: typeof OT, credentials: SessionCredentials, options?: NetworkTestOptions) {
    this.validateOT(OTInstance);
    this.validateCredentials(credentials);
    const proxyServerUrl = this.validateProxyUrl(options);
    this.otLogging = this.startLoggingEngine(credentials.apiKey, credentials.sessionId, proxyServerUrl);
    this.OTInstance = OTInstance;
    this.credentials = credentials;
    this.options = options;
    this.setProxyUrl(proxyServerUrl);
  }

  private validateOT(OTInstance: typeof OT) {
    if (!OTInstance || typeof OTInstance !== 'object' || !OTInstance.initSession) {
      throw new MissingOpenTokInstanceError();
    }
  }

  private validateCredentials(credentials: SessionCredentials) {
    if (!credentials) {
      throw new MissingSessionCredentialsError();
    }
    if (!credentials.applicationId || !credentials.sessionId || !credentials.token) {
      throw new IncompleteSessionCredentialsError();
    }
  }

  private validateProxyUrl(options?: NetworkTestOptions): string {
    if (!options || !options.proxyServerUrl) {
      return '';
    }
    return options.proxyServerUrl;
  }

  private setProxyUrl(proxyServerUrl: string) {
    if (this.OTInstance.setProxyUrl && typeof this.OTInstance.setProxyUrl === 'function' && proxyServerUrl) {
      this.OTInstance.setProxyUrl(proxyServerUrl);
    }
  }

  private startLoggingEngine(applicationId: string, sessionId: string, proxyUrl: string): OTKAnalytics {
    return new OTKAnalytics({
      sessionId,
      partnerId: applicationId,
      source: window.location.href,
      clientVersion: `js-network-test-${version}`,
      name: 'opentok-network-test',
      componentId: 'opentok-network-test',
    }, {
      proxyUrl,
    });
  }

  /**
   * This method checks to see if the client can connect to Vonage Video API servers required for
   * using Vonage Video API.
   *
   * See the "API reference" section of the README.md file in the root of the
   * @vonage/video-client-network-test project for details.
   */
  testConnectivity(): Promise<ConnectivityTestResults> {
    this.otLogging.logEvent({ action: 'testConnectivity', variation: 'Attempt' });
    return testConnectivity(this.OTInstance, this.credentials, this.otLogging, this.options);
  }

  /**
   * This function runs a test publisher and based on the measured video bitrate,
   * audio bitrate, and the audio packet loss for the published stream, it returns
   * results indicating the recommended supported publisher settings.
   *
   * See the "API reference" section of the README.md file in the root of the
   * @vonage/video-client-network-test project for details.
   */
  testQuality(updateCallback?: UpdateCallback<UpdateCallbackStats>): Promise<QualityTestResults> {
    this.otLogging.logEvent({ action: 'testQuality', variation: 'Attempt' });
    if (updateCallback) {
      if (typeof updateCallback !== 'function' || updateCallback.length !== 1) {
        this.otLogging.logEvent({ action: 'testQuality', variation: 'Failure' });
        throw new InvalidOnUpdateCallback();
      }
    }
    return testQuality(
      this.OTInstance, this.credentials, this.otLogging, this.options, updateCallback);
  }

  /**
   * Stops the currently running test.
   *
   * See the "API reference" section of the README.md file in the root of the
   * @vonage/video-client-network-test project for details.
   */
  stop() {
    stopQualityTest();
  }
}

export { ErrorNames } from './errors/types';
