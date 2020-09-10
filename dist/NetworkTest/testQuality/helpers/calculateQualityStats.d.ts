import { SubscriberStats } from '../../types/opentok/subscriber';
import { HasAudioVideo, QualityStats } from '../types/stats';
export default function calculateQualityStats(latestSamples: SubscriberStats[]): HasAudioVideo<QualityStats[]>;
