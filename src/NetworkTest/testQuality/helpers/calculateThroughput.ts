import getLatestSampleWindow from './getLatestSampleWindow';
import calculateQualityStats from './calculateQualityStats';
import getQualityEvaluation from './getQualityEvaluation';
import { AV, AverageStats, AverageStatsBase, HasAudioVideo, QualityStats } from '../types/stats';
import config from './config';
import MOSState from './MOSState';
import { getOr } from '../../util';

function getAverageBitrateAndPlr(type: AV, statsList: QualityStats[]): AverageStats {
  let sumBps = 0;
  let sumPlr = 0;
  let sumFrameRate = 0;

  statsList.forEach((stat) => {
    sumBps += stat.averageBitrate;
    sumPlr += stat.packetLossRatio;
    if (type === 'video') {
      sumFrameRate += Number(getOr(0, 'frameRate', stat));
    }
  });

  const averageStats: AverageStatsBase = {
    bitrate: sumBps / statsList.length,
    packetLossRatio: sumPlr / statsList.length,
  };
  const { supported, reason, recommendedResolution, recommendedFrameRate } =
    getQualityEvaluation(averageStats, type);
  const videoStats =
    type === 'video' ? {
      recommendedResolution,
      recommendedFrameRate,
      frameRate: sumFrameRate / statsList.length,
    } : {};

  return { ...averageStats, supported, reason, ...videoStats };
}

export default function calculateThroughput(state: MOSState): HasAudioVideo<AverageStats> {

  const sampleWindow = getLatestSampleWindow(state.statsLog);
  const qualityStats = calculateQualityStats(sampleWindow);

  const averageAudioStats = () => {
    if (!state.hasAudioTrack()) {
      return {
        supported: false,
        reason: config.strings.noMic,
      };
    }
    return getAverageBitrateAndPlr('audio', qualityStats.audio);
  };

  const averageVideoStats = () => {
    if (state.audioOnlyFallback) {
      return {
        supported: false,
        reason: config.strings.bandwidthLow,
      };
    }
    if (!state.hasVideoTrack()) {
      return {
        supported: false,
        reason: config.strings.noCam,
      };
    }
    return getAverageBitrateAndPlr('video', qualityStats.video);
  };

  return {
    audio: averageAudioStats(),
    video: averageVideoStats(),
  };
}
