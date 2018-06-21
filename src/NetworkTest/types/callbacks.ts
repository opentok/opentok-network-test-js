import { OT } from './opentok';

export type CompletionCallback<A> = (error: Error | undefined, results: A | null) => void;
export type UpdateCallback<A> = (stats: OT.SubscriberStats) => void;
export type UpdateCallbackStats = OT.SubscriberStats & { phase: string; };
