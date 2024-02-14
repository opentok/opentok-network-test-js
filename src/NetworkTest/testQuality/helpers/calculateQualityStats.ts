import { SubscriberStats } from '../../types/opentok/subscriber';
import { AV, HasAudioVideo, SubscriberQualityStats } from '../types/stats';

function calculateStats(type: AV, samples: SubscriberStats[]): SubscriberQualityStats[] {

  const qualityStats: SubscriberQualityStats[] = [];

  for (let i = 1; i < samples.length; i += 1) {

    const currStat = samples[i];
    const prevStat = samples[i - 1];

    if (currStat[type] && prevStat[type]) {
      const bytesIncreased = currStat[type].bytesReceived ?
        currStat[type].bytesReceived - prevStat[type].bytesReceived : 0;
      const bitsIncreased = bytesIncreased * 8;
      const msIncreased = currStat.timestamp - prevStat.timestamp;
      const secondsElapsed = msIncreased / 1000;
      const averageBitrate = bitsIncreased / secondsElapsed;

      const packetsReceived = currStat[type].packetsReceived;
      const packetsLost = currStat[type].packetsLost;
      const totalExpectedPackets = packetsLost + packetsReceived;
      let packetLossRatio = 0;
      if (totalExpectedPackets > 0 && packetsLost > 0) {
        packetLossRatio = packetsLost / totalExpectedPackets;
      }
      const frameRate = type === 'video' ? { frameRate: currStat[type].frameRate } : {};

      qualityStats.push({ averageBitrate, packetLossRatio, ...frameRate });
    }
  }

  return qualityStats;
}

export default function calculateQualityStats(
  latestSamples: SubscriberStats[],
): HasAudioVideo<SubscriberQualityStats[]> {
  if (latestSamples.length < 2) {
    throw new Error('Cannot calculate bitrate with less than two data points.');
  }

  return {
    audio: calculateStats('audio', latestSamples),
    video: calculateStats('video', latestSamples),
  };
}
