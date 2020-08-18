export declare type AV = 'audio' | 'video';
export interface HasAudioVideo<A> {
    audio: A;
    video: A;
}
export interface Kbps {
    kbps: number;
}
export interface KbpsMap extends HasAudioVideo<Kbps[]> {
}
export interface Bandwidth extends HasAudioVideo<number> {
}
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
    mos?: number;
}
export interface AverageStatsBase {
    bitrate: number;
    packetLossRatio: number;
}
