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
  qualityThresholds: {
    video: [
      {
        bps: 1000000,
        plr: 0.005,
        recommendedSetting: '1280x720 @ 30FPS'
      },
      {
        bps: 600000,
        plr: 0.005,
        recommendedSetting: '640x480 @ 30FPS'
      },
      {
        bps: 300000,
        plr: 0.005,
        recommendedSetting: '352x288 @ 30FPS'
      },
      {
        bps: 300000,
        plr: 0.005,
        recommendedSetting: '320x240 @ 30FPS'
      },
      {
        bps: 350000,
        plr: 0.03,
        recommendedSetting: '1280x720 @ 30FPS'
      },
      {
        bps: 250000,
        plr: 0.03,
        recommendedSetting: '640x480 @ 30FPS'
      },
      {
        bps: 150000,
        plr: 0.03,
        recommendedSetting: '352x288 @ 30FPS'
      },
      {
        bps: 150000,
        plr: 0.03,
        recommendedSetting: '320x240 @ 30'
      }
    ],
    audio: [
      {
        bps: 25000,
        plr: 0.05,
      }
    ]
  },
  strings: {
    bandwidthLow: 'Bandwidth too low.',
    noCam: 'No camera was found.',
    noMic: 'No microphone was found.'
  }
}
