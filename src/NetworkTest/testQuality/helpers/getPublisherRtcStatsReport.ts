import { OT } from '../../types/opentok';
import {
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
    return null;
  }
}

const calculateAudioBitrate = (
  stats: RTCOutboundRtpStreamStats,
  previousStats: OT.PublisherStats | undefined,
): number => {
  const previousSsrcFrameData = previousStats?.audioStats[0];
  if (!previousSsrcFrameData) {
    return 0;
  }

  const { currentTimestamp: previousTimestamp, byteSent: previousByteSent } = previousSsrcFrameData;
  const byteSent = stats.bytesSent - previousByteSent;
  const timeDiff = (stats.timestamp - previousTimestamp) / 1000; // Convert to seconds

  return Math.round((byteSent * 8) / (1000 * timeDiff)); // Convert to bits per second
};

const calculateVideoBitrate = (
  stats: RTCOutboundRtpStreamStats,
  previousStats: OT.PublisherStats | undefined,
): number => {
  const previousSsrcFrameData = previousStats?.videoStats.find(videoStats => videoStats.ssrc === stats.ssrc);
  if (!previousSsrcFrameData) {
    return 0;
  }

  const { currentTimestamp: previousTimestamp, byteSent: previousByteSent } = previousSsrcFrameData;
  const byteSent = stats.bytesSent - previousByteSent;
  const timeDiff = (stats.timestamp - previousTimestamp) / 1000; // Convert to seconds

  return Math.round((byteSent * 8) / (1000 * timeDiff)); // Convert to kbit per second
};

const extractOutboundRtpStats = (
  outboundRtpStats: RTCOutboundRtpStreamStats[],
  previousStats?: OT.PublisherStats,
) => {
  const videoStats = [];
  const audioStats = [];
  for (const stats of outboundRtpStats) {
    if (stats.kind === 'video' || stats.mediaType === 'video') {
      const kbs = calculateVideoBitrate(stats, previousStats);
      const { ssrc, bytesSent: byteSent, timestamp: currentTimestamp } = stats;
      const baseStats = { kbs, ssrc, byteSent, currentTimestamp };
      videoStats.push({
        ...baseStats,
        qualityLimitationReason: stats.qualityLimitationReason,
        resolution: `${stats.frameWidth || 0}x${stats.frameHeight || 0}`,
        framerate: stats.framesPerSecond || 0,
        active: stats.active || false,
        pliCount: stats.pliCount || 0,
        nackCount: stats.nackCount || 0,
      });
    } else if (stats.kind === 'audio' || stats.mediaType === 'audio') {
      const kbs = calculateAudioBitrate(stats, previousStats);
      const { ssrc, bytesSent: byteSent, timestamp: currentTimestamp } = stats;
      const baseStats = { kbs, ssrc, byteSent, currentTimestamp };
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

  const outboundRtpStats = rtcStatsArray.filter(
    stats => stats.type === 'outbound-rtp') as RTCOutboundRtpStreamStats[];
  const iceCandidatePairStats = rtcStatsArray.find(
    stats => stats.type === 'candidate-pair' && stats.nominated) as RTCIceCandidatePairStats;

  const findCandidateById = (type: string, id: string) => {
    return rtcStatsArray.find(stats => stats.type === type && stats.id === id) as RTCandidateStatsInternal | null;
  };

  const localCandidate = findCandidateById('local-candidate', iceCandidatePairStats.localCandidateId);

  const { videoStats, audioStats } = extractOutboundRtpStats(outboundRtpStats, previousStats);

  const availableOutgoingBitrate = iceCandidatePairStats?.availableOutgoingBitrate || -1;
  const currentRoundTripTime = iceCandidatePairStats?.currentRoundTripTime || -1;
  const videoKbsSent = videoStats.reduce((sum, stats) => sum + stats.kbs, 0);
  const videoByteSent = videoStats.reduce((sum, stats) => sum + stats.byteSent, 0);
  const simulcastEnabled = videoStats.length > 1;
  const transportProtocol = localCandidate?.protocol || 'N/A';
  const timestamp = localCandidate?.timestamp || 0;

  return {
    videoStats,
    audioStats,
    availableOutgoingBitrate,
    videoByteSent,
    videoKbsSent,
    simulcastEnabled,
    transportProtocol,
    currentRoundTripTime,
    timestamp,
  };
};
