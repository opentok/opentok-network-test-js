import getLatestSampleWindow from './getLatestSampleWindow';
import calculateQualityStats from './calculateQualityStats';
import getVideoQualityEvaluation from './getVideoQualityEvaluation';
import { AV, AverageStats, AverageStatsBase, HasAudioVideo, SubscriberQualityStats } from '../types/stats';
import config from './config';
import MOSState from './MOSState';
import { PublisherStats } from '../../types/opentok/publisher';
import { getOr } from '../../util';

function getAverageBitrateAndPlr(type: AV,
                                 subscriberStatsList: SubscriberQualityStats[],
                                 publisherStatsList: PublisherStats[]): AverageStats {

  let sumBps = 0;
  let sumPlr = 0;
  let sumFrameRate = 0;

  publisherStatsList.forEach((stat) => {
    sumPlr += 0;
    if (type === 'video') {
      sumBps += stat.videoKbsSent * 1000;
    } else {
      sumBps += stat.audioStats[0].kbs * 1000;
    }
  });

  subscriberStatsList.forEach((stat) => {
    sumPlr += stat.packetLossRatio;
    if (type === 'video') {
      sumFrameRate += Number(getOr(0, 'frameRate', stat));
    }
  });

  const isSimulcastEnabled = publisherStatsList.some(
    publisherStats => publisherStats.simulcastEnabled,
  );

  const lastPublisherStats = publisherStatsList[publisherStatsList.length - 1];

  const qualityLimitationReason = lastPublisherStats.videoStats.find(
    videoStats => videoStats.qualityLimitationReason !== null
    && videoStats.qualityLimitationReason !== 'none')?.qualityLimitationReason || null;

  const averageStats: AverageStatsBase = {
    availableOutgoingBitrate: publisherStatsList[publisherStatsList.length - 1].availableOutgoingBitrate,
    simulcast: isSimulcastEnabled,
    bitrate: sumBps / publisherStatsList.length,
    packetLossRatio: sumPlr / subscriberStatsList.length,
  };

  if (type === 'video') {
    const { supported, reason, recommendedResolution, recommendedFrameRate } =
      getVideoQualityEvaluation(averageStats);

    const videoStats =
      type === 'video' ? {
        recommendedResolution,
        recommendedFrameRate,
        frameRate: sumFrameRate / subscriberStatsList.length,
      } : {};
    return { ...averageStats, supported, reason, qualityLimitationReason, ...videoStats };
  }
  return { ...averageStats };
}

export default function calculateThroughput(state: MOSState): HasAudioVideo<AverageStats> {

  const sampleWindow = getLatestSampleWindow(state.publisherStatsLog);
  const subscriberQualityStats = calculateQualityStats(state.subscriberStatsLog);

  const averageAudioStats = () => {
    if (!state.hasAudioTrack()) {
      return {
        supported: false,
        reason: config.strings.noMic,
      };
    }
    return getAverageBitrateAndPlr('audio', subscriberQualityStats.audio, sampleWindow);
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
    return getAverageBitrateAndPlr('video', subscriberQualityStats.video, sampleWindow);
  };

  return {
    audio: averageAudioStats(),
    video: averageVideoStats(),
  };
}
