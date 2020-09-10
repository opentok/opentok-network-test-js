import { Connection } from './connection';
export interface Stream {
    connection: Connection;
    creationTime: number;
    frameRate: number;
    hasAudio: boolean;
    hasVideo: boolean;
    name: string;
    streamId: string;
    videoDimensions: {
        width: number;
        height: number;
    };
    videoType: 'camera' | 'screen';
}
