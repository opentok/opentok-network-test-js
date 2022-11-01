import isBitrateSteadyState from './isBitrateSteadyState';
import calculateThroughput from './calculateThroughput';
import MOSState from './MOSState';
import { OT } from '../../types/opentok';
import { AV } from '../types/stats';
import { getOr, last, nth } from '../../util';
import getPublisherRtcStatsReport from '../helpers/getPublisherRtcStatsReport';

export type StatsListener = (error?: OT.OTError, stats?: OT.SubscriberStats) => void;

const getPacketsLost = (ts: OT.TrackStats): number => getOr(0, 'packetsLost', ts);
const getPacketsReceived = (ts: OT.TrackStats): number => getOr(0, 'packetsReceived', ts);
const getTotalPackets = (ts: OT.TrackStats): number => getPacketsLost(ts) + getPacketsReceived(ts);
const calculateTotalPackets = (type: AV, current: OT.SubscriberStats, last: OT.SubscriberStats) =>
  getTotalPackets(current[type]) - getTotalPackets(last[type]);
const calculateBitRate = (type: AV, current: OT.SubscriberStats, last: OT.SubscriberStats): number => {
  const interval = current.timestamp - last.timestamp;
  return current[type] && current[type].bytesReceived ?
    (8 * (current[type].bytesReceived - last[type].bytesReceived)) / (interval / 1000) : 0;
};
const MS_PER_SEC = 1000;
const DEFAULT_DELAY = 150; // expressed in ms

function calculateVideoScore(subscriber: OT.Subscriber, stats: OT.SubscriberStats[]): number {
  const MIN_VIDEO_BITRATE = 30000;
  const targetBitrateForPixelCount = (pixelCount: number) => {
    // power function maps resolution to target bitrate, based on rumor config
    // values, with r^2 = 0.98. We're ignoring frame rate, assume 30.
    const y = 2.069924867 * (Math.log10(pixelCount) ** 0.6250223771);
    return 10 ** y;
  };

  const currentStats = last(stats);
  const lastStats = nth(-2, stats);

  if (!currentStats || !lastStats || !subscriber.stream) {
    return 1;
  }

  const baseBitrate = calculateBitRate('video', currentStats, lastStats);
  const pixelCount = subscriber.stream.videoDimensions.width * subscriber.stream.videoDimensions.height;
  const targetBitrate = targetBitrateForPixelCount(pixelCount);
  if (baseBitrate < MIN_VIDEO_BITRATE) {
    return 1;
  }
  const bitrate = Math.min(baseBitrate, targetBitrate);
  let score =
    ((Math.log(bitrate / MIN_VIDEO_BITRATE) / Math.log(targetBitrate / MIN_VIDEO_BITRATE)) * 4) + 1;
  score = Math.min(score, 4.5);
  return score;
}

function calculateAudioScore(
  subscriber: OT.Subscriber, publisherStats: OT.PublisherRtcStatsReportArr | null,
  stats: OT.SubscriberStats[]): number {

  /**
   * Get publisher raw stats directly from the Peer Connection in order
   * to get the roundTripTime on type=remote-inbound-rtp and kind=audio
   * We can get this only using the standard getStats API. For legacy API
   * we will return 0.
   */
  const getRoundTripTime = () => {
    const roundTripTime = 0;
    if (publisherStats) {
      const { rtcStatsReport } = publisherStats[0];
      let roundTripTime = 0;
      rtcStatsReport.forEach((stat: any) => {
        if (stat.type === 'remote-inbound-rtp' && stat.kind === 'audio') {
          roundTripTime = !isNaN(stat.roundTripTime) ? stat.roundTripTime : 0;
        }
      });
    }
    return roundTripTime;
  };

  const getDelay = (): number => {
    const roundTripTime = getRoundTripTime();
    const delay = (roundTripTime * MS_PER_SEC) / 2;
    return delay || DEFAULT_DELAY;
  };

  const audioScore = (packetLossRatio: number) => {
    const LOCAL_DELAY = 30; // 30 msecs: typical frame duration
    const h = (x: number): number => x < 0 ? 0 : 1;
    const a = 0; // ILBC: a=10
    const b = 19.8;
    const c = 29.7;
    const delay = getDelay();
    /**
     * Calculate the transmission rating factor, R
     */
    const calculateR = (): number => {
      const d = delay + LOCAL_DELAY;
      const delayImpairment = 0.024 * d + 0.11 * (d - 177.3) * h(d - 177.3);
      const equipmentImpairment = a + b * Math.log(1 + (c * packetLossRatio));
      return 93.2 - delayImpairment - equipmentImpairment;
    };

    /**
     * Calculate the Mean Opinion Score based on R
     */
    const calculateMOS = (R: number): number => {
      if (R < 0) {
        return 1;
      }
      if (R > 100) {
        return 4.5;
      }
      return 1 + (0.035 * R) + R * (R - 60) * (100 - R) * 0.000007;
    };

    return calculateMOS(calculateR());
  };

  const currentStats = last(stats);
  const lastStats = nth(-2, stats);

  if (!currentStats || !lastStats || !subscriber.stream) {
    return 1;
  }

  const totalAudioPackets = calculateTotalPackets('audio', currentStats, lastStats);
  if (totalAudioPackets === 0) {
    return 1;
  }
  let packetLossRatio = (getPacketsLost(currentStats.audio) - getPacketsLost(lastStats.audio)) / totalAudioPackets;
  if (packetLossRatio < 0) {
    packetLossRatio = 0;
  }
  return audioScore(packetLossRatio);
}

export default function subscriberMOS(
  mosState: MOSState,
  subscriber: OT.Subscriber,
  publisher: OT.Publisher,
  getStatsListener: StatsListener,
  callback: (state: MOSState) => void) {
  mosState.intervalId = window.setInterval(
    () => {
      subscriber.getStats(async (error?: OT.OTError, stats?: OT.SubscriberStats) => {
        if (!stats) {
          return null;
        }

        let publisherStats = null;
        try {
          publisherStats = await getPublisherRtcStatsReport(publisher);
        } catch {}

        /**
         * We occasionally start to receive faulty stat during long-running
         * tests. If this occurs, let's end the test early and report the
         * results as they are, as we should have sufficient data to
         * calculate a score at this point.
         *
         * We know that we're receiving "faulty" stats when we see a negative
         * value for bytesReceived.
         */
        if (stats.audio.bytesReceived < 0 || getOr(1, 'video.bytesReceived', stats) < 0) {
          mosState.clearInterval();
          return callback(mosState);
        }

        stats && mosState.statsLog.push(stats);

        if (getStatsListener && typeof getStatsListener === 'function') {
          getStatsListener(error, stats);
        }

        if (mosState.statsLog.length < 2) {
          return null;
        }

        mosState.stats = calculateThroughput(mosState);
        const videoScore = calculateVideoScore(subscriber, mosState.statsLog);
        mosState.videoScoresLog.push(videoScore);

        const audioScore = calculateAudioScore(subscriber, publisherStats, mosState.statsLog);
        mosState.audioScoresLog.push(audioScore);
        mosState.pruneScores();

        // If bandwidth has reached a steady state, end the test early
        if (isBitrateSteadyState(mosState.statsLog)) {
          mosState.clearInterval();
          return callback(mosState);
        }

        return null;

      });
    }, MOSState.scoreInterval);

  subscriber.on('destroyed', mosState.clearInterval.bind(mosState));
  return mosState;
}
