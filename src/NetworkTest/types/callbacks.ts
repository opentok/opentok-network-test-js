import { OT } from './opentok';

export type UpdateCallback<A> = (stats: OT.SubscriberStats) => void;
export type UpdateCallbackStats = OT.SubscriberStats & { phase: string; };
