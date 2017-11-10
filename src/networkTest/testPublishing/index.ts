/**
 * @module Test/Publishing
 * @preferred
 *
 * Defines the methods required for the Publishing Test Flow
 */

/**
 * Publishing Test Flow
 */
 debugger

const config = require('./defaultConfig');
import * as Promise from 'promise';
import * as e from '../../errors/index';
// import generateRetValFromOptions from './helpers/generateRetValFromOptions';
const { generateRetValFromOptions } = require('./helpers/generateRetValFromOptions.js');
import SubscriberMOS from './helpers/SubscriberMOS';
// const { SubscriberMOS } = require('./helpers/SubscriberMOS.js');

console.log('foo', SubscriberMOS);
let statusCallback: StatusCallback;
const testContainerDiv = document.createElement('div');

const subscribeToTestStream = (ot:OpenTok, session: OT.Session, credentials: SessionCredentials) => {
  return new Promise((resolve, reject) => {
    session.connect(credentials.token, (error) => {
      if (error) {
        reject(error);
      }
      const publisher = ot.initPublisher(testContainerDiv, {}, (error) => {
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
    });
  });
};

const checkSubscriberQuality = (
  ot: OpenTok,
  credentials: SessionCredentials,
) => {
  const session = ot.initSession(credentials.apiKey, credentials.sessionId);
  let mosEstimatorTimeoutId: number;
  let getStatsListenerIntervalId: number;

  return new Promise((resolve, reject) => {
    subscribeToTestStream(ot, session, credentials).then((subscriber) => {
      const retVal = {
        subscriber,
        session,
        apiKey: credentials.apiKey,
        sessionId: credentials.sessionId,
        token: credentials.token,
        localPublisher: publisher,
        'mosEstimator',
        'getStatsListener',

      };
      if (!retVal.subscriber) {
        reject(new e.FailedCheckSubscriberQualityMissingSubscriberError());
      } else {
        try {
          SubscriberMOS(
            {
              subscriber: retVal.subscriber,
              getStatsListener: (error: string, stats: string) => {
                console.log('getStatsListener', error, stats);
              },
            },
            (qualityScore: number, bandwidth: number) => {
              clearTimeout(mosEstimatorTimeoutId);
              retVal.mosScore = qualityScore;
              retVal.bandwidth = bandwidth;
              resolve(retVal);
            });
          mosEstimatorTimeoutId = setTimeout(
            () => {
              clearInterval(getStatsListenerIntervalId);
              retVal.mosScore = retVal.mosEstimator.qualityScore();
              retVal.bandwidth = retVal.mosEstimator.bandwidth;
              resolve(retVal);
            }, 
            config.getStatsVideoAndAudioTestDuration);
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
const testPublishing = (
  ot: OpenTok,
  credentials: SessionCredentials,
  environment: OpenTokEnvironment,
  onStatus?: StatusCallback ,
  onComplete?: CompletionCallback<any>): Promise<any> =>
  new Promise((resolve, reject) => {
    statusCallback = onStatus || function () {};
    statusCallback('hello from testPublishing');
    checkSubscriberQuality(ot, credentials).then(() => {
      statusCallback('test complete');
      resolve(true);
    });
  });

export default testPublishing;
