// eslint-disable-next-line  @typescript-eslint/no-unused-vars
export type UpdateCallback<A> = (stats: UpdateCallbackStats) => void;
export type UpdateCallbackStats = {
  audio: CallbackTrackStats;
  video: CallbackTrackStats & { frameRate: number };
  timestamp: number;
  phase: string;
};

export interface CallbackTrackStats {
  bytesSent: number;
  bytesReceived: number;
  packetsLost: number;
  packetsReceived: number;
}
