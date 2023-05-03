import config from './config';
import { getOr, last } from '../../util';
import { PublisherStats } from '../../types/opentok/publisher';

export default function getLatestSampleWindow(stats: PublisherStats[]): PublisherStats[] {
  const mostRecentTimestamp: number = getOr(0, 'timestamp', last(stats));
  const oldestAllowedTime: number = mostRecentTimestamp - config.steadyStateSampleWindow;
  return stats.filter((stat: PublisherStats) => stat.timestamp >= oldestAllowedTime);
}
