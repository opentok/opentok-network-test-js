export interface AudioThreshold {
    bps: number;
    plr: number;
}
export interface VideoThreshold extends AudioThreshold {
    recommendedSetting: string;
}
export declare type QualityTestConfig = {
    getStatsInterval: number;
    getStatsVideoAndAudioTestDuration: number;
    getStatsAudioOnlyDuration: number;
    subscribeOptions: {
        testNetwork: boolean;
        audioVolume: number;
    };
    minimumVideoAndAudioTestSampleSize: number;
    steadyStateSampleWindow: number;
    steadyStateAllowedDelta: number;
    qualityThresholds: {
        audio: AudioThreshold[];
        video: VideoThreshold[];
    };
    strings: {
        bandwidthLow: string;
        noCam: string;
        noMic: string;
    };
};
declare const config: QualityTestConfig;
export default config;
