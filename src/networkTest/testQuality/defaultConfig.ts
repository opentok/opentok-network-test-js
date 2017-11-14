module.exports = {
  getStatsInterval: 1000,
  getStatsVideoAndAudioTestDuration: 30000,
  getStatsAudioOnlyDuration: 10000,
  subscribeOptions: {
    testNetwork: true,
    audioVolume: 0,
  },
  minimumVideoAndAudioTestSampleSize: 5,
  steadyStateSampleWindow: 5000, // this is also used to calculate bandwidth
  steadyStateAllowedDelta: 0.10, // 1 = 100%, from point to point
  videoQualityThresholds:
    [
      {
        kbps: 2000,
        plr: 0.08,
        recommendedSetting: '1280x720 @ 30FPS'
      },
      {
        kbps: 1000,
        plr: 0.05,
        recommendedSetting: '1280x720 @ 30FPS'
      },
      {
        kbps: 600,
        plr: 0.05,
        recommendedSetting: '1280x720 @ 15FPS'
      },
      {
        kbps: 600,
        plr: 0.05,
        recommendedSetting: '640x480 @ 30FPS'
      },
      {
        kbps: 350,
        plr: 0.03,
        recommendedSetting: '640x480 @ 15FPS'
      },
      {
        kbps: 350,
        plr: 0.03,
        recommendedSetting: '320x240 @ 30FPS'
      },
      {
        kbps: 200,
        plr: 0.03,
        recommendedSetting: '320x240 @ 15FPS'
      },
      {
        kbps: 0,
        plr: 1,
        recommendedSetting: 'Video unsupported -- bandwidth too low'
      }
    ],
};
