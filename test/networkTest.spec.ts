/* tslint:disable */
///<reference path="../src/types/index.d.ts"/>

import {
  InvalidSessionCredentialsError,
  MissingOpenTokInstanceError,
  MissingSessionCredentialsError,
  IncompleteSessionCredentialsError,
} from '../src/networkTest/errors';
import * as OT from '@opentok/client';
import NetworkTest from '../src/NetworkTest';
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

describe('Network Test Contructor', () => {

  const malformedCredentials = {
    apiKey: '1234',
    sessionID: '1234',
    token: '1234',
  };

  const validCredentials = {
    apiKey: '1234',
    sessionId: '1234',
    token: '1234',
  };

  beforeAll(() => jasmine.addMatchers(customMatchers));

  it('requires OT and valid session credentials', () => {
    expect(() => new NetworkTest(validCredentials)).toThrow(new MissingOpenTokInstanceError());
    expect(() => new NetworkTest({}, validCredentials)).toThrow(new MissingOpenTokInstanceError());
    expect(() => new NetworkTest(OT)).toThrow(new MissingSessionCredentialsError());
    expect(() => new NetworkTest(OT, malformedCredentials)).toThrow(new IncompleteSessionCredentialsError());
    expect(new NetworkTest(OT, validCredentials)).toBeInstanceOf(NetworkTest);
  });

});
