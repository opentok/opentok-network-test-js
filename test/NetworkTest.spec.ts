/* tslint:disable */
///<reference path="../src/types/index.d.ts"/>

import * as OT from '@opentok/client';
import * as credentials from './credentials.json';
import {
  NetworkTestError,
  InvalidSessionCredentialsError,
  MissingOpenTokInstanceError,
  MissingSessionCredentialsError,
  IncompleteSessionCredentialsError,
  InvalidOnCompleteCallback,
  InvalidOnUpdateCallback,
} from '../src/NetworkTest/errors';
import { ConnectToSessionTokenError } from '../src/NetworkTest/testConnectivity/errors';
import { pick } from '../src/util';
import NetworkTest from '../src/NetworkTest';
import { ConnectivityTestResults } from '../src/NetworkTest/testConnectivity/index';

type Util = jasmine.MatchersUtil;
type CustomMatcher = jasmine.CustomMatcher;
type EqualityTesters = jasmine.CustomEqualityTester[];

const sessionCredentials = credentials.standard;
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
            it('should contain a boolean success property', (done) => {
              expect(results.success).toBeABoolean
            });
            it('should contain an array of failedTests', (done) => {
              expect(results.failedTests).toBeInstanceOf(Array);
            });
            done();
          });
      });

      it('should return an error if invalid session credentials are used', (done) => {
        badNetworkTest.testConnectivity()
          .then((results: ConnectivityTestResults) => {
            it('should contain a boolean success property', (done) => {
              expect(results.success).toBeABoolean
            });
            it('should contain an array of failedTests', (done) => {
              expect(results.failedTests).toBeInstanceOf(Array);
            });
            done();
          })
          .catch((error: NetworkTestError) => {
            expect(error).toBeInstanceOf(ConnectToSessionTokenError);
          })
      });
    });

    describe('Quality Test', () => {
      it('validates its onUpdate and onComplete callbacks', () => {
        expect(() => networkTest.testQuality('callback').toThrow(new InvalidOnUpdateCallback()))
        expect(() => networkTest.testQuality(validOnUpdateCallback, 'callback').toThrow(new InvalidOnCompleteCallback()))
        expect(() => networkTest.testConnectivity(validOnUpdateCallback, validOnCompleteCallback).not.toThrowError(NetworkTestError))
      })
    });
  });
});
