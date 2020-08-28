import { OT } from '../../types/opentok';

export default (publisher: OT.Publisher): Promise<OT.PublisherRtcStatsReportArr | null> =>
  new Promise((resolve) => {
    // If getRtcStatsReport is not a function, that means OT version is < 2.17.6
    // In this case we just return null.
    if (typeof publisher.getRtcStatsReport !== 'function') {
      return resolve(null);
    }

    // Need to evaluate the result of getRtcStatsReport() to determine
    // whether it's the promise or callback version of the API.
    const getRtcStatsReportPromise = publisher.getRtcStatsReport();
    if (!getRtcStatsReportPromise) {
      publisher.getRtcStatsReport((err, stats) => { resolve(stats); });
    } else {
      (getRtcStatsReportPromise as Promise<OT.PublisherRtcStatsReportArr>)
        .then(resolve)
        .catch(() => resolve(null));
    }
  });
