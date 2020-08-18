/**
 * @module Test/Connectivity
 * @preferred
 *
 * Defines the methods required for the Connectivity Test Flow
 */
import * as Promise from 'promise';
import OTKAnalytics = require('opentok-solutions-logging');
import { NetworkTestOptions } from '../index';
import { OT } from '../types/opentok';
import { FailureCase } from './errors/mapping';
export declare type ConnectivityTestResults = {
    success: boolean;
    failedTests: FailureCase[];
};
/**
 * This method checks to see if the client can connect to TokBox servers required for using OpenTok
 */
export declare function testConnectivity(OT: OT.Client, credentials: OT.SessionCredentials, otLogging: OTKAnalytics, options?: NetworkTestOptions): Promise<ConnectivityTestResults>;
