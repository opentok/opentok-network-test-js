import config from './config';
import { get } from '../../util';
import { AV, AverageStatsBase } from '../types/stats';

export interface QualityEvaluationResults{
  supported: boolean;
  recommendedFrameRate?: number;
  recommendedResolution?: string;
  reason?: string;
}

export default function getQualityEvaluation(stats: AverageStatsBase, type: AV): QualityEvaluationResults {
  const qualityThresholds = config.qualityThresholds;
  const bitrate = stats.bitrate;
  const packetLoss = stats.packetLossRatio;
  const thresholds = qualityThresholds[type];
  let supported = false;
  let recommendedFrameRate : number = 30;
  let recommendedResolution : string = '';
  let recommendedSetting : string;

  for (let i = 0; i < thresholds.length; i += 1) {
    const threshold = thresholds[i];
    if (bitrate >= threshold.bps && packetLoss <= threshold.plr) {
      supported = true;
      if (type === 'video') {
        recommendedSetting = get('recommendedSetting', threshold);
        // recommendedSetting is of the form '640x480 @ 30FPS'
        recommendedFrameRate = Number(recommendedSetting
          .substring(recommendedSetting.indexOf('@') + 1).replace('FPS', ''));
        recommendedResolution =
          recommendedSetting.substring(0, recommendedSetting.indexOf('@') - 1);
      }
      break;
    }
  }

  const result: QualityEvaluationResults = {
    supported,
    recommendedFrameRate,
    recommendedResolution,
  };

  if (!supported) {
    result.reason = config.strings.bandwidthLow;
  } else if (supported && type === 'video') {
    result.recommendedFrameRate = recommendedFrameRate;
    result.recommendedResolution = recommendedResolution;
  }

  return result;
}
