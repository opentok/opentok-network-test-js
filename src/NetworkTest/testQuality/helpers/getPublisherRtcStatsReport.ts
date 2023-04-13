import { OT } from '../../types/opentok';
import {
  RTCTransportStatsInternal,
  RTCOutboundRtpStreamStatsInternal,
  RTCIceCandidatePairStatsInternal,
  RTCStatsInternal,
  RTCandidateStatsInternal,
} from '../../types/opentok/rtcStats';

const previousStreamStats = new Map<number, [number, number]>();

export async function getPublisherStats(publisher: OT.Publisher): Promise<OT.PublisherStats | null> {

  if (typeof publisher.getRtcStatsReport !== 'function') {
    return null;
  }

  try {
    const publisherStatsReport = await publisher.getRtcStatsReport();
    return extractPublisherStats(publisherStatsReport);
  } catch (error) {
    console.error(error);
  }
}

const calculateBitrate = (stats: RTCOutboundRtpStreamStatsInternal,
  previousSsrcFrameData: [number, number] | undefined) => {
  if (!previousSsrcFrameData) {
    return 0;
  }

  const [previousTimestamp, previousByteSent] = previousSsrcFrameData;
  const bytesSent = stats.bytesSent - previousByteSent;
  const timeDiff = (stats.timestamp - previousTimestamp) / 1000; // Convert to seconds
  return Math.round(bytesSent * 8 / (1000 * timeDiff)); // Convert to bits per second
}

const extractOutboundRtpStats = (outboundRtpStats: RTCOutboundRtpStreamStatsInternal[]) => {
  const videoStats = [];
  const audioStats = [];

  for (const stats of outboundRtpStats) {
    const previousSsrcFrameData = previousStreamStats.get(stats.ssrc);
    const bitrate = calculateBitrate(stats, previousSsrcFrameData);
    previousStreamStats.set(stats.ssrc, [stats.timestamp, stats.bytesSent]);

    const baseStats = { bitrate, ssrc: stats.ssrc, byteSent: stats.bytesSent, currentTimestamp: stats.timestamp };

    if (stats.mediaType === 'video') {
      videoStats.push({
        ...baseStats,
        qualityLimitationReason: stats.qualityLimitationReason || 'N/A',
        resolution: `${stats.frameWidth || 0}x${stats.frameHeight || 0}`,
        framerate: stats.framesPerSecond || 0,
        active: stats.active || false,
        pliCount: stats.pliCount || 0,
        nackCount: stats.nackCount || 0
      });
    } else if (stats.mediaType === 'audio') {
      audioStats.push(baseStats);
    }
  }

  return { videoStats, audioStats };
}

const extractPublisherStats = (publisherRtcStatsReport?: OT.PublisherRtcStatsReport): OT.PublisherStats | null => {
  if (!publisherRtcStatsReport) {
    return null;
  }

  const { rtcStatsReport } = publisherRtcStatsReport[0];

  const rtcStatsArray: RTCStatsInternal[] = Array.from(rtcStatsReport.values());

  const transportStats = rtcStatsArray.find(stats => stats.type === 'transport') as RTCTransportStatsInternal;
  const outboundRtpStats = rtcStatsArray.filter(stats => stats.type === 'outbound-rtp') as RTCOutboundRtpStreamStatsInternal[];
  const iceCandidatePairStats = rtcStatsArray.find(stats => stats.type === 'candidate-pair' && stats.nominated)as RTCIceCandidatePairStatsInternal;

  const findCandidateById = (type: string, id: string) => {
    return rtcStatsArray.find(stats => stats.type === type && stats.id === id) as RTCandidateStatsInternal | null;
  };

  const localCandidate = findCandidateById('local-candidate', iceCandidatePairStats.localCandidateId);
  const remoteCandidate = findCandidateById('remote-candidate', iceCandidatePairStats.remoteCandidateId);

  const { videoStats, audioStats } = extractOutboundRtpStats(outboundRtpStats);

  const availableOutgoingBitrate = iceCandidatePairStats?.availableOutgoingBitrate || -1;
  const currentRoundTripTime = iceCandidatePairStats?.currentRoundTripTime || -1;
  const totalVideoByteSent = videoStats.reduce((sum, stats) => sum + stats.bitrate, 0);
  const totalAudioByteSent = audioStats.length > 0 ? audioStats[0].bitrate : 0;
  const simulcastEnabled = videoStats.length > 1;
  const transportProtocol = localCandidate?.protocol || 'N/A';

  return {
    videoStats,
    audioStats,
    availableOutgoingBitrate,
    totalVideoByteSent,
    totalAudioByteSent,
    simulcastEnabled,
    transportProtocol,
    currentRoundTripTime,
  };
};