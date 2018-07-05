/* tslint: disable */

import * as OTClient from '@opentok/client';
import {
  primary as sessionCredentials,
  faultyLogging as badLoggingCredentials,
  faultyApi as badApiCredentials,
} from './credentials.json';
import {
  NetworkTestError,
  MissingOpenTokInstanceError,
  MissingSessionCredentialsError,
  IncompleteSessionCredentialsError,
  InvalidOnCompleteCallback,
  InvalidOnUpdateCallback,
} from '../src/NetworkTest/errors';
import { ConnectivityError, ConnectToSessionTokenError, PublishToSessionError } from '../src/NetworkTest/testConnectivity/errors';
import { ConnectToSessionError as QualityTestSessionError } from '../src/NetworkTest/testQuality/errors';
import NetworkTest, { ErrorNames } from '../src/NetworkTest';
import { ConnectivityTestResults } from '../src/NetworkTest/testConnectivity/index';
import { QualityTestError } from '../src/NetworkTest/testQuality/errors/index';

type Util = jasmine.MatchersUtil;
type CustomMatcher = jasmine.CustomMatcher;
type EqualityTesters = jasmine.CustomEqualityTester[];

const malformedCredentials = { apiKey: '1234', invalidProp: '1234', token: '1234' };
const badCredentials = { apiKey: '1234', sessionId: '1234', token: '1234' };
const networkTest = new NetworkTest(OTClient, sessionCredentials);
const badCredentialsNetworkTest = new NetworkTest(OTClient, badCredentials);
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

