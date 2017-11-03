import { InvalidOnStatusCallback, InvalidOnCompleteCallback } from '../errors';

const validateCallbacks = (onStatus, onComplete) => {
  if (onStatus && typeof callback !== 'function') {
    throw new InvalidOnStatusCallback();
  }

  if (onComplete && typeof callback !== 'function') {
    throw new InvalidOnCompleteCallback();
  }
};

module.exports = {
  validateCallbacks,
};

