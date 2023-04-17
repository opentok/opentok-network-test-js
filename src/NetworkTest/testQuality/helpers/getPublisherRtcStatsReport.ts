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
  previousStats: OT.PublisherStats | undefined,
): Promise<OT.PublisherStats | null> {

  if (typeof publisher.getRtcStatsReport !== 'function') {
    return null;
  }

  try {
    const publisherStatsReport = await publisher.getRtcStatsReport();
    return extractPublisherStats(publisherStatsReport, previousStats);
  } catch (error) {
    console.error(error);
    return null;
  }
}

const calculateBitrate = (
  stats: RTCOutboundRtpStreamStats,
  previousStats: OT.PublisherStats | undefined,
): number => {
  const previousSsrcFrameData = previousStats?.videoStats.find(stats => stats.ssrc === stats.ssrc);
  if (!previousSsrcFrameData) {
    return 0;
  }

  const { currentTimestamp: previousTimestamp, byteSent: previousByteSent } = previousSsrcFrameData;
  const byteSent = stats.bytesSent - previousByteSent;
  const timeDiff = (stats.timestamp - previousTimestamp) / 1000; // Convert to seconds
  return Math.round((byteSent * 8) / (1000 * timeDiff)); // Convert to bits per second
};

const extractOutboundRtpStats = (
  outboundRtpStats: RTCOutboundRtpStreamStats[],
  previousStats?: OT.PublisherStats,
) => {
  const videoStats = [];
  const audioStats = [];

  for (const stats of outboundRtpStats) {
    const kbs = calculateBitrate(stats, previousStats);
    const { ssrc, bytesSent: byteSent, timestamp: currentTimestamp } = stats;
    const baseStats = { kbs, ssrc, byteSent, currentTimestamp };

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
  previousStats?: OT.PublisherStats,
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

  const { videoStats, audioStats } = extractOutboundRtpStats(outboundRtpStats, previousStats);

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
