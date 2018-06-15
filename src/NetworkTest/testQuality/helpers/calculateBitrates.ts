import { OT } from '../../types/opentok';
import { AV, Kbps, KbpsMap } from '../types/stats';

function calculateDeltas(type: AV, samples: OT.SubscriberStats[]): Kbps[] {
  const bitrates: Kbps[] = [];
  for (let i = 1; i < samples.length; i += 1) {
    const currStat = samples[i];
    const prevStat = samples[i - 1];
    if (currStat[type] && prevStat[type]) {
      const bytesIncreased = currStat[type].bytesReceived ?
        (currStat[type].bytesReceived - prevStat[type].bytesReceived) : 0;
      const bitsIncreased = bytesIncreased * 8;
      const kilobitsIncreased = bitsIncreased / 1000;
      const msIncreased = currStat.timestamp - prevStat.timestamp;
      const secondsElapsed = msIncreased / 1000;
      const bandwidthKbps = kilobitsIncreased / secondsElapsed;
      bitrates.push({ kbps: bandwidthKbps });
    }
  }
  return bitrates;
}

export default function calculateBitrateDeltas(latestSamples: OT.SubscriberStats[]): KbpsMap {

  if (latestSamples.length < 2) {
    throw new Error('Cannot calculate bitrate with less than two data points.');
  }

  return {
    audio: calculateDeltas('audio', latestSamples),
    video: calculateDeltas('video', latestSamples),
  };
}
