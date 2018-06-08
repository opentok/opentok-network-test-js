import { OT } from '../../types/opentok';

export interface QualityStats {
  averageBitrate: number;
  packetLossRatio: number;
  frameRate?: number;
}

export interface AverageStats {
  bitrate?: number;
  packetLossRatio?: number;
  supported?: boolean;
  reason?: string;
  frameRate?: number;
  recommendedFrameRate?: number;
  recommendedResolution?: string;
}

export interface AverageStatsBase {
  bitrate: number;
  packetLossRatio: number;
}

export type StatsListener = (error?: OT.OTError, stats?: OT.SubscriberStats) => void;
