const defaultConfig = require('../defaultConfig');

export default function getQualityEvaluation(stats: AverageStatsBase, type: AV): QualityEvaluationResults {
  const qualityThresholds = defaultConfig.qualityThresholds;
  const bitrate = stats.bitrate;
  const packetLoss = stats.packetLoss;
  const thresholds = qualityThresholds[type];
  let supported = false;
  let recommendedResolution;

  for (let i = 0; i < thresholds.length; i += 1) {
    const threshold = thresholds[i];
    if (bitrate >= threshold.bps && packetLoss <= threshold.plr) {
      supported = true;
      if (type === 'video') {
        recommendedResolution = threshold.recommendedSetting;
      }
      break;
    }
  }

  const result: QualityEvaluationResults = { supported, recommendedResolution };

  if (!supported) {
    result.reason = defaultConfig.strings.bandwidthLow;
  } else if (supported && type === 'video') {
    result.recommendedResolution = recommendedResolution;
  }

  return result;
}
