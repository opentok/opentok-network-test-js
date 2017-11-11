import getLatestSampleWindow from './getLatestSampleWindow';
import calculateQualityStats from './calculateQualityStats';
import getQualityEvaluation from './getQualityEvaluation';

function getAverageBitrateAndPlr(statsList, avType) {
  let sumKbps = 0;
  let sumPlr = 0;
  let sumFrameRate = 0;
  let isVideoStats = false;

  statsList.forEach((stat) => {
    sumKbps += stat.bandwidthKbps;
    sumPlr += stat.packetLossRatio;
    if (stat.frameRate) {
      sumFrameRate =+ stat.frameRate;
      isVideoStats = true;
    }
  });

  const averageStats = {
    bitrate: sumKbps / statsList.length,
    packetLoss: sumPlr / statsList.length,
  };

  const qualityEvaluation = getQualityEvaluation(averageStats, avType);

  averageStats.qualityEvaluation = qualityEvaluation.quality;

  if (isVideoStats) {
    averageStats.frameRate = sumFrameRate / statsList.length;
    averageStats.recommendedResolution = qualityEvaluation.recommendedResolution;
  }

  return averageStats;
}

export default function calculateThroughput(statsList) {
  const sampleWindow = getLatestSampleWindow(statsList);
  const qualityStats = calculateQualityStats(sampleWindow);
  const audioQualityStats = qualityStats.audio;
  const videoQualityStats = qualityStats.video;
  const averageAudioStats = getAverageBitrateAndPlr(audioQualityStats, 'audio');
  const averageVideoStats = getAverageBitrateAndPlr(videoQualityStats, 'video');

  return {
    audio: averageAudioStats,
    video: averageVideoStats,
  };
}
