/**
 * @module Test/Publishing
 * @preferred
 *
 * Defines the methods required for the Publishing Test Flow
 */

/**
 * Publishing Test Flow
 */


import * as Promise from 'promise';
import { get, getOr, pick } from '../../util';
import * as e from './errors/';
import subscriberMOS from './helpers/subscriberMOS';
import MOSState from './helpers/MOSState';
import config from './helpers/config';

type QualityTestResultsBuilder = {
  state: MOSState,
  subscriber: OT.Subscriber,
  credentials: SessionCredentials,
  mosScore?: number,
  bandwidth?: Bandwidth,
};
type MOSResultsCallback = (state: MOSState) => void;

/**
 * If not already connected, connect to the OpenTok Session
 */
function connectToSession(session: OT.Session, token: string): Promise<OT.Session> {
  return new Promise((resolve, reject) => {
    if (session.connection) {
      resolve(session);
    } else {
      session.connect(token, (error?: OT.OTError) => error ? reject(new e.SessionConnectionError()) : resolve(session));
    }
  });
}

/**
 * Create a test publisher and subscribe to the publihser's stream
 */
function publishAndSubscribe(session: OT.Session): Promise<OT.Subscriber> {
  return new Promise((resolve, reject) => {
    type StreamCreatedEvent = OT.Event<'streamCreated', OT.Publisher> & { stream: OT.Stream };
    const testContainerDiv = document.createElement('div');
    const publisher = OT.initPublisher(testContainerDiv, {}, (error?: OT.OTError) => {
      if (error) {
        reject(new e.InitPublisherError());
      } else {
        session.publish(publisher, (publishError?: OT.OTError) => {
          if (publishError) {
            return reject(new e.PublishToSessionError());
          }
        });
      }
    });

    publisher.on('streamCreated', (event: StreamCreatedEvent) => {
      const subscriber =
        session.subscribe(event.stream, testContainerDiv, { testNetwork: true }, (subscribeError?: OT.OTError) => {
          return subscribeError ? reject(new e.SubscribeError()) : resolve(subscriber);
        });
    });
  });
}
/**
 *  Connect to the OpenTok session, create a publisher, and subsribe to the publisher's stream
 */
function subscribeToTestStream(
  OT: OpenTok,
  session: OT.Session,
  credentials: SessionCredentials): Promise<OT.Subscriber> {
  return new Promise((resolve, reject) => {
    connectToSession(session, credentials.token)
      .then(publishAndSubscribe)
      .then(resolve)
      .catch(reject);
  });
}

function buildResults(builder: QualityTestResultsBuilder): QualityTestResults {
  const baseProps: (keyof AverageStats)[] = ['bitrate', 'packetLossRatio', 'supported', 'reason'];
  return {
    mos: builder.state.qualityScore(),
    audio: pick(baseProps, builder.state.stats.audio),
    video: pick(baseProps.concat(['frameRate', 'recommendedResolution']), builder.state.stats.video),
  };
}

function checkSubscriberQuality(
  OT: OpenTok,
  session: OT.Session,
  credentials: SessionCredentials,
  onUpdate?: UpdateCallback<OT.SubscriberStats>): Promise<QualityTestResults> {

  let mosEstimatorTimeoutId: number;

  return new Promise((resolve, reject) => {
    subscribeToTestStream(OT, session, credentials)
      .then((subscriber: OT.Subscriber) => {
        if (!subscriber) {
          reject(new e.MissingSubscriberError());
        } else {
          try {
            const builder: QualityTestResultsBuilder = {
              state: new MOSState(),
              ... { subscriber },
              ... { credentials },
            };

            const getStatsListener = (error?: OT.OTError, stats?: OT.SubscriberStats) => {
              stats && onUpdate && onUpdate(stats);
            };

            const resultsCallback: MOSResultsCallback = (state: MOSState) => {
              clearTimeout(mosEstimatorTimeoutId);
              session.disconnect();
              resolve(buildResults(builder));
            };

            subscriberMOS(builder.state, subscriber, getStatsListener, resultsCallback);

            mosEstimatorTimeoutId = window.setTimeout(() => {
              session.disconnect();
              resolve(buildResults(builder));
            }, config.getStatsVideoAndAudioTestDuration);

          } catch (exception) {
            reject(new e.SubscriberGetStatsError());
          }
        }
      })
      .catch(reject);
  });
}

/**
 * This method checks to see if the client can publish to an OpenTok session.
 */
export default function testQuality(
  OT: OpenTok,
  credentials: SessionCredentials,
  onUpdate?: UpdateCallback<OT.SubscriberStats>,
  onComplete?: CompletionCallback<QualityTestResults>): Promise<QualityTestResults> {
  return new Promise((resolve, reject) => {
    const session = OT.initSession(credentials.apiKey, credentials.sessionId);
    checkSubscriberQuality(OT, session, credentials, onUpdate)
      .then((results: QualityTestResults) => {
        onComplete && onComplete(undefined, results);
        resolve(results);
      })
      .catch((error: Error) => {
        onComplete && onComplete(error, null);
        reject(error);
      });
  });
}
