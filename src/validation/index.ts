import { InvalidOnStatusCallback, InvalidOnCompleteCallback } from '../errors';

const validateCallbacks = (onStatus, onComplete) => {

  if (onStatus) {
    if (typeof onStatus !== 'function' || onStatus.length !== 1) {
      throw new InvalidOnStatusCallback();
    }
  }

  if (onComplete) {
    if (typeof onComplete !== 'function' || onComplete.length !== 2) {
      throw new InvalidOnCompleteCallback();
    }
  }
};

export {
  validateCallbacks,
};

