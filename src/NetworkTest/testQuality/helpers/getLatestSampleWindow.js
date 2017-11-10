const defaultConfig = require('../defaultConfig');

export default function getLatestSampleWindow(stats) {
  const newestTimestamp = stats[stats.length - 1].timestamp;
  const oldestAllowedTime = newestTimestamp - defaultConfig.steadyStateSampleWindow;
  const sampleWindowStats = [];

  stats.forEach((stat) => {
    if (stat.timestamp >= oldestAllowedTime) {
      sampleWindowStats.push(stat);
    }
  });

  return sampleWindowStats;
}