describe('NetworkTest', () => {

  beforeAll(() => {
    jasmine.addMatchers(customMatchers);
  });

  it('its constructor requires OT and valid session credentials', () => {
    expect(() => new NetworkTest(sessionCredentials)).toThrow(new MissingOpenTokInstanceError());
    expect(() => new NetworkTest({}, sessionCredentials)).toThrow(new MissingOpenTokInstanceError());
    expect(() => new NetworkTest(OTClient)).toThrow(new MissingSessionCredentialsError());
    expect(() => new NetworkTest(OTClient, malformedCredentials)).toThrow(new IncompleteSessionCredentialsError());
    expect(new NetworkTest(OTClient, sessionCredentials)).toBeInstanceOf(NetworkTest);
  });

  it('it contains a valid ErrorNames module', () => {
    expect(ErrorNames.MISSING_OPENTOK_INSTANCE).toBe('MissingOpenTokInstanceError');
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
            expect(results.success).toBeABoolean;
            expect(results.failedTests).toBeInstanceOf(Array);
            done();
          });
      }, 10000);

      it('should return a failed test case if invalid session credentials are used', (done) => {
        const validateResults = (results: ConnectivityTestResults) => {
          expect(results.success).toBe(false);
          expect(results.failedTests).toBeInstanceOf(Array);
          const [initialFailure, secondaryFailure] = results.failedTests;
          expect(initialFailure.type).toBe('messaging');
          expect(initialFailure.error.name).toBe(ErrorNames.CONNECT_TO_SESSION_TOKEN_ERROR);
          expect(secondaryFailure.type).toBe('media');
          expect(secondaryFailure.error.name).toBe(ErrorNames.FAILED_MESSAGING_SERVER_TEST);
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
          ...OTClient,
          ...{
            properties: {
              ...OTClient.properties,
              loggingURL: OTClient.properties.loggingURL.replace('tokbox', 'bad-tokbox')
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
        const realInitSession = OT.initSession;
        spyOn(OT, 'initSession').and.callFake((apiKey, sessionId) => {
          const session = realInitSession(apiKey, sessionId);
          spyOn(session, 'connect').and.callFake((token, callback) => {
            const error = new Error();
            error.name = 'OT_CONNECT_FAILED';
            callback(error);
          });
          return session;
        });
        const badApiNetworkTest = new NetworkTest(OT, sessionCredentials);
        badApiNetworkTest.testConnectivity()
          .then((results: ConnectivityTestResults) => {
            expect(results.failedTests).toBeInstanceOf(Array);
            if (results.failedTests.find(f => f.type === 'api')) {
              done();
            }
          });
      }, 1000);
    });

    describe('Quality Test', () => {
      it('validates its onUpdate and onComplete callbacks', () => {
        expect(() => networkTest.testQuality('callback').toThrow(new InvalidOnUpdateCallback()))
        expect(() => networkTest.testQuality(validOnUpdateCallback, 'callback').toThrow(new InvalidOnCompleteCallback()))
        expect(() => networkTest.testConnectivity(null, validOnUpdateCallback, validOnCompleteCallback).not.toThrowError(NetworkTestError))
      });

      it('should return an error if invalid session credentials are used', (done) => {
        const validateResults = (results: QualityTestResults) => {
          expect(results).toBe(undefined);
        };

        const validateError = (error?: QualityTestError) => {
          expect(error.name).toBe(ErrorNames.CONNECT_TO_SESSION_ERROR);
        };

        badCredentialsNetworkTest.testQuality(null)
          .then(validateResults)
          .catch(validateError)
          .finally(done);
      });

      it('should return valid test results or an error', (done) => {
        const validateResults = (results: QualityTestResults) => {
          const { audio, video } = results;


          expect(audio.bitrate).toEqual(jasmine.any(Number));
          expect(audio.supported).toEqual(jasmine.any(Boolean));
          expect(audio.reason || '').toEqual(jasmine.any(String));
          expect(audio.packetLossRatio).toEqual(jasmine.any(Number));
          expect(audio.mos).toEqual(jasmine.any(Number));

          expect(video.supported).toEqual(jasmine.any(Boolean));
          if (video.supported) {
            expect(video.bitrate).toEqual(jasmine.any(Number));
            expect(video.packetLossRatio).toEqual(jasmine.any(Number));
            expect(video.frameRate).toEqual(jasmine.any(Number));
            expect(video.recommendedResolution).toEqual(jasmine.any(String));
            expect(video.recommendedFrameRate).toEqual(jasmine.any(Number));
            expect(video.mos).toEqual(jasmine.any(Number));
          } else {
            expect(video.reason).toEqual(jasmine.any(String));
          }
        };

        const validateError = (error?: QualityTestError) => {
          expect(error.name).toBe(QUALITY_TEST_ERROR);
        };

        const onUpdate = (stats: Stats) => console.info('Subscriber stats:', stats);

        networkTest.testQuality(onUpdate)
          .then(validateResults)
          .catch(validateError)
          .finally(done);
      }, 40000);

      it('should return valid test results or an error when there is no camera', (done) => {
        const realOTGetDevices = OT.getDevices;
        OT.getDevices = (callbackFn) => {
          realOTGetDevices((error, devices) => {
            devices = devices.filter(device => device.kind != 'videoInput');
            callbackFn(error, devices);
          });
        };

        const validateResults = (results: QualityTestResults) => {
          const { mos, audio, video } = results;

          expect(audio.bitrate).toEqual(jasmine.any(Number));
          expect(audio.supported).toEqual(jasmine.any(Boolean));
          expect(audio.reason || '').toEqual(jasmine.any(String));
          expect(audio.packetLossRatio).toEqual(jasmine.any(Number));
          expect(audio.mos).toEqual(jasmine.any(Number));

          expect(video.supported).toEqual(false);
          expect(video.reason).toEqual('No camera was found.');
        };

        const validateError = (error?: QualityTestError) => {
          expect(error).toBe(QualityTestError);
        };

        const onUpdate = (stats: Stats) => console.info('Subscriber stats:', stats);

        networkTest.testQuality(onUpdate)
          .then(validateResults)
          .catch(validateError)
          .finally(() => {
            OT.getDevices = realOTGetDevices;
            done();
          });
      }, 8000);
    });
  });
});
