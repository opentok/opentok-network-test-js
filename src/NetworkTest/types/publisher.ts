export interface VideoStats {
  ssrc: number;
  byteSent: number;
  kbs: number;
  qualityLimitationReason: string;
  resolution: string;
  framerate: number;
  active: boolean;
  pliCount: number;
  nackCount: number;
  currentTimestamp: number;
}

export interface AudioStats {
  kbs: number;
  byteSent: number;
  currentTimestamp: number;
}

export interface PublisherStats {
  videoStats: VideoStats[];
  audioStats: AudioStats[];
  availableOutgoingBitrate: number;
  videoByteSent:number;
  videoKbsSent: number;
  simulcastEnabled: boolean;
  transportProtocol: string;
  currentRoundTripTime: number;
  timestamp: number;
}
