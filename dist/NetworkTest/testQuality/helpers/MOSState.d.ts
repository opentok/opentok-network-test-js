import { OT } from '../../types/opentok';
import { AverageStats, Bandwidth, HasAudioVideo } from '../types/stats';
export default class MOSState {
    statsLog: OT.SubscriberStats[];
    audioScoresLog: number[];
    videoScoresLog: number[];
    stats: HasAudioVideo<AverageStats>;
    bandwidth: Bandwidth;
    intervalId?: number;
    audioOnlyFallback: boolean;
    constructor(audioOnly?: boolean);
    static readonly maxLogLength: number;
    static readonly scoreInterval: number;
    readonly hasAudioTrack: () => boolean;
    readonly hasVideoTrack: () => boolean;
    private audioScore;
    private videoScore;
    clearInterval(): void;
    private pruneAudioScores;
    private pruneVideoScores;
    pruneScores(): void;
    audioQualityScore(): number;
    videoQualityScore(): number;
}
