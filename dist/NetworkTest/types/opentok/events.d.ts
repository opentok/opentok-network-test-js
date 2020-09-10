import { Dimensions } from './widget';
export interface Event<Type, Target> {
    type: Type;
    cancelable: boolean;
    target: Target;
    isDefaultPrevented(): boolean;
    preventDefault(): void;
}
export interface VideoDimensionsChangedEvent<Target> extends Event<'videoDimensionsChanged', Target> {
    oldValue: Dimensions;
    newValue: Dimensions;
}
export interface OTEventEmitter<EventMap> {
    on<EventName extends keyof EventMap>(eventName: EventName, callback: (event: EventMap[EventName]) => void): void;
    once<EventName extends keyof EventMap>(eventName: EventName, callback: (event: EventMap[EventName]) => void): void;
    off<EventName extends keyof EventMap>(eventName?: EventName, callback?: (event: EventMap[EventName]) => void): void;
}
