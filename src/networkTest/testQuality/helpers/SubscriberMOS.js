import isBitrateSteadyState from './isBitrateSteadyState';
import calculateThroughput from './calculateThroughput';

function calculateVideoScore(subscriber, stats) {
  const targetBitrateForPixelCount = (pixelCount) => {
    // power function maps resolution to target bitrate, based on rumor config
    // values, with r^2 = 0.98. We're ignoring frame rate, assume 30.
    const y = 2.069924867 * (Math.log10(pixelCount) ** 0.6250223771);
    return 10 ** y;
  };

  const MIN_VIDEO_BITRATE = 30000;
  if (stats.length < 2) {
    return 0;
  }
  const currentStats = stats[stats.length - 1];
  const lastStats = stats[stats.length - 2];
  const totalPackets =
  (currentStats.video.packetsLost + currentStats.video.packetsReceived) -
  (lastStats.video.packetsLost + lastStats.video.packetsReceived);
  const packetLoss = // eslint-disable-line
    (currentStats.video.packetsLost - lastStats.video.packetsLost) / totalPackets;
  const interval = currentStats.timestamp - lastStats.timestamp;
  let bitrate = (8 * (currentStats.video.bytesReceived - lastStats.video.bytesReceived)) /
  (interval / 1000);
  const pixelCount = subscriber.stream.videoDimensions.width *
  subscriber.stream.videoDimensions.height;
  const targetBitrate = targetBitrateForPixelCount(pixelCount);

  if (bitrate < MIN_VIDEO_BITRATE) {
    return 0;
  }
  bitrate = Math.min(bitrate, targetBitrate);

  const score =
    ((Math.log(bitrate / MIN_VIDEO_BITRATE) / Math.log(targetBitrate / MIN_VIDEO_BITRATE)) * 4) + 1;
  return score;
}

function calculateAudioScore(subscriber, stats) {
  const audioScore = (rtt, plr) => {
    const LOCAL_DELAY = 20; // 20 msecs: typical frame duration
    function H(x) { return (x < 0 ? 0 : 1); }
    const a = 0; // ILBC: a=10
    const b = 19.8;
    const c = 29.7;

    // R = 94.2 − Id − Ie
    const R = (rRtt, packetLoss) => {
      const d = rRtt + LOCAL_DELAY;
      const Id = ((0.024 * d) + 0.11) * (d - 177.3) * H(d - 177.3);

      const P = packetLoss;
      const Ie = (a + b) * Math.log(1 + (c * P));

      const rResult = 94.2 - Id - Ie;

      return rResult;
    };

    // For R < 0: MOS = 1
    // For 0 R 100: MOS = 1 + 0.035 R + 7.10E-6 R(R-60)(100-R)
    // For R > 100: MOS = 4.5
    const MOS = (mosR) => {
      if (R < 0) {
        return 1;
      }
      if (R > 100) {
        return 4.5;
      }
      return (1 + 0.035) * ((mosR + (7.10 / 1000000)) * (mosR * (mosR - 60) * (100 - mosR)));
    };

    return MOS(R(rtt, plr));
  };

  if (stats.length < 2) {
    return 0;
  }

  const currentStats = stats[stats.length - 1];
  const lastStats = stats[stats.length - 2];

  const totalAudioPackets =
  (currentStats.audio.packetsLost - lastStats.audio.packetsLost) +
  (currentStats.audio.packetsReceived - lastStats.audio.packetsReceived);

  if (totalAudioPackets === 0) {
    return 0;
  }

  const plr = (currentStats.audio.packetsLost - lastStats.audio.packetsLost) /
  totalAudioPackets;
  // missing from js getStats :-(
  const rtt = 0;

  const score = audioScore(rtt, plr);
  return score;
}

function SubscriberMOS({ subscriber, getStatsListener }, callback) {
  const statsLog = [];
  const audioScoresLog = [];
  const videoScoresLog = [];
  // this must be at least two, but could be higher to perform further analysis
  // const STATS_LOG_LENGTH = 2;
  // how far back in time would you like to go?
  const SCORES_LOG_LENGTH = 1000;
  const SCORE_INTERVAL = 1000;
  const obj = {};
  obj.statsLog = statsLog;

  obj.audioScore = () => {
    let sum = 0;
    for (let i = 0; i < audioScoresLog.length; i += 1) {
      const score = audioScoresLog[i];
      sum += score;
    }
    return sum / audioScoresLog.length;
  };

  obj.videoScore = () => {
    let sum = 0;
    for (let i = 0; i < videoScoresLog.length; i += 1) {
      const score = videoScoresLog[i];
      sum += score;
    }
    return sum / videoScoresLog.length;
  };

  obj.qualityScore = () => Math.min(obj.audioScore(), obj.videoScore());

  obj.intervalId = window.setInterval(() => {
    subscriber.getStats((error, stats) => {
      if (!stats) {
        return null;
      }
      statsLog.push(stats);

      if (getStatsListener && typeof getStatsListener === 'function') {
        getStatsListener(error, stats);
      }

      if (statsLog.length < 2) {
        return null;
      }

      obj.stats = calculateThroughput(statsLog);

      const videoScore = calculateVideoScore(subscriber, statsLog);
      videoScoresLog.push(videoScore);
      const audioScore = calculateAudioScore(subscriber, statsLog);
      audioScoresLog.push(audioScore);

      while (statsLog.length > SCORES_LOG_LENGTH) {
        statsLog.shift();
      }
      while (audioScoresLog.length > SCORES_LOG_LENGTH) {
        audioScoresLog.shift();
      }
      while (videoScoresLog.length > SCORES_LOG_LENGTH) {
        videoScoresLog.shift();
      }

      // If bandwidth has reached a steady state, end the test early
      if (isBitrateSteadyState(statsLog)) {
        window.clearInterval(obj.intervalId);
        obj.intervalId = undefined;
        return callback(obj.qualityScore(), obj.stats);
      }

      return null;
    });
  }, SCORE_INTERVAL);

  subscriber.on('destroyed', () => {
    if (obj.intervalId) {
      window.clearInterval(obj.intervalId);
      obj.intervalId = undefined;
    }
  });

  return obj;
}

export default SubscriberMOS;
