import getLatestSampleWindow from './getLatestSampleWindow';
import calculateBitrates from './calculateBitrates';

const getAverageBitrate = (bitrateList: Kbps[]): number => {
  let sumKbps = 0;
  let points = 0;

  bitrateList.forEach((bitrate) => {
    sumKbps += bitrate.kbps;
    points += 1;
  });

  return sumKbps / points;
};


export default function calculateThroughput(statsList: OT.SubscriberStats[]) {
  const sampleWindow = getLatestSampleWindow(statsList);
  if (sampleWindow.length < 2) {
    return { audio: 0, video: 0 };
  } else {
    const bitrates = calculateBitrates(sampleWindow);
    const audioBitrates = bitrates.audio;
    const videoBitrates = bitrates.video;
    const averageAudioBandwidth = getAverageBitrate(audioBitrates);
    const averageVideoBandwidth = getAverageBitrate(videoBitrates);
    return {
      audio: averageAudioBandwidth,
      video: averageVideoBandwidth,
    };
  }
}
