export interface RTCStatsInternal {
  forEach(callbackfn: (value: RTCStatsInternal, key: string, parent: RTCStatsReport) => void, thisArg?: any): void;
  entries(): IterableIterator<[string, RTCStatsInternal]>;
  get(key: string): RTCStatsInternal | undefined;
  has(key: string): boolean;
  keys(): IterableIterator<string>;
  values(): IterableIterator<RTCStatsInternal>;
  [Symbol.iterator](): IterableIterator<[string, RTCStatsInternal]>;
  size: number;
  id: string;
  timestamp: DOMHighResTimeStamp;
  type: RTCStatsType;
  nominated: boolean;
}

export interface RTCStatsArray extends RTCStatsInternal {
  find(
    predicate: (value: RTCStatsInternal, index: number, obj: RTCStatsInternal[]) => boolean,
    thisArg?: any,
  ): RTCStatsInternal | undefined;
  filter(
    predicate: (value: RTCStatsInternal, index: number, obj: RTCStatsInternal[]) => boolean,
    thisArg?: any,
  ): RTCStatsInternal[];
}

type DOMHighResTimeStamp = number;

export type PublisherRtcStatsReport = {
  rtcStatsReport: RTCStatsArray;
};

export interface RTCandidateStatsInternal extends RTCStatsInternal {
  address: string;
  candidateType: string;
  foundation: string;
  ip: string;
  isRemote: boolean;
  networkType: string;
  port: number;
  priority: number;
  protocol: string;
  tcpType: string;
  transportId: string;
  usernameFragment: string;
}

export interface RTCTransportStats extends RTCStatsInternal {
  bytesReceived?: number;
  bytesSent?: number;
  dtlsCipher?: string;
  dtlsRole: string;
  dtlsState: string;
  iceLocalUsernameFragment?: string;
  iceRole: string;
  iceState: string;
  id: string;
  localCertificateId?: string;
  packetsReceived?: number;
  packetsSent?: number;
  remoteCertificateId?: string;
  selectedCandidatePairChanges?: number;
  selectedCandidatePairId?: string;
  srtpCipher?: string;
  timestamp: DOMHighResTimeStamp;
  tlsVersion?: string;
  type: 'transport';
}

export interface RTCIceCandidatePairStats extends RTCStatsInternal {
  availableOutgoingBitrate?: number;
  bytesDiscardedOnSend?: number;
  bytesReceived?: number;
  bytesSent?: number;
  consentRequestsSent?: number;
  currentRoundTripTime?: number;
  id: string;
  lastPacketReceivedTimestamp?: number;
  lastPacketSentTimestamp?: number;
  localCandidateId: string;
  nominated: boolean;
  packetsDiscardedOnSend?: number;
  packetsReceived?: number;
  packetsSent?: number;
  priority?: number;
  remoteCandidateId: string;
  requestsReceived?: number;
  requestsSent?: number;
  responsesReceived?: number;
  responsesSent?: number;
  state: string;
  timestamp: DOMHighResTimeStamp;
  totalRoundTripTime?: number;
  transportId: string;
  type: 'candidate-pair';
  writable?: boolean;
}

export interface RTCOutboundRtpStreamStats extends RTCStatsInternal {
  id: string;
  timestamp: number;
  ssrc: number;
  kind: string;
  mediaType: string;
  trackId: string;
  transportId: string;
  codecId: string;
  firCount: number;
  framesEncoded: number;
  keyFramesEncoded: number;
  totalEncodeTime: number;
  totalEncodedBytesTarget: number;
  framesSent: number;
  hugeFramesSent: number;
  headerBytesSent: number;
  packetsSent: number;
  retransmittedPacketsSent: number;
  retransmittedBytesSent: number;
  bytesSent: number;
  qualityLimitationResolutionChanges: number;
  qualityLimitationDurations: {
    bandwidth: number;
    cpu: number;
    none: number;
    other: number;
  };
  qualityLimitationReason: string;
  encoderImplementation: string;
  powerEfficientEncoder: boolean;
  mediaSourceId: string;
  remoteId: string;
  scalabilityMode: string;
  framesPerSecond: number;
  frameWidth: number;
  frameHeight: number;
  qpSum: number;
  nackCount: number;
  pliCount: number;
  active: boolean;
  targetBitrate: number;
  totalPacketSendDelay: number;
}

export type RTCStatsType =
  | 'candidate-pair'
  | 'certificate'
  | 'codec'
  | 'csrc'
  | 'data-channel'
  | 'inbound-rtp'
  | 'local-candidate'
  | 'media-source'
  | 'outbound-rtp'
  | 'peer-connection'
  | 'remote-candidate'
  | 'remote-inbound-rtp'
  | 'remote-outbound-rtp'
  | 'track'
  | 'transport';
