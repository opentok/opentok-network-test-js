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
import subsriberMOS from './helpers/subscriberMOS';

let updateCallback: UpdateCallback<any> | undefined;
// let ot:OpenTok;
// let session: OT.Session;
// let credentials: SessionCredentials;
const testContainerDiv = document.createElement('div');

const connectToSession = (token: string) => {
  return new Promise((resolve, reject) => {
    if (session.connection) {
      resolve(session);
    }
    session.connect(token, (error) => {
      if (error) {
        reject(error);
      }
      resolve(session);
    });
  });
};

const subscribeToTestStream = (OT: OpenTok, credentials: SessionCredentials) => {
  return new Promise((resolve, reject) => {
    connectToSession(credentials.token).then(() => {
      const publisher = OT.initPublisher(testContainerDiv, {}, (error) => {
        if (error) {
          reject(error);
        }
        session.publish(publisher, (error) => {
          if (error) {
            reject(error);
            return;
          }
        });
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

const checkSubscriberQuality = (OT: OpenTok, credentials: SessionCredentials) => {
  let mosEstimatorTimeoutId: number;
  let getStatsListenerIntervalId: number;

  return new Promise((resolve, reject) => {
    subscribeToTestStream(OT, credentials).then((subscriber) => {
      const retVal = generateRetValFromOptions({ ... { subscriber }, ...credentials });
      if (subscriber) {
        reject(new e.FailedCheckSubscriberQualityMissingSubscriberError());
      } else {
        try {
          const getStatsListener = (error: string, stats: OT.SubscriberStats) => {
            updateCallback && updateCallback(stats);
          };
          const resultsCallback = (qualityScore: number, bandwidth: number) => {
            clearTimeout(mosEstimatorTimeoutId);
            retVal.mosScore = qualityScore;
            retVal.bandwidth = bandwidth;
            session.disconnect();
            resolve(getFinalRetVal(retVal));
          };
          subsriberMOS(subscriber, getStatsListener, resultsCallback);
          mosEstimatorTimeoutId = setTimeout(() => {
            clearInterval(getStatsListenerIntervalId);
            retVal.mosScore = retVal.mosEstimator.qualityScore();
            retVal.bandwidth = retVal.mosEstimator.bandwidth;
            session.disconnect();
            resolve(getFinalRetVal(retVal));
          }, config.getStatsVideoAndAudioTestDuration);
        } catch (exception) {
          /* TBD:
          if (exception instanceof e.PrecallError) {
            reject(exception);
          } else {
          */
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
  onUpdate?: UpdateCallback<any>,
  onComplete?: CompletionCallback<any>): Promise<any> =>
  new Promise((resolve, reject) => {
    // ot = otObj;
    // credentials = credentialsObj;
    const session = OT.initSession(credentials.apiKey, credentials.sessionId);
    updateCallback = onUpdate;
    // If all we're doing is resolving the result, we can just return
    return checkSubscriberQuality(OT, session, credentials);
  });

export default testQuality;
