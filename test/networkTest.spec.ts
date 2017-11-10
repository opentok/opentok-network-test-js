///<reference path="../src/types/index.d.ts"/>


import {
  InvalidSessionCredentialsError,
  MissingOpenTokInstanceError,
  MissingSessionCredentialsError,
} from '../src/networkTest/errors';
import networkTest from '../src/networkTest';
import * as OT from '@opentok/client';

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

  it('requires OT and valid session credentials', () => {
    expect(() => new networkTest(validCredentials)).toThrow(new MissingOpenTokInstanceError());
    expect(() => new networkTest(OT)).toThrow(new MissingSessionCredentialsError());
    expect(() => new networkTest(OT, malformedCredentials)).toThrow(new InvalidSessionCredentialsError());
    // expect(new networkTest(OT, validCredentials)).toThrow(new InvalidSessionCredentialsError());
  });

});
