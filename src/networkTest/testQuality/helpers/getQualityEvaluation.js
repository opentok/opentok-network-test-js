const qualityThresholdConfig = require('../defaultConfig').qualityThresholds;

export default function getQualityEvaluation(stats, avType) {
  let quality;
  let recommendedResolution;
  const qualityThresholds = qualityThresholdConfig[avType];
  const bitrate = stats.bitrate;
  const packetLoss = stats.packetLoss;
  let qualityEval;

  for (var i = 0; i < qualityThresholds.length; i++) {
    const threshold = qualityThresholds[i];
    if (bitrate >= threshold.kbps && packetLoss < threshold.plr) {
      quality = threshold.qualityEvaluation;
      if (avType === 'video') {
        recommendedResolution = threshold.recommendedSetting;
      }
      break;
    }
  }

  qualityEval = {
    quality,
  };

  if (avType === 'video') {
    qualityEval.recommendedResolution = recommendedResolution;
  }

  return qualityEval;
};
