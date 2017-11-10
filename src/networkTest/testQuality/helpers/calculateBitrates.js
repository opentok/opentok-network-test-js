export default function calculateBitrateDeltas(latestSamples) {
  if (latestSamples.length < 2) {
    throw new Error('Cannot calculate bitrate with less than two data points.');
  }

  const statsBitrates = {
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
        const kilobitsIncreased = bitsIncreased / 1000;
        const msIncreased = currStat.timestamp - prevStat.timestamp;
        const secondsElapsed = msIncreased / 1000;
        const bandwidthKbps = kilobitsIncreased / secondsElapsed;

        statsBitrates[avType].push({ kbps: bandwidthKbps });
      }
    });
  }

  return statsBitrates;
}
