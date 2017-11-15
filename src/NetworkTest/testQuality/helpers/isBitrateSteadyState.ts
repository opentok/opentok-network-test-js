import getLatestSampleWindow from './getLatestSampleWindow';
import calculateQualityStats from './calculateQualityStats';
const defaultConfig = require('../defaultConfig');

export default function isBitrateSteadyState(statsList: OT.SubscriberStats[]): boolean {
  const latestSamples = getLatestSampleWindow(statsList);
  const steadyStateAllowedDelta = defaultConfig.steadyStateAllowedDelta;
  let isSteadyState = true;

  if (latestSamples.length < defaultConfig.minimumVideoAndAudioTestSampleSize) {
    return false;
  }

  const statsBitrates = calculateQualityStats(latestSamples);

  const avTypes: AV[] = ['video', 'audio'];
  avTypes.forEach((avType: 'audio' | 'video') => {
    for (let i = 1; i < statsBitrates[avType].length; i += 1) {
      const currBitrate = statsBitrates[avType][i].kbps;
      const prevBitrate = statsBitrates[avType][i - 1].kbps;
      const bitrateDelta = currBitrate - prevBitrate;
      const allowableBitrateDelta = (prevBitrate * steadyStateAllowedDelta);

      if (bitrateDelta > allowableBitrateDelta) {
        isSteadyState = false;
      }
    }
  });

  return isSteadyState;
}
