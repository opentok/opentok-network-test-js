import { OT } from '../../types/opentok';

export default function isRtcStatsReport (item: OT.RTCStatsReport | OT.RTCStatsResponse): item is OT.RTCStatsReport {
  return (item as OT.RTCStatsReport).forEach !== undefined;
}
