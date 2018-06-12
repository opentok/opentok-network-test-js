import { Connection } from './connection';
import { OTError } from './error';
import { OTEventEmitter, Event } from './events';
import { Publisher } from './publisher';
import { Stream } from './stream';
import { Subscriber, SubscriberProperties } from './subscriber';
import { Dimensions } from './widget';

export interface Session extends OTEventEmitter<{
  archiveStarted: Event<'archiveStarted', Session> & {
    id: string;
    name: string;
  };

  archiveStopped: Event<'archiveStopped', Session> & {
    id: string;
    name: string;
  };

  connectionCreated: Event<'connectionCreated', Session> & {
    connection: Connection;
  };

  connectionDestroyed: Event<'connectionDestroyed', Session> & {
    connection: Connection;
    reason: string;
  };

  sessionConnected: Event<'sessionConnected', Session>;

  sessionDisconnected: Event<'sessionDisconnected', Session> & {
    reason: string;
  };

  sessionReconnected: Event<'sessionReconnected', Session>;
  sessionReconnecting: Event<'sessionReconnecting', Session>;

  signal: Event<'signal', Session> & {
    type?: string;
    data?: string;
    from: Connection;
  };

  streamCreated: Event<'streamCreated', Session> & {
    stream: Stream;
  };

  streamDestroyed: Event<'streamDestroyed', Session> & {
    stream: Stream;
    reason: string;
  };

  streamPropertyChanged: (
    Event<'streamPropertyChanged', Session> & {
      stream: Stream;
    } & (
      { changedProperty: 'hasAudio'; oldValue: boolean; newValue: boolean; } |
      { changedProperty: 'hasVideo'; oldValue: boolean; newValue: boolean; } |
      { changedProperty: 'videoDimensions'; oldValue: Dimensions; newValue: Dimensions; }
    )
  );
}> {
  capabilities: {
    forceDisconnect: number;
    forceUnpublish: number;
    publish: number;
    subscribe: number;
  };

  connection?: Connection;
  sessionId: string;

  connect(token: string, callback: (error?: Error) => void): void;
  disconnect(): void;
  forceDisconnect(connection: Connection, callback: (error?: Error) => void): void;
  forceUnpublish(stream: Stream, callback: (error?: Error) => void): void;
  getPublisherForStream(stream: Stream): Publisher | undefined;
  getSubscribersForStream(stream: Stream): [Subscriber];
  publish(publisher: Publisher, callback: (error?: Error) => void): void;

  signal(
    signal: { type?: string, data?: string, to?: Connection },
    callback: (error?: Error) => void,
  ): void;

  subscribe(
    stream: Stream,
    targetElement?: HTMLElement | string,
    properties?: SubscriberProperties,
    callback?: (error?: Error) => void,
  ): Subscriber;

  unpublish(publisher: Publisher): void;
  unsubscribe(subscriber: Subscriber): void;
}
