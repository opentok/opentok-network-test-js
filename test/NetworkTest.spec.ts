/* tslint:disable */
///<reference path="../src/types/index.d.ts"/>

import * as OT from '@opentok/client';
import * as Promise from 'promise';
import * as sessionCredentials from './credentials.json';
import {
  NetworkTestError,
  InvalidSessionCredentialsError,
  MissingOpenTokInstanceError,
  MissingSessionCredentialsError,
  IncompleteSessionCredentialsError,
  InvalidOnCompleteCallback,
  InvalidOnUpdateCallback,
} from '../src/NetworkTest/errors';
import { ConnectToSessionTokenError, ConnectToSessionSessionIdError, ConnectivityError, ConnectToSessionError } from '../src/NetworkTest/testConnectivity/errors';
import { ConnectToSessionError as QualityTestSessionError } from '../src/NetworkTest/testQuality/errors';
import { pick, head } from '../src/util';
import NetworkTest from '../src/NetworkTest';
import { ConnectivityTestResults } from '../src/NetworkTest/testConnectivity/index';
import { QualityTestError } from '../src/NetworkTest/testQuality/errors/index';
import { Stats } from 'fs-extra';

type Util = jasmine.MatchersUtil;
type CustomMatcher = jasmine.CustomMatcher;
type EqualityTesters = jasmine.CustomEqualityTester[];

const malformedCredentials = { apiKey: '1234', invalidProp: '1234', token: '1234' };
const badCredentials = { apiKey: '1234', sessionId: '1234', token: '1234' };
const networkTest = new NetworkTest(OT, sessionCredentials);
const badNetworkTest = new NetworkTest(OT, badCredentials);
const validOnUpdateCallback = (stats: OT.SubscriberStats) => stats;
const validOnCompleteCallback = (error?: Error, results?: any) => results;

const customMatchers: jasmine.CustomMatcherFactories = {
  toBeInstanceOf: (util: Util, customEqualityTesters: EqualityTesters): CustomMatcher => {
    return {
      compare: (actual: any, expected: any): jasmine.CustomMatcherResult => {
        const pass: boolean = actual instanceof expected;
        const message: string = pass ? '' : `Expected ${actual} to be an instance of ${expected}`;
        return { pass, message };
      },
    };
  },
  toBeABoolean: (util: Util, customEqualityTesters: EqualityTesters): CustomMatcher => {
    return {
      compare: (actual: any, expected: any): jasmine.CustomMatcherResult => {
        const pass: boolean = typeof actual === 'boolean';
        const message: string = pass ? '' : `Expected ${actual} to be an instance of ${expected}`;
        return { pass, message };
      },
    };
  },
};

describe('Network Test', () => {

  beforeAll(() => {
    jasmine.addMatchers(customMatchers);
  });

  it('its constructor requires OT and valid session credentials', () => {
    expect(() => new NetworkTest(sessionCredentials)).toThrow(new MissingOpenTokInstanceError());
    expect(() => new NetworkTest({}, sessionCredentials)).toThrow(new MissingOpenTokInstanceError());
    expect(() => new NetworkTest(OT)).toThrow(new MissingSessionCredentialsError());
    expect(() => new NetworkTest(OT, malformedCredentials)).toThrow(new IncompleteSessionCredentialsError());
    expect(new NetworkTest(OT, sessionCredentials)).toBeInstanceOf(NetworkTest);
  });

  describe('Connectivity Test', () => {

    it('validates its onComplete callback', () => {
      expect(() => networkTest.testConnectivity('callback').toThrow(new InvalidOnCompleteCallback()))
      expect(() => networkTest.testConnectivity(validOnCompleteCallback).not.toThrowError(NetworkTestError))
    });

    describe('Test Results', () => {
      it('should contain success and failedTests properties', (done) => {
        networkTest.testConnectivity()
          .then((results: ConnectivityTestResults) => {
            it('should contain a boolean success property', () => {
              expect(results.success).toBeABoolean
            });
            it('should contain an array of failedTests', () => {
              expect(results.failedTests).toBeInstanceOf(Array);
            });
            done();
          });
      }, 10000);

      it('should return a failed test case if invalid session credentials are used', (done) => {
        const validateResults = (results: ConnectivityTestResults) => {
          expect(results.success).toBe(false);
          expect(results.failedTests).toBeInstanceOf(Array);
          const { type, error } = head(results.failedTests);
          expect(type).toBe('api');
          expect(error).toBeInstanceOf(ConnectToSessionError);
        };

        const validateError = (error?: ConnectivityError) => {
          expect(error).toBeUndefined();
        };

        badNetworkTest.testConnectivity()
          .then(validateResults)
          .catch(validateError)
          .finally(done);
      });
    });

    describe('Quality Test', () => {
      it('validates its onUpdate and onComplete callbacks', () => {
        expect(() => networkTest.testQuality('callback').toThrow(new InvalidOnUpdateCallback()))
        expect(() => networkTest.testQuality(validOnUpdateCallback, 'callback').toThrow(new InvalidOnCompleteCallback()))
        expect(() => networkTest.testConnectivity(validOnUpdateCallback, validOnCompleteCallback).not.toThrowError(NetworkTestError))
      });

      it('should return an error if invalid session credentials are used', (done) => {
        const validateResults = (results: QualityTestResults) => {
          expect(results).toBe(undefined);
        };

        const validateError = (error?: QualityTestError) => {
          expect(error).toBeInstanceOf(QualityTestSessionError);
        };

        badNetworkTest.testQuality()
          .then(validateResults)
          .catch(validateError)
          .finally(done);
      });

      it('should return valid results or an error', (done) => {
        const validateResults = (results: QualityTestResults) => {
          const { mos, audio, video } = results;

          expect(mos).toEqual(jasmine.any(Number));

          const audioKeys = Object.keys(audio);
          expect(audioKeys).toContain('bitrate');
          expect(audioKeys).toContain('supported');
          expect(audioKeys).toContain('packetLossRatio');

          const videoKeys = Object.keys(video);
          expect(videoKeys).toContain('bitrate');
          expect(videoKeys).toContain('supported');
          expect(videoKeys).toContain('packetLossRatio');
          expect(videoKeys).toContain('frameRate');
          expect(videoKeys).toContain('recommendedResolution');
          expect(videoKeys).toContain('recommendedFrameRate');

        };

        const validateError = (error?: QualityTestError) => {
          expect(error).toBe(QualityTestError);
        };

        const onUpdate = (stats: Stats) => console.info('Subscriber stats:', stats);

        networkTest.testQuality(onUpdate)
          .then(validateResults)
          .catch(validateError)
          .finally(done);
      }, 35000);
    });
  });
});
