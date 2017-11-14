import getLatestSampleWindow from './getLatestSampleWindow';
import calculateQualityStats from './calculateQualityStats';
import getRecommendedVideoResolution from './getRecommendedVideoResolution';

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

  if (avType === 'video') {
    averageStats.frameRate = sumFrameRate / statsList.length;
    averageStats.recommendedResolution = getRecommendedVideoResolution(averageStats);
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
