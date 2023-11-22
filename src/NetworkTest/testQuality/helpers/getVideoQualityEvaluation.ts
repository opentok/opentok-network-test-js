import config from './config';
import { get } from '../../util';
import { AverageStatsBase } from '../types/stats';

export interface QualityEvaluationResults{
  supported: boolean;
  recommendedFrameRate?: number;
  recommendedResolution?: string;
  reason?: string;
}

export default function getVideoQualityEvaluationt(stats: AverageStatsBase): QualityEvaluationResults {
  const thresholds = config.qualityThresholds.video;
  const thresholdRatio = config.thresholdRatio;
  const bitrate = stats.availableOutgoingBitrate;

  let supported = false;
  let recommendedFrameRate  = 30;
  let recommendedResolution  = '';
  let recommendedSetting : string;

  for (let i = 0; i < thresholds.length; i += 1) {
    const threshold = thresholds[i];
    const targetBitrate = stats.simulcast ? threshold.targetBitrateSimulcast : threshold.targetBitrate;
    if (bitrate >= targetBitrate * thresholdRatio) {
      supported = true;
      recommendedSetting = get('recommendedSetting', threshold);
      // recommendedSetting is of the form '640x480 @ 30FPS'
      recommendedFrameRate = Number(recommendedSetting
        .substring(recommendedSetting.indexOf('@') + 1).replace('FPS', ''));
      recommendedResolution =
        recommendedSetting.substring(0, recommendedSetting.indexOf('@') - 1);
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
  } else {
    result.recommendedFrameRate = recommendedFrameRate;
    result.recommendedResolution = recommendedResolution;
  }

  return result;
}
