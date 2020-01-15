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
const networkTestWithOptions = new NetworkTest(OTClient, sessionCredentials, {
  audioOnly: true,
  timeout: 5000,
});
const badCredentialsNetworkTest = new NetworkTest(OTClient, badCredentials);
const validOnUpdateCallback = (stats: OT.SubscriberStats) => stats;

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
    const testConnectFailure = (errorName, expectedType) => {
      return new Promise((resolve, reject) => {
        const realInitSession = OT.initSession;
        spyOn(OT, 'initSession').and.callFake((apiKey, sessionId) => {
          const session = realInitSession(apiKey, sessionId);
          spyOn(session, 'connect').and.callFake((token, callback) => {
            const error = new Error();
            error.name = errorName;
            callback(error);
          });
          return session;
        });
        const netTest = new NetworkTest(OT, sessionCredentials);
        netTest.testConnectivity()
          .then((results: ConnectivityTestResults) => {
            expect(results.failedTests).toBeInstanceOf(Array);
            if (results.failedTests.find(f => f.type === expectedType)) {
              resolve();
            }
          });
      });
    };

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
        testConnectFailure('OT_CONNECT_FAILED', 'api').then(done);
      }, 1000);

      it('results in a failed test when session.connect() gets an invalid HTTP status', (done) => {
        testConnectFailure('OT_INVALID_HTTP_STATUS', 'api').then(done);
      }, 1000);

      it('results in a failed test if session.connect() gets an authentication error', (done) => {
        testConnectFailure('OT_AUTHENTICATION_ERROR', 'messaging').then(done);
      }, 1000);
      it('results in a failed test if OT.getDevices() returns an error', (done) => {
        spyOn(OT, 'getDevices').and.callFake((callback) => {
          callback(new Error());
        });
        networkTest.testConnectivity()
          .then((results: ConnectivityTestResults) => {
            expect(results.success).toBe(false);
            expect(results.failedTests).toBeInstanceOf(Array);
            if (results.failedTests.find(f => f.type === 'OpenTok.js')) {
              done();
            }
          });
      }, 10000);
      it('results in a failed test if there are no cameras or mics', (done) => {
        spyOn(OT, 'getDevices').and.callFake((callback) => {
          callback(null, []);
        });
        networkTest.testConnectivity()
          .then((results: ConnectivityTestResults) => {
            expect(results.success).toBe(false);
            expect(results.failedTests).toBeInstanceOf(Array);
            if (results.failedTests.find(f => f.type === 'OpenTok.js')) {
              done();
            }
          });
      }, 10000);
      it('results in a failed test if session.connect() gets an authentication error', (done) => {
        testConnectFailure('OT_AUTHENTICATION_ERROR', 'messaging').then(done);
      }, 1000);
      it('results in a failed test if OT.initPublisher() returns an error', (done) => {
        spyOn(OT, 'initPublisher').and.callFake((target, options, callback) => {
          callback(new Error());
        });
        networkTest.testConnectivity()
          .then((results: ConnectivityTestResults) => {
            expect(results.success).toBe(false);
            expect(results.failedTests).toBeInstanceOf(Array);
            if (results.failedTests.find(f => f.type === 'OpenTok.js')) {
              done();
            }
          });
      }, 10000);
      it('results in a failed test if Session.subscribe() returns an error', (done) => {
        const realInitSession = OT.initSession;
        spyOn(OT, 'initSession').and.callFake((apiKey, sessionId) => {
          const session = realInitSession(apiKey, sessionId);
          spyOn(session, 'subscribe').and.callFake((stream, target, config, callback) => {
            const error = new Error();
            callback(error);
          });
          return session;
        });
        networkTest.testConnectivity()
          .then((results: ConnectivityTestResults) => {
            expect(results.success).toBe(false);
            expect(results.failedTests).toBeInstanceOf(Array);
            if (results.failedTests.find(f => f.type === 'media')) {
              done();
            }
          });
      }, 10000);
    });

    describe('Quality Test', () => {
      const validateResultsUndefined = (results: QualityTestResults) => {
        expect(results).toBe(undefined);
      };

      const validateUnsupportedBrowserError = (error?: QualityTestError) => {
        expect(error.name).toBe(ErrorNames.UNSUPPORTED_BROWSER);
      };

      const testConnectFailure = (otErrorName, netTestErrorName) => {
        const realInitSession = OT.initSession;
        spyOn(OT, 'initSession').and.callFake((apiKey, sessionId) => {
          const session = realInitSession(apiKey, sessionId);
          spyOn(session, 'connect').and.callFake((token, callback) => {
            const error = new Error();
            error.name = otErrorName;
            callback(error);
          });
          return session;
        });

        const validateResults = (results: QualityTestResults) => {
          expect(results).toBe(undefined);
        };

        const validateError = (error?: QualityTestError) => {
          expect(error.name).toBe(netTestErrorName);
        };

        networkTest.testQuality(null)
          .then(validateResults)
          .catch(validateError);
      };

      const validateStandardResults = (results: QualityTestResults) => {
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

      it('validates its onUpdate callback', () => {
        expect(() => networkTest.testQuality('callback').toThrow(new InvalidOnUpdateCallback()))
        expect(() => networkTest.testConnectivity(validOnUpdateCallback)
          .not.toThrowError(NetworkTestError))
      });

      it('should return an error if invalid session credentials are used', (done) => {
        const validateResults = (results: QualityTestResults) => {
          expect(results).toBe(undefined);
        };

        const validateError = (error?: QualityTestError) => {
          expect(error.name).toBe(ErrorNames.CONNECT_TO_SESSION_TOKEN_ERROR);
        };

        badCredentialsNetworkTest.testQuality(null)
          .then(validateResults)
          .catch(validateError)
          .finally(done);
      });

      it('should return an error if session.connect() gets an authentication error', () => {
        testConnectFailure('OT_AUTHENTICATION_ERROR', ErrorNames.CONNECT_TO_SESSION_TOKEN_ERROR);
      });

      it('should return an error if session.connect() gets a session ID error', () => {
        testConnectFailure('OT_INVALID_SESSION_ID', ErrorNames.CONNECT_TO_SESSION_ID_ERROR);
      });

      it('should return an error if session.connect() gets a network error', () => {
        testConnectFailure('OT_CONNECT_FAILED', ErrorNames.CONNECT_TO_SESSION_NETWORK_ERROR);
      });

      it('results in a failed test if OT.getDevices() returns an error', (done) => {
        spyOn(OT, 'getDevices').and.callFake((callback) => {
          callback(new Error());
        });
        networkTest.testQuality()
          .catch((error?: QualityTestError) => {
            expect(error.name).toBe(ErrorNames.FAILED_TO_OBTAIN_MEDIA_DEVICES);
            done();
          });
      }, 10000);

      it('results in a failed test if there are no mics', (done) => {
        const realOTGetDevices = OT.getDevices;
        spyOn(OT, 'getDevices').and.callFake((callbackFn) => {
          realOTGetDevices((error, devices) => {
            const onlyVideoDevices = devices.filter(device => device.kind !== 'audioInput');
            callbackFn(error, onlyVideoDevices);
          });
        });
        networkTest.testQuality()
          .catch((error?: QualityTestError) => {
            expect(error.name).toBe(ErrorNames.NO_AUDIO_CAPTURE_DEVICES);
            done();
          });
      }, 10000);

      it('should return valid test results or an error', (done) => {
        const validateError = (error?: QualityTestError) => {
          expect(error.name).toBe(QUALITY_TEST_ERROR);
        };

        const onUpdate = (stats: Stats) => console.info('Subscriber stats:', stats);

        networkTest.testQuality(onUpdate)
          .then(validateStandardResults)
          .catch(validateError)
          .finally(done);
      }, 40000);

      it('should run a valid test or error when give audiOnly and timeout options', (done) => {
        const validateResults = (results: QualityTestResults) => {
          const { audio, video } = results;

          expect(audio.bitrate).toEqual(jasmine.any(Number));
          expect(audio.supported).toEqual(jasmine.any(Boolean));
          expect(audio.reason || '').toEqual(jasmine.any(String));
          expect(audio.packetLossRatio).toEqual(jasmine.any(Number));
          expect(audio.mos).toEqual(jasmine.any(Number));

          expect(video.supported).toEqual(false);
        };

        const validateError = (error?: QualityTestError) => {
          expect(error.name).toBe(QUALITY_TEST_ERROR);
        };

        const onUpdate = (stats: Stats) => console.info('Subscriber stats:', stats);

        networkTestWithOptions.testQuality(onUpdate)
          .then(validateResults)
          .catch(validateError)
          .finally(done);
      }, 10000);

      it('should stop the quality test when you call the stop() method', (done) => {
        const validateError = (error?: QualityTestError) => {
          expect(error.name).toBe(QUALITY_TEST_ERROR);
        };

        const onUpdate = (stats: Stats) => {
          console.info('Subscriber stats:', stats);
          networkTest.stop(); // The test will wait for adequate stats before stopping
        };

        networkTest.testQuality(onUpdate)
          .then(validateStandardResults)
          .catch(validateError)
          .finally(done);
      }, 10000);

      it('should return valid test results or an error when there is no camera', (done) => {
        const realOTGetDevices = OT.getDevices;
        spyOn(OT, 'getDevices').and.callFake((callbackFn) => {
          realOTGetDevices((error, devices) => {
            const onlyAudioDevices = devices.filter(device => device.kind !== 'videoInput');
            callbackFn(error, onlyAudioDevices);
          });
        });

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
          .finally(done);
      }, 8000);

      it('should return an error if the window.navigator is undefined', () => {
        spyOnProperty(window, 'navigator', 'get').and.returnValue(undefined);
        networkTest.testQuality(null)
        .then(validateResultsUndefined)
        .catch(validateUnsupportedBrowserError)
      });

      it('should return an unsupported browser error if the browser is an older version of Edge', () => {
        const mozGetUserMedia = navigator.mozGetUserMedia;
        const webkitGetUserMedia = navigator.webkitGetUserMedia;
        navigator.mozGetUserMedia = undefined;
        navigator.webkitGetUserMedia = undefined;
        spyOnProperty(window.navigator, 'userAgent', 'get').and.returnValue('Edge');
        networkTest.testQuality(null)
          .then(validateResultsUndefined)
          .catch(validateUnsupportedBrowserError)
          .finally(() => {
            navigator.mozGetUserMedia = mozGetUserMedia;
            navigator.webkitGetUserMedia = webkitGetUserMedia;
          });
      });

      it('should run the test if the browser is a Chromium-based version of Edge', (done) => {
        const mozGetUserMedia = navigator.mozGetUserMedia;
        const webkitGetUserMedia = navigator.webkitGetUserMedia;
        navigator.mozGetUserMedia = {};
        navigator.webkitGetUserMedia = {};
        spyOnProperty(window.navigator, 'userAgent', 'get').and.returnValue('Edg');
        networkTestWithOptions.testQuality()
          .then(() => {
            navigator.mozGetUserMedia = mozGetUserMedia;
            navigator.webkitGetUserMedia = webkitGetUserMedia;
            done();
        });
      }, 10000);

      it('results in a failed test if OT.initPublisher() returns an error', (done) => {
        spyOn(OT, 'initPublisher').and.callFake((target, options, callback) => {
          callback(new Error());
        });
        networkTest.testQuality().catch((error?: QualityTestError) => {
          expect(error.name).toBe(ErrorNames.INIT_PUBLISHER_ERROR);
          done();
        });
      }, 10000);

      it('results in a failed test if Session.subscribe() returns an error', (done) => {
        const realInitSession = OT.initSession;
        spyOn(OT, 'initSession').and.callFake((apiKey, sessionId) => {
          const session = realInitSession(apiKey, sessionId);
          spyOn(session, 'subscribe').and.callFake((stream, target, config, callback) => {
            const error = new Error();
            callback(error);
          });
          return session;
        });
        networkTest.testQuality().catch((error?: QualityTestError) => {
          expect(error.name).toBe(ErrorNames.SUBSCRIBE_TO_SESSION_ERROR);
          done();
        });
      }, 10000);
    });
  });
});
