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
        kbps: 1000,
        plr: 0.005,
        recommendedSetting: '1280x720 @ 30FPS'
      },
      {
        kbps: 600,
        plr: 0.005,
        recommendedSetting: '640x480 @ 30FPS'
      },
      {
        kbps: 300,
        plr: 0.005,
        recommendedSetting: '352x288 @ 30FPS'
      },
      {
        kbps: 300,
        plr: 0.005,
        recommendedSetting: '320x240 @ 30FPS'
      },
      {
        kbps: 350,
        plr: 0.03,
        recommendedSetting: '1280x720 @ 30FPS'
      },
      {
        kbps: 250,
        plr: 0.03,
        recommendedSetting: '640x480 @ 30FPS'
      },
      {
        kbps: 150,
        plr: 0.03,
        recommendedSetting: '352x288 @ 30FPS'
      },
      {
        kbps: 150,
        plr: 0.03,
        recommendedSetting: '320x240 @ 30'
      }
    ],
    audio: [
      {
        kbps: 25,
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
