import { AV, AverageStatsBase } from '../types/stats';
export interface QualityEvaluationResults {
    supported: boolean;
    recommendedFrameRate?: number;
    recommendedResolution?: string;
    reason?: string;
}
export default function getQualityEvaluation(stats: AverageStatsBase, type: AV): QualityEvaluationResults;
