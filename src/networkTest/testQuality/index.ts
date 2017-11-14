/**
 * @module Test/Publishing
 * @preferred
 *
 * Defines the methods required for the Publishing Test Flow
 */

/**
 * Publishing Test Flow
 */

const config = require('./defaultConfig');
import * as Promise from 'promise';
import * as e from '../../errors/index';
const { generateRetValFromOptions } = require('./helpers/generateRetValFromOptions.js');
import subscriberMOS from './helpers/subscriberMOS';


const testContainerDiv = document.createElement('div');

const connectToSession = (session: OT.Session, token: string) =>
  new Promise((resolve, reject) => {
    if (session.connection) {
      resolve(session);
    } else {
      session.connect(token, (error?: OT.OTError) => error ? reject(error) : resolve(session));
    }
  });

const subscribeToTestStream = (OT: OpenTok, session: OT.Session, credentials: SessionCredentials) => {
  return new Promise((resolve, reject) => {
    connectToSession(session, credentials.token).then(() => {
      const publisher = OT.initPublisher(testContainerDiv, {}, (error) => {
        if (error) {
          reject(error);
        } else {
          session.publish(publisher, (error) => {
            if (error) {
              reject(error);
              return;
            }
          });
        }
      });
      publisher.on('streamCreated', (event: StreamCreatedEvent) => {
        const subProps = {
          testNetwork: true,
        };
        const subscriber = session.subscribe(event.stream, testContainerDiv, subProps, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(subscriber);
          }
        });
      });
    }).
      catch((error) => {
        reject(error);
      });
  });
};

const getFinalRetVal = (results: any): TestQualityResults => {
  return {
    mos: results.mosScore,
    audio: {
      bandwidth: results.bandwidth.audio,
    },
    video: {
      bandwidth: results.bandwidth.video,
    },
  };
};

const checkSubscriberQuality = (
  OT: OpenTok,
  session: OT.Session,
  credentials: SessionCredentials,
  onUpdate?: UpdateCallback<OT.SubscriberStats>): Promise<TestQualityResults> => {

  let mosEstimatorTimeoutId: number;
  let getStatsListenerIntervalId: number; // This is never used

  return new Promise((resolve, reject) => {
    subscribeToTestStream(OT, session, credentials).then((subscriber) => {
      const retVal = generateRetValFromOptions({ ... { subscriber }, ...credentials });
      if (subscriber) {
        reject(new e.FailedCheckSubscriberQualityMissingSubscriberError());
      } else {
        try {
          const getStatsListener = (error?: OT.OTError, stats?: OT.SubscriberStats) => {
            stats && onUpdate && onUpdate(stats);
          };
          const resultsCallback = (qualityScore: number, bandwidth: Bandwidth) => {
            clearTimeout(mosEstimatorTimeoutId);
            retVal.mosScore = qualityScore;
            retVal.bandwidth = bandwidth;
            session.disconnect();
            resolve(getFinalRetVal(retVal));
          };
          subscriberMOS(subscriber, getStatsListener, resultsCallback);
          mosEstimatorTimeoutId = setTimeout(() => {
            clearInterval(getStatsListenerIntervalId);
            retVal.mosScore = retVal.mosEstimator.qualityScore();
            retVal.bandwidth = retVal.mosEstimator.bandwidth;
            session.disconnect();
            resolve(getFinalRetVal(retVal));
          }, config.getStatsVideoAndAudioTestDuration);
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
  onComplete?: CompletionCallback<TestQualityResults>): Promise<TestQualityResults> =>
  new Promise((resolve, reject) => {
    const session = OT.initSession(credentials.apiKey, credentials.sessionId);
    // updateCallback = onUpdate;
    // If all we're doing is resolving the result, we can just return
    checkSubscriberQuality(OT, session, credentials, onUpdate)
      .then((results: TestQualityResults) => {
        onComplete && onComplete(undefined, results);
        resolve(results);
      })
      .catch((error: Error) => {
        onComplete && onComplete(error, null);
        reject(error);
      });
  });

export default testQuality;
