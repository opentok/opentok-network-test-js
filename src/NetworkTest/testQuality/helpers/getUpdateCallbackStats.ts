import { OT } from '../../types/opentok';
import { UpdateCallbackStats, CallbackTrackStats } from '../../types/callbacks';

const getUpdateCallbackStats = (
  subscriberStats: OT.SubscriberStats,
  publisherStats: OT.PublisherStats,
  phase: string,
): UpdateCallbackStats => {
  const { audio: audioTrackStats, video: videoTrackStats } = subscriberStats;

  const audioCallbackStats: CallbackTrackStats = {
    bytesSent: publisherStats.audioStats[0].byteSent,
    bytesReceived: audioTrackStats.bytesReceived,
    packetsLost: audioTrackStats.packetsLost,
    packetsReceived: audioTrackStats.packetsReceived,
  };

  let videoCallbackStats: CallbackTrackStats & { frameRate: number } | null = null;

  if (phase === 'audio-video') {
    videoCallbackStats = {
      bytesSent: publisherStats.videoByteSent,
      bytesReceived: videoTrackStats?.bytesReceived || 0,
      packetsLost: videoTrackStats?.packetsLost || 0,
      packetsReceived: videoTrackStats?.packetsReceived || 0,
      frameRate: videoTrackStats?.frameRate || 0,
    };
  }

  return {
    phase,
    audio: audioCallbackStats,
    video: videoCallbackStats,
    timestamp: subscriberStats.timestamp,
  };
};

export default getUpdateCallbackStats;
