/**
 * @module NetworkTest
 */
import { OT } from './types/opentok';
import { UpdateCallback, UpdateCallbackStats } from './types/callbacks';
import { ConnectivityTestResults } from './testConnectivity';
import { QualityTestResults } from './testQuality';
import OTKAnalytics = require('opentok-solutions-logging');
export interface NetworkTestOptions {
    audioOnly?: boolean;
    timeout?: number;
    audioSource?: string;
    videoSource?: string;
    initSessionOptions?: OT.InitSessionOptions;
    proxyServerUrl?: string;
    skipPublisherCleaningOnSuccess?: boolean;
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
    constructor(OT: OT.Client, credentials: OT.SessionCredentials, options?: NetworkTestOptions);
    private validateOT;
    private validateCredentials;
    private validateProxyUrl;
    private setProxyUrl;
    private startLoggingEngine;
    /**
     * This method checks to see if the client can connect to TokBox servers required for
     * using OpenTok.
     *
     * See the "API reference" section of the README.md file in the root of the
     * opentok-network-test-js project for details.
     */
    testConnectivity(): Promise<ConnectivityTestResults>;
    /**
     * This function runs a test publisher and based on the measured video bitrate,
     * audio bitrate, and the audio packet loss for the published stream, it returns
     * results indicating the recommended supported publisher settings.
     *
     * See the "API reference" section of the README.md file in the root of the
     * opentok-network-test-js project for details.
     */
    testQuality(updateCallback?: UpdateCallback<UpdateCallbackStats>): Promise<QualityTestResults>;
    /**
     * Stops the currently running test.
     *
     * See the "API reference" section of the README.md file in the root of the
     * opentok-network-test-js project for details.
     */
    stop(): void;
}
export { ErrorNames } from './errors/types';
