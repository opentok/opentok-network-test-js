import { OT } from '../../types/opentok';
import { UpdateCallbackStats, CallbackTrackStats } from '../../types/callbacks';

const getUpdateCallbackStats = (subscriberStats: OT.SubscriberStats, publisherStats: OT.PublisherStats,
                                phase: string): UpdateCallbackStats => {
  const { audio: audioTrackStats, video: videoTrackStats } = subscriberStats;
  const audioCallbackStats: CallbackTrackStats = {
    bytesSent: publisherStats.audioStats[0].byteSent,
    bytesReceived: audioTrackStats.bytesReceived,
    packetsLost: audioTrackStats.packetsLost,
    packetsReceived: audioTrackStats.packetsReceived,
  };

  const videoCallbackStats: CallbackTrackStats & { frameRate: number; } = {
    bytesSent: publisherStats.videoByteSent,
    bytesReceived: videoTrackStats.bytesReceived,
    packetsLost: videoTrackStats.packetsLost,
    packetsReceived: videoTrackStats.packetsReceived,
    frameRate: videoTrackStats.frameRate,
  };

  return {
    phase,
    audio: audioCallbackStats,
    video: videoCallbackStats,
    availableOugoingBitrate: publisherStats.availableOutgoingBitrate,
    timestamp: subscriberStats.timestamp,
  };
};

export default getUpdateCallbackStats;
