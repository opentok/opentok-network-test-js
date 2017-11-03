import Promise from 'promise';

export class ErrorExample extends Error {
  constructor() {
    super('This browser is not supported by OpenTok.');
  }
}

