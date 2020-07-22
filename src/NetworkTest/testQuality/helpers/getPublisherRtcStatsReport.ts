import { OT } from '../../types/opentok';

export default (publisher: OT.Publisher, callback?: (publisherStats?: OT.PublisherRtcStatsReportArr) => void): void => {
   if (typeof publisher.getRtcStatsReport === 'function') {
    publisher.getRtcStatsReport((publisherStatsError?: OT.OTError, publisherStats?: OT.PublisherRtcStatsReportArr) => {
    callback && callback(publisherStats);
    });
   } else {
    callback && callback();
   }
}
