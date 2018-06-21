
export interface AudioThreshold { bps: number; plr: number; }
export interface VideoThreshold extends AudioThreshold { recommendedSetting: string; }

export type QualityTestConfig = {
  getStatsInterval: number,
  getStatsVideoAndAudioTestDuration: number,
  getStatsAudioOnlyDuration: number,
  subscribeOptions: {
    testNetwork: boolean,
    audioVolume: number,
  },
  minimumVideoAndAudioTestSampleSize: number,
  steadyStateSampleWindow: number, // this is also used to calculate bandwidth
  steadyStateAllowedDelta: number,
  qualityThresholds: {
    audio: AudioThreshold[],
    video: VideoThreshold[],
  },
  strings: {
    bandwidthLow: string,
    noCam: string,
    noMic: string,
  },
};

const config: QualityTestConfig = {
  getStatsInterval: 1000,
  getStatsVideoAndAudioTestDuration: 30000,
  getStatsAudioOnlyDuration: 10000,
  subscribeOptions: {
    testNetwork: true,
    audioVolume: 0,
  },
  minimumVideoAndAudioTestSampleSize: 5,
  steadyStateSampleWindow: 5000, // this is also used to calculate bandwidth
  steadyStateAllowedDelta: 0.05, // 1 = 100%, from point to point
  qualityThresholds: {
    video: [
      {
        bps: 1000000,
        plr: 0.005,
        recommendedSetting: '1280x720 @ 30FPS',
      },
      {
        bps: 600000,
        plr: 0.005,
        recommendedSetting: '640x480 @ 30FPS',
      },
      {
        bps: 300000,
        plr: 0.005,
        recommendedSetting: '320x240 @ 30FPS',
      },
      {
        bps: 350000,
        plr: 0.03,
        recommendedSetting: '1280x720 @ 30FPS',
      },
      {
        bps: 250000,
        plr: 0.03,
        recommendedSetting: '640x480 @ 30FPS',
      },
      {
        bps: 150000,
        plr: 0.03,
        recommendedSetting: '320x240 @ 30FPS',
      },
    ],
    audio: [
      {
        bps: 25000,
        plr: 0.05,
      },
    ],
  },
  strings: {
    bandwidthLow: 'Bandwidth too low.',
    noCam: 'No camera was found.',
    noMic: 'No microphone was found.',
  },
};

export default config;
