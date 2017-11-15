import config from './config';
import { get } from '../../../util';


export default function getQualityEvaluation(stats: AverageStatsBase, type: AV): QualityEvaluationResults {
  const qualityThresholds = config.qualityThresholds;
  const bitrate = stats.bitrate;
  const packetLoss = stats.packetLossRatio;
  const thresholds = qualityThresholds[type];
  let supported = false;
  let recommendedResolution;

  for (let i = 0; i < thresholds.length; i += 1) {
    const threshold = thresholds[i];
    if (bitrate >= threshold.bps && packetLoss <= threshold.plr) {
      supported = true;
      if (type === 'video') {
        recommendedResolution = get('recommendedSetting', threshold);
      }
      break;
    }
  }

  const result: QualityEvaluationResults = { supported, recommendedResolution };

  if (!supported) {
    result.reason = config.strings.bandwidthLow;
  } else if (supported && type === 'video') {
    result.recommendedResolution = recommendedResolution;
  }

  return result;
}
