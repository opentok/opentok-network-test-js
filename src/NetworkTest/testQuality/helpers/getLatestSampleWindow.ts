import defaultConfig from './defaultConfig';
import { getOr, last } from '../../../util';

const getLatestSampleWindow = (stats: OT.SubscriberStats[]): OT.SubscriberStats[] =>  {
  const mostRecentTimestamp: number = getOr(0, 'timestamp', last(stats));
  const oldestAllowedTime: number = mostRecentTimestamp - defaultConfig.steadyStateSampleWindow;
  return stats.filter((stat: OT.SubscriberStats) => stat.timestamp >= oldestAllowedTime);
};

export default getLatestSampleWindow;
