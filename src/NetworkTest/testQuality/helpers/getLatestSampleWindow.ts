import config from './config';
import { getOr, last } from '../../../util';

export default function getLatestSampleWindow(stats: OT.SubscriberStats[]): OT.SubscriberStats[] {
  const mostRecentTimestamp: number = getOr(0, 'timestamp', last(stats));
  const oldestAllowedTime: number = mostRecentTimestamp - config.steadyStateSampleWindow;
  return stats.filter((stat: OT.SubscriberStats) => stat.timestamp >= oldestAllowedTime);
}
