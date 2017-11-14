const defaultConfig = require('../defaultConfig');

export default function getQualityEvaluation(stats, avType) {
  const qualityThresholds = defaultConfig.qualityThresholds;
  const bitrate = stats.bitrate;
  const packetLoss = stats.packetLoss;
  const thresholds = qualityThresholds[avType];
  let supported = false;
  let recommendedResolution;

  for (var i = 0; i < thresholds.length; i++) {
    const threshold = thresholds[i];
    if (bitrate >= threshold.bps && packetLoss <= threshold.plr) {
      supported = true;
      if (avType === 'video') {
        recommendedResolution = threshold.recommendedSetting;
      }
      break;
    }
  }

  const result = {
    supported,
    recommendedResolution,
  };

  if (!supported) {
    result.reason = defaultConfig.strings.bandwidthLow;
  } else if (supported && avType === 'video') {
    result.recommendedResolution = recommendedResolution;
  }

  return result;
};
