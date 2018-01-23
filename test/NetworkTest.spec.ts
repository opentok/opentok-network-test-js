/* tslint:disable */
///<reference path="../src/types/index.d.ts"/>

import * as OT from '@opentok/client';
import * as Promise from 'promise';
import {
  primary as sessionCredentials,
  faultyLogging as badLoggingCredentials,
  faultyApi as badApiCredentials,
} from './credentials.json';
import {
  NetworkTestError,
  InvalidSessionCredentialsError,
  MissingOpenTokInstanceError,
  MissingSessionCredentialsError,
  IncompleteSessionCredentialsError,
  InvalidOnCompleteCallback,
  InvalidOnUpdateCallback,
} from '../src/NetworkTest/errors';
import { ConnectToSessionTokenError, ConnectToSessionSessionIdError, ConnectivityError, ConnectToSessionError, PublishToSessionError } from '../src/NetworkTest/testConnectivity/errors';
import { ConnectToSessionError as QualityTestSessionError } from '../src/NetworkTest/testQuality/errors';
import { pick, head, nth } from '../src/util';
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
const badCredentialsNetworkTest = new NetworkTest(OT, badCredentials);
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
          const [initialFailure, secondaryFailure] = results.failedTests;
          expect(initialFailure.type).toBe('messaging');
          expect(initialFailure.error).toBeInstanceOf(ConnectToSessionError);
          expect(secondaryFailure.type).toBe('media');
          expect(secondaryFailure.error).toBeInstanceOf(PublishToSessionError);

        };

        const validateError = (error?: ConnectivityError) => {
          expect(error).toBeUndefined();
        };

        badCredentialsNetworkTest.testConnectivity()
          .then(validateResults)
          .catch(validateError)
          .finally(done);
      });

      it('should result in a failed test if the logging server cannot be reached', (done) => {
        const badLoggingOT = {
          ...OT,
          ...{
            properties: {
              ...OT.properties,
              loggingURL: OT.properties.loggingURL.replace('tokbox', 'bad-tokbox')
            }
          }
        };
        const badLoggingNetworkTest = new NetworkTest(badLoggingOT, badLoggingCredentials)
        badLoggingNetworkTest.testConnectivity()
          .then((results: ConnectivityTestResults) => {
            expect(results.failedTests).toBeInstanceOf(Array);
            if (results.failedTests.find(f => f.type === 'logging')) {
              done();
            }
          });
      }, 10000);

      it('should result in a failed test if the API server cannot be reached', (done) => {
        const badApiOT = {
          ...OT,
          ...{
            properties: {
              ...OT.properties,
              apiURL: OT.properties.apiURL.replace('opentok', 'bad-opentok')
            }
          }
        };
        // Why is this necessary? (Is an old session still connected?)
        OT.properties.apiURL = OT.properties.apiURL.replace('opentok', 'bad-opentok');
        const badApiNetworkTest = new NetworkTest(badApiOT, badApiCredentials)
        badApiNetworkTest.testConnectivity()
          .then((results: ConnectivityTestResults) => {
            expect(results.failedTests).toBeInstanceOf(Array);
            if (results.failedTests.find(f => f.type === 'api')) {
              done();
              OT.properties.apiURL = OT.properties.apiURL.replace('bad-opentok', 'opentok');
            }
            OT.properties.apiURL = OT.properties.apiURL.replace('bad-opentok', 'opentok');
          });
      }, 10000);
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

        badCredentialsNetworkTest.testQuality()
          .then(validateResults)
          .catch(validateError)
          .finally(done);
      });

      it('should return valid test results or an error', (done) => {
        const validateResults = (results: QualityTestResults) => {
          const { mos, audio, video } = results;

          expect(mos).toEqual(jasmine.any(Number));

          expect(audio.bitrate).toEqual(jasmine.any(Number));
          expect(audio.supported).toEqual(jasmine.any(Boolean));
          expect(audio.reason || '').toEqual(jasmine.any(String));
          expect(audio.packetLossRatio).toEqual(jasmine.any(Number));

          expect(video.bitrate).toEqual(jasmine.any(Number));
          expect(video.supported).toEqual(jasmine.any(Boolean));
          expect(video.reason || '').toEqual(jasmine.any(String));
          expect(video.packetLossRatio).toEqual(jasmine.any(Number));
          expect(video.frameRate).toEqual(jasmine.any(Number));
          expect(video.recommendedResolution).toEqual(jasmine.any(String));
          expect(video.recommendedFrameRate).toEqual(jasmine.any(Number));
        };

        const validateError = (error?: QualityTestError) => {
          expect(error).toBe(QualityTestError);
        };

        const onUpdate = (stats: Stats) => console.info('Subscriber stats:', stats);

        networkTest.testQuality(onUpdate)
          .then(validateResults)
          .catch(validateError)
          .finally(done);
      }, 40000);
    });
  });
});
