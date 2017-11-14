const videoQualityThresholds = require('../defaultConfig').videoQualityThresholds;

export default function getRecommendedVideoResolution(stats) {
  let recommendedResolution;
  const bitrate = stats.bitrate;
  const packetLoss = stats.packetLoss;

  for (var i = 0; i < videoQualityThresholds.length; i++) {
    const threshold = videoQualityThresholds[i];
    if (bitrate >= threshold.kbps && packetLoss <= threshold.plr) {
      recommendedResolution = threshold.recommendedSetting;
      break;
    }
  }

  return recommendedResolution;
};
