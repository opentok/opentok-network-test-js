import * as _Promise from 'promise';

// tslint:disable-next-line: variable-name
export let Promise: PromiseConstructor;

if (
  typeof window.Promise !== 'undefined' &&
  window.Promise.toString().indexOf('[native code]') !== -1
) {
  Promise = window.Promise;
} else {
  Promise = _Promise as any;
}
