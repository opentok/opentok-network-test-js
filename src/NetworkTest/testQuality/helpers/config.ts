
export interface AudioThreshold { minMos: number }
export interface VideoThreshold { targetBitrate: number; targetBitrateSimulcast: number; recommendedSetting: string }

export type QualityTestConfig = {
  getStatsInterval: number;
  getStatsVideoAndAudioTestDuration: number;
  getStatsAudioOnlyDuration: number;
  subscribeOptions: {
    testNetwork: boolean;
    audioVolume: number;
  };
  minimumVideoAndAudioTestSampleSize: number;
  steadyStateSampleWindow: number; // this is also used to calculate bandwidth
  steadyStateAllowedDelta: number;
  thresholdRatio: number;
  qualityThresholds: {
    audio: AudioThreshold[];
    video: VideoThreshold[];
  };
  strings: {
    bandwidthLow: string;
    noCam: string;
    noMic: string;
  };
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
  thresholdRatio: 0.75,
  qualityThresholds: {
    video: [
      {
        targetBitrate: 4000000,
        targetBitrateSimulcast: 5550000,
        recommendedSetting: '1920x1080 @ 30FPS',
      },
      {
        targetBitrate: 2500000,
        targetBitrateSimulcast: 3150000,
        recommendedSetting: '1280x720 @ 30FPS',
      },
      {
        targetBitrate: 1200000,
        targetBitrateSimulcast: 1550000,
        recommendedSetting: '960x540 @ 30FPS',
      },
      {
        targetBitrate: 500000,
        targetBitrateSimulcast: 650000,
        recommendedSetting: '640x360 @ 30FPS',
      },
      {
        targetBitrate: 300000,
        targetBitrateSimulcast: 350000,
        recommendedSetting: '480x270 @ 30FPS',
      },
      {
        targetBitrate: 150000,
        targetBitrateSimulcast: 150000,
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
