// These helpers exists because teardown must go from Subscriber => Publisher => Session.
// e.g. If you teardown Session first, the Publisher and Subscriber get torn down as well and we
// the `destroyed` listeners for those don't fire - then we never know if teardown is complete.

export default (list) => {
  const hierarchy = {
    Subscriber: 3,
    Publisher: 2,
    Session: 1,
  };

  return list.sort((a, b) => {
    let aPoints = 0;
    let bPoints = 0;

    ['Subscriber', 'Publisher', 'Session'].forEach((otType) => {
      if (a instanceof OT[otType]) {
        aPoints = hierarchy[otType];
      }

      if (b instanceof OT[otType]) {
        bPoints = hierarchy[otType];
      }
    });

    return bPoints - aPoints;
  });
};
