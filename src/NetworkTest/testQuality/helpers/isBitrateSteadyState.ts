import getLatestSampleWindow from './getLatestSampleWindow';
import config from './config';
import { OT } from '../../types/opentok';

export default function isBitrateSteadyState(statsList: OT.PublisherStats[]): boolean {
  const latestSamples = getLatestSampleWindow(statsList);
  let isSteadyState = true;

  if (latestSamples.length < config.minimumVideoAndAudioTestSampleSize) {
    return false;
  }

  for (const [i, currSample] of latestSamples.entries()) {
    if (i === 0) { continue; }
    const prevSample = latestSamples[i - 1];
    if (currSample.videoKbsSent > 0){
      const currBitrate = currSample.videoKbsSent;
      const prevBitrate = prevSample.videoKbsSent;
      if ((currBitrate - prevBitrate) > (prevBitrate * config.steadyStateAllowedDelta)) {
        isSteadyState = false;
      }
    }
    const currBitrateAudio = currSample.audioStats[0].kbs;
    const prevBitrateAudio = prevSample.audioStats[0].kbs;
    if ((currBitrateAudio - prevBitrateAudio) > (prevBitrateAudio * config.steadyStateAllowedDelta)) {
      isSteadyState = false;
    }
  }
  return isSteadyState;
}
