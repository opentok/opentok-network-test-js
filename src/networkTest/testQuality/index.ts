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
import { get, getOr } from '../../util';
import * as e from '../../errors/index';
import subscriberMOS from './helpers/subscriberMOS';
import MOSState from './helpers/MOSState';
import defaultConfig from './helpers/defaultConfig';
// import { generateRetValFromOptions } from './helpers/generateRetValFromOptions.js';

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
const connectToSession = (session: OT.Session, token: string): Promise<OT.Session> =>
  new Promise((resolve, reject) => {
    if (session.connection) {
      resolve(session);
    } else {
      session.connect(token, (error?: OT.OTError) => error ? reject(error) : resolve(session));
    }
  });

/**
 * Create a test publisher and subscribe to the publihser's stream
 */
const publishAndSubscribe = (session: OT.Session): Promise<OT.Subscriber> =>
  new Promise((resolve, reject) => {
    type StreamCreatedEvent = OT.Event<'streamCreated', OT.Publisher> & { stream: OT.Stream };
    const testContainerDiv = document.createElement('div');
    const publisher = OT.initPublisher(testContainerDiv, {}, (error?: OT.OTError) => {
      if (error) {
        reject(error);
      } else {
        session.publish(publisher, (publishError?: OT.OTError) => {
          if (publishError) {
            return reject(publishError);
          }
        });
      }
    });

    publisher.on('streamCreated', (event: StreamCreatedEvent) => {
      const subscriber =
        session.subscribe(event.stream, testContainerDiv, { testNetwork: true }, (subscribeError?: OT.OTError) => {
          return subscribeError ? reject(subscribeError) : resolve(subscriber);
        });
    });
  });

/**
 *  Connect to the OpenTok session, create a publisher, and subsribe to the publisher's stream
 */
const subscribeToTestStream =
  (OT: OpenTok, session: OT.Session, credentials: SessionCredentials): Promise<OT.Subscriber> =>
    new Promise((resolve, reject) => {
      connectToSession(session, credentials.token)
        .then(publishAndSubscribe)
        .catch(reject);
    });

const buildResults = (builder: QualityTestResultsBuilder): QualityTestResults => {
  return {
    mos: builder.state.qualityScore(),
    audio: {
      bandwidth: get('state.bandwidth.audio', builder),
    },
    video: {
      bandwidth: get('state.bandwidth.video', builder),
    },
  };
};

const checkSubscriberQuality = (
  OT: OpenTok,
  session: OT.Session,
  credentials: SessionCredentials,
  onUpdate?: UpdateCallback<OT.SubscriberStats>): Promise<QualityTestResults> => {

  let mosEstimatorTimeoutId: number;

  return new Promise((resolve, reject) => {
    subscribeToTestStream(OT, session, credentials).then((subscriber: OT.Subscriber) => {
      if (!subscriber) {
        reject(new e.FailedCheckSubscriberQualityMissingSubscriberError());
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
            builder.state = state;
            session.disconnect();
            resolve(buildResults(builder));
          };

          subscriberMOS(builder.state, subscriber, getStatsListener, resultsCallback);

          mosEstimatorTimeoutId = window.setTimeout(() => {
            builder.mosScore = builder.state.qualityScore();
            builder.bandwidth = builder.state.bandwidth;
            session.disconnect();
            resolve(buildResults(builder));
          }, defaultConfig.getStatsVideoAndAudioTestDuration);

        } catch (exception) {
          reject(new e.FailedCheckSubscriberQualityGetStatsError());
        }
      }
    });
  });
};

/**
 * This method checks to see if the client can publish to an OpenTok session.
 */
const testQuality = (
  OT: OpenTok,
  credentials: SessionCredentials,
  environment: OpenTokEnvironment,
  onUpdate?: UpdateCallback<OT.SubscriberStats>,
  onComplete?: CompletionCallback<QualityTestResults>): Promise<QualityTestResults> =>
  new Promise((resolve, reject) => {
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

export default testQuality;
