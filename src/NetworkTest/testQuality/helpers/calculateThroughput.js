import getLatestSampleWindow from './getLatestSampleWindow';
import calculateBitrates from './calculateBitrates';

function getAverageBitrate(bitrateList) {
  let sumKbps = 0;
  let points = 0;

  bitrateList.forEach((bitrate) => {
    sumKbps += bitrate.kbps;
    points += 1;
  });

  return sumKbps / points;
}

export default function calculateThroughput(statsList) {
  const sampleWindow = getLatestSampleWindow(statsList);
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
