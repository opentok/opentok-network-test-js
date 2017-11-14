export default function calculateQualityStats(latestSamples) {
  if (latestSamples.length < 2) {
    throw new Error('Cannot calculate bitrate with less than two data points.');
  }

  const qualityStats = {
    video: [],
    audio: [],
  };

  for (let i = 1; i < latestSamples.length; i += 1) {
    ['video', 'audio'].forEach((avType) => {
      const currStat = latestSamples[i];
      const prevStat = latestSamples[i - 1];

      if (currStat[avType] && prevStat[avType]) {
        const bytesIncreased = currStat[avType].bytesReceived - prevStat[avType].bytesReceived;
        const bitsIncreased = bytesIncreased * 8;
        const msIncreased = currStat.timestamp - prevStat.timestamp;
        const secondsElapsed = msIncreased / 1000;
        const averageBitrate = bitsIncreased / secondsElapsed;

        const packetsReceived = currStat[avType].packetsReceived;
        const packetsLost = currStat[avType].packetsLost;
        const packetLossRatio = packetsLost / packetsReceived;

        const frameRate = currStat[avType].frameRate;

        qualityStats[avType].push({
          averageBitrate,
          packetLossRatio,
          frameRate,
        });
      }
    });
  }

  return qualityStats;
}
