/**
 * @module Test/Publishing
 * @preferred
 *
 * Defines the methods required for the Publishing Test Flow
 */
/**
 * Publishing Test Flow
 */
import OTKAnalytics = require('opentok-solutions-logging');
import * as Promise from 'promise';
import { NetworkTestOptions } from '../index';
import { OT } from '../types/opentok';
import { AverageStats, HasAudioVideo } from './types/stats';
import { UpdateCallback, UpdateCallbackStats } from '../types/callbacks';
export interface QualityTestResults extends HasAudioVideo<AverageStats> {
}
/**
 * This method checks to see if the client can publish to an OpenTok session.
 */
export declare function testQuality(OT: OT.Client, credentials: OT.SessionCredentials, otLogging: OTKAnalytics, options?: NetworkTestOptions, onUpdate?: UpdateCallback<UpdateCallbackStats>): Promise<QualityTestResults>;
export declare function stopQualityTest(): void;
