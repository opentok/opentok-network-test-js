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
import SubscriberMOS from './helpers/SubscriberMOS';

let updateCallback: UpdateCallback<any> | undefined;
let ot:OpenTok;
let session: OT.Session;
let credentials: SessionCredentials;
const testContainerDiv = document.createElement('div');

const connectToSession = () => {
  return new Promise((resolve, reject) => {
    if (session.connection) {
      resolve(session);
    }
    session.connect(credentials.token, (error) => {
      if (error) {
        reject(error);
      }
      resolve(session);
    });
  });
};

const subscribeToTestStream = () => {
  return new Promise((resolve, reject) => {
    connectToSession().then(() => {
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
    }).
    catch((error) => {
      reject(error);
    });
  });
};

const getFinalRetVal = (results: any): TestQualityResults => {
  const finalReturnValue = {
    mos: results.mosScore,
    audio: {
      bitrate: results.stats.audio.bitrate,
      packetLossRatio: results.stats.audio.packetLoss,
      supported: results.stats.audio.supported,
      reason: results.stats.audio.reason,
    },
    video: {
      bitrate: results.stats.video.bitrate,
      packetLossRatio: results.stats.video.packetLoss,
      frameRate: results.stats.video.frameRate,
      recommendedResolution: results.stats.video.recommendedResolution,
      supported: results.stats.video.supported,
      reason: results.stats.video.reason,
    }
  };

  if (!results.stats.video.supported) {
    delete finalReturnValue.video.recommendedResolution;
    if (results.stats.video.reason === config.strings.noCam) {
      delete finalReturnValue.video.bitrate;
      delete finalReturnValue.video.packetLoss;
      delete finalReturnValue.video.frameRate;
    }
  } else {
    delete finalReturnValue.video.reason;
  }

  if (!results.stats.audio.supported) {
    if (results.stats.audio.reason === config.strings.noMic) {
      delete finalReturnValue.audio.bitrate;
      delete finalReturnValue.audio.packetLoss;
    }
  } else {
    delete finalReturnValue.audio.reason;
  }

  return finalReturnValue;
};

const checkSubscriberQuality = () => {
  let mosEstimatorTimeoutId: number;
  let getStatsListenerIntervalId: number;

  return new Promise((resolve, reject) => {
    subscribeToTestStream().then((subscriber) => {
      const retVal = generateRetValFromOptions({
        subscriber,
        apiKey: credentials.apiKey,
        sessionId: credentials.sessionId,
        token: credentials.token,
      });
      if (!retVal.subscriber) {
        reject(new e.FailedCheckSubscriberQualityMissingSubscriberError());
      } else {
        try {
          SubscriberMOS(
            {
              subscriber: retVal.subscriber,
              getStatsListener: (error: string, stats: OT.SubscriberStats) => {
                updateCallback && updateCallback(stats);
              },
            },
            (qualityScore: number, stats: object) => {
              clearTimeout(mosEstimatorTimeoutId);
              retVal.mosScore = qualityScore;
              retVal.stats = stats;
              session.disconnect();
              resolve(getFinalRetVal(retVal));
            });
          mosEstimatorTimeoutId = setTimeout(
            () => {
              clearInterval(getStatsListenerIntervalId);
              retVal.mosScore = retVal.mosEstimator.qualityScore();
              retVal.bandwidth = retVal.mosEstimator.bandwidth;
              session.disconnect();
              resolve(getFinalRetVal(retVal));
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
const testQuality = (
  otObj: OpenTok,
  credentialsObj: SessionCredentials,
  environment: OpenTokEnvironment,
  onUpdate?: UpdateCallback<any>,
  onComplete?: CompletionCallback<any>): Promise<any> =>
  new Promise((resolve, reject) => {
    ot = otObj;
    credentials = credentialsObj;
    session = ot.initSession(credentials.apiKey, credentials.sessionId);
    updateCallback = onUpdate;
    checkSubscriberQuality()
    // .then(cleanup)
      .then((result) => {
        resolve(result);
      });
  });

export default testQuality;
