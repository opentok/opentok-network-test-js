import { OT } from '../../types/opentok';
import {
  RTCTransportStats,
  RTCOutboundRtpStreamStats,
  RTCIceCandidatePairStats,
  RTCStatsInternal,
  RTCandidateStatsInternal,
} from '../../types/opentok/rtcStats';

export interface PreviousStreamStats {
  [ssrc: number]: {
    timestamp: number;
    bytesSent: number;
  };
}

export async function getPublisherStats(
  publisher: OT.Publisher,
  previousStreamStats: PreviousStreamStats,
): Promise<OT.PublisherStats | null> {

  if (typeof publisher.getRtcStatsReport !== 'function') {
    return null;
  }

  try {
    const publisherStatsReport = await publisher.getRtcStatsReport();
    return extractPublisherStats(publisherStatsReport, previousStreamStats);
  } catch (error) {
    console.error(error);
    return null;
  }
}

const calculateBitrate = (
  stats: RTCOutboundRtpStreamStats,
  previousStreamStats: PreviousStreamStats,
): number => {
  const previousSsrcFrameData = previousStreamStats[stats.ssrc];
  if (!previousSsrcFrameData) {
    return 0;
  }

  const { timestamp: previousTimestamp, bytesSent: previousByteSent } = previousSsrcFrameData;
  const bytesSent = stats.bytesSent - previousByteSent;
  const timeDiff = (stats.timestamp - previousTimestamp) / 1000; // Convert to seconds
  return Math.round((bytesSent * 8) / (1000 * timeDiff)); // Convert to bits per second
};

const extractOutboundRtpStats = (
  outboundRtpStats: RTCOutboundRtpStreamStats[],
  previousStreamStats: PreviousStreamStats,
) => {
  const videoStats = [];
  const audioStats = [];

  for (const stats of outboundRtpStats) {
    const kbs = calculateBitrate(stats, previousStreamStats);
    previousStreamStats[stats.ssrc] = { timestamp: stats.timestamp, bytesSent: stats.bytesSent };

    const baseStats = { kbs, ssrc: stats.ssrc, byteSent: stats.bytesSent, currentTimestamp: stats.timestamp };

    if (stats.mediaType === 'video') {
      videoStats.push({
        ...baseStats,
        qualityLimitationReason: stats.qualityLimitationReason || 'N/A',
        resolution: `${stats.frameWidth || 0}x${stats.frameHeight || 0}`,
        framerate: stats.framesPerSecond || 0,
        active: stats.active || false,
        pliCount: stats.pliCount || 0,
        nackCount: stats.nackCount || 0,
      });
    } else if (stats.mediaType === 'audio') {
      audioStats.push(baseStats);
    }
  }

  return { videoStats, audioStats };
};

const extractPublisherStats = (
  publisherRtcStatsReport?: OT.PublisherRtcStatsReport,
  previousStreamStats?: PreviousStreamStats,
  ): OT.PublisherStats | null => {
  if (!publisherRtcStatsReport) {
    return null;
  }

  const { rtcStatsReport } = publisherRtcStatsReport[0];

  const rtcStatsArray: RTCStatsInternal[] = Array.from(rtcStatsReport.values());

  const transportStats = rtcStatsArray.find(
    stats => stats.type === 'transport') as RTCTransportStats;
  const outboundRtpStats = rtcStatsArray.filter(
    stats => stats.type === 'outbound-rtp') as RTCOutboundRtpStreamStats[];
  const iceCandidatePairStats = rtcStatsArray.find(
    stats => stats.type === 'candidate-pair' && stats.nominated) as RTCIceCandidatePairStats;

  const findCandidateById = (type: string, id: string) => {
    return rtcStatsArray.find(stats => stats.type === type && stats.id === id) as RTCandidateStatsInternal | null;
  };

  const localCandidate = findCandidateById('local-candidate', iceCandidatePairStats.localCandidateId);
  const remoteCandidate = findCandidateById('remote-candidate', iceCandidatePairStats.remoteCandidateId);

  const { videoStats, audioStats } = extractOutboundRtpStats(outboundRtpStats, previousStreamStats);

  const availableOutgoingBitrate = iceCandidatePairStats?.availableOutgoingBitrate || -1;
  const currentRoundTripTime = iceCandidatePairStats?.currentRoundTripTime || -1;
  const videoSentKbs = videoStats.reduce((sum, stats) => sum + stats.kbs, 0);
  const simulcastEnabled = videoStats.length > 1;
  const transportProtocol = localCandidate?.protocol || 'N/A';

  return {
    videoStats,
    audioStats,
    availableOutgoingBitrate,
    videoSentKbs,
    simulcastEnabled,
    transportProtocol,
    currentRoundTripTime,
  };
};
