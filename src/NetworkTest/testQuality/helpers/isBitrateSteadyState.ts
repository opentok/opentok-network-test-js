import getLatestSampleWindow from './getLatestSampleWindow';
import calculateQualityStats from './calculateQualityStats';
import config from './config';
import { AV } from '../types/stats';
import { OT } from '../../types/opentok';

export default function isBitrateSteadyState(statsList: OT.SubscriberStats[]): boolean {
  const latestSamples = getLatestSampleWindow(statsList);
  const steadyStateAllowedDelta = config.steadyStateAllowedDelta;
  let isSteadyState = true;

  if (latestSamples.length < config.minimumVideoAndAudioTestSampleSize) {
    return false;
  }

  const statsBitrates = calculateQualityStats(latestSamples);

  const avTypes: AV[] = ['video', 'audio'];
  avTypes.forEach((avType: 'audio' | 'video') => {
    for (let i = 1; i < statsBitrates[avType].length; i += 1) {
      const currBitrate = statsBitrates[avType][i].averageBitrate;
      const prevBitrate = statsBitrates[avType][i - 1].averageBitrate;
      const bitrateDelta = currBitrate - prevBitrate;
      const allowableBitrateDelta = (prevBitrate * steadyStateAllowedDelta);

      if (bitrateDelta > allowableBitrateDelta) {
        isSteadyState = false;
      }
    }
  });

  return isSteadyState;
}
