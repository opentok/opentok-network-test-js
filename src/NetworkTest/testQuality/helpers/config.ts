
export interface AudioThreshold { minMos: number; }
export interface VideoThreshold { bps: number; recommendedSetting: string; }

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
        bps: 4000000,
        recommendedSetting: '1920x1080 @ 30FPS',
      },
      {
        bps: 2500000,
        recommendedSetting: '1280x720 @ 30FPS',
      },
      {
        bps: 1200000,
        recommendedSetting: '960x540 @ 30FPS',
      },
      {
        bps: 500000,
        recommendedSetting: '640x360 @ 30FPS',
      },
      {
        bps: 300000,
        recommendedSetting: '480x270 @ 30FPS',
      },
      {
        bps: 150000,
        recommendedSetting: '320x180 @ 30FPS',
      },
    ],
    audio: [
      {
        minMos: 2.4, // Should greather than 2.4 which is Fair.
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
