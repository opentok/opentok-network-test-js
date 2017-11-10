export default generateRetValFromOptions = (options) => {
  // Copy primitives
  const retVal = Object.assign({}, options);

  // Find complex OT objects that aren't carried over by Object.assign
  [
    'session',
    'subscriber',
    'localPublisher',
    'publisher',
    'mosEstimator',
    'getStatsListener',
  ].forEach((key) => {
    // Pass on OT values if they exist
    if (options && options[key]) {
      retVal[key] = options[key];
    }
  });

  return retVal;
}
