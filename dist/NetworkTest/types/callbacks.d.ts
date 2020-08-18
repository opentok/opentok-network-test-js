import { OT } from './opentok';
export declare type UpdateCallback<A> = (stats: OT.SubscriberStats) => void;
export declare type UpdateCallbackStats = OT.SubscriberStats & {
    phase: string;
};
