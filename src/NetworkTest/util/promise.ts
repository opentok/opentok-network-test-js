import * as _Promise from 'promise';

// tslint:disable-next-line: variable-name
const _window: any = window;

// tslint:disable-next-line: variable-name
export let Promise: PromiseConstructor;

if (
  typeof _window.Promise !== 'undefined' &&
  _window.Promise.toString().indexOf('[native code]') !== -1
) {
  Promise = _window.Promise;
} else {
  Promise = _Promise as any;
}
