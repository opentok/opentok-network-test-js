import * as Promise from 'promise';
import destroyOpentokObject from './destroyOpentokObject';
import sortOrderOfOpentokObjects from './sortOrderOfOpentokObjects';
import { FailedDestroyPrecallObjectsError } from '../../../errors';

exports.cleanupOpentokObjectsFromResult = (options) => {
  const keysToClean = ['mosEstimator', 'subscriber', 'publisher', 'session'];

  return new Promise((resolve, reject) => {
    let otObjects = [];
    let destroyed = 0;
    const retVal = Object.assign({}, options);

    keysToClean.forEach((otKey) => {
      if (otKey === 'mosEstimator' && options.mosEstimator && options.mosEstimator.intervalId) {
        window.clearInterval(options.mosEstimator.intervalId);
        retVal.mosEstimator.intervalId = null;
      } else {
        otObjects.push(options[otKey]);
      }
    });

    otObjects = sortOrderOfOpentokObjects(otObjects);
    const queued = otObjects.length;

    function checkIfAllDestroyed() {
      destroyed += 1;
      if (destroyed === queued) {
        otObjects.forEach((testObject) => {
          if (testObject && testObject.off) {
            testObject.off();
          }
        });

        keysToClean.forEach((otKey) => {
          delete retVal[otKey];
        });

        resolve(retVal);
      }
    }

    try {
      for (let i = 0; i < otObjects.length; i += 1) {
        destroyOpentokObject(otObjects[i], checkIfAllDestroyed);
      }
    } catch (exception) {
      reject(new FailedDestroyPrecallObjectsError());
    }
  });
}
