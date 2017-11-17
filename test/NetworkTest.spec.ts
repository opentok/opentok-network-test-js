/* tslint:disable */
///<reference path="../src/types/index.d.ts"/>

import {
  NetworkTestError,
  InvalidSessionCredentialsError,
  MissingOpenTokInstanceError,
  MissingSessionCredentialsError,
  IncompleteSessionCredentialsError,
  InvalidOnCompleteCallback,
  InvalidOnUpdateCallback,
} from '../src/NetworkTest/errors';
import * as OT from '@opentok/client';
import NetworkTest from '../src/NetworkTest';
import { escapeExpression } from 'handlebars';
type Util = jasmine.MatchersUtil;
type CustomMatcher = jasmine.CustomMatcher;
type EqualityTesters = jasmine.CustomEqualityTester[];

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
};

describe('Network Test', () => {

  const malformedCredentials = {
    apiKey: '1234',
    invalidProp: '1234',
    token: '1234',
  };

  const validCredentials = {
    apiKey: '1234',
    sessionId: '1234',
    token: '1234',
  };

  const networkTest = new NetworkTest(OT, validCredentials);

  const validOnUpdateCallback = (stats: OT.SubscriberStats) => stats;
  const validOnCompleteCallback = (error?: Error, results?: any) => results;

  beforeAll(() => jasmine.addMatchers(customMatchers));

  it('its constructor requires OT and valid session credentials', () => {
    expect(() => new NetworkTest(validCredentials)).toThrow(new MissingOpenTokInstanceError());
    expect(() => new NetworkTest({}, validCredentials)).toThrow(new MissingOpenTokInstanceError());
    expect(() => new NetworkTest(OT)).toThrow(new MissingSessionCredentialsError());
    expect(() => new NetworkTest(OT, malformedCredentials)).toThrow(new IncompleteSessionCredentialsError());
    expect(new NetworkTest(OT, validCredentials)).toBeInstanceOf(NetworkTest);
  });

  describe('Connectivity Test', () => {
    it('validates its onComplete callback', () => {
      expect(() => networkTest.testConnectivity('callback').toThrow(new InvalidOnCompleteCallback()))
      expect(() => networkTest.testConnectivity(validOnCompleteCallback).not.toThrowError(NetworkTestError))
    })
  })

  describe('Quality Test', () => {
    it('validates its onUpdate and onComplete callbacks', () => {
      expect(() => networkTest.testQuality('callback').toThrow(new InvalidOnUpdateCallback()))
      expect(() => networkTest.testQuality(validOnUpdateCallback, 'callback').toThrow(new InvalidOnCompleteCallback()))
      expect(() => networkTest.testConnectivity(validOnUpdateCallback, validOnCompleteCallback).not.toThrowError(NetworkTestError))
    })
  })

});
