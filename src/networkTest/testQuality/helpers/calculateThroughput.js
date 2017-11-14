import getLatestSampleWindow from './getLatestSampleWindow';
import calculateQualityStats from './calculateQualityStats';
import getQualityEvaluation from './getQualityEvaluation';

const config = require('../defaultConfig');

function getAverageBitrateAndPlr(statsList, avType) {
  let sumBps = 0;
  let sumPlr = 0;
  let sumFrameRate = 0;

  statsList.forEach((stat) => {
    sumBps += stat.averageBitrate;
    sumPlr += stat.packetLossRatio;
    if (avType === 'video') {
      sumFrameRate =+ stat.frameRate;
    }
  });

  const averageStats = {
    bitrate: sumBps / statsList.length,
    packetLoss: sumPlr / statsList.length,
  };

  const qualityEval = getQualityEvaluation(averageStats, avType);
  averageStats.supported = qualityEval.supported;
  averageStats.reason = qualityEval.reason;

  if (avType === 'video') {
    averageStats.frameRate = sumFrameRate / statsList.length;
    averageStats.recommendedResolution = qualityEval.recommendedResolution;
  }

  return averageStats;
}

export default function calculateThroughput(statsList, { missingAudioTrack, missingVideoTrack }) {
  const sampleWindow = getLatestSampleWindow(statsList);
  const qualityStats = calculateQualityStats(sampleWindow);
  let averageAudioStats;
  let averageVideoStats;

  if (missingAudioTrack) {
    averageAudioStats = {
      supported: false,
      reason: config.strings.noMic
    }
  } else {
    averageAudioStats = getAverageBitrateAndPlr(qualityStats.audio, 'audio');
  }

  if (missingVideoTrack) {
    averageVideoStats = {
      supported: false,
      reason: config.strings.noCam,
    }
  } else {
    averageVideoStats = getAverageBitrateAndPlr(qualityStats.video, 'video');
  }

  return {
    audio: averageAudioStats,
    video: averageVideoStats,
  };
}
