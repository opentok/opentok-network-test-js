import config from './config';
import { SubscriberStats } from '../../types/opentok/subscriber';
import { getOr, last } from '../../util';

export default function getLatestSampleWindow(stats: SubscriberStats[]): SubscriberStats[] {
  const mostRecentTimestamp: number = getOr(0, 'timestamp', last(stats));
  const oldestAllowedTime: number = mostRecentTimestamp - config.steadyStateSampleWindow;
  return stats.filter((stat: SubscriberStats) => stat.timestamp >= oldestAllowedTime);
}
