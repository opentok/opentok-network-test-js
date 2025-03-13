require('dotenv').config()
const { Vonage } = require('@vonage/server-sdk');
const fse = require('fs-extra');
const fs = require('fs');
const applicationId = process.env.TEST_APPLICATION_ID;
const privateKeyPath = './private.key';


async function createSessionAndToken({applicationId, privateKey}) {
  const vonage = new Vonage({
    applicationId,
    privateKey,
  });
  try {
    const session = await vonage.video.createSession({ mediaMode: 'routed' });
    const token = vonage.video.generateClientToken(session.sessionId);
    const { sessionId } = session;
    return { applicationId, sessionId, token };
  } catch(e) {
    console.error(e);
    throw e;
  }


}

async function writeCredentials(credentialsArray) {
  const [primary, faultyLogging, faultyApi] = credentialsArray;
  const credentials = { primary, faultyLogging, faultyApi };
  return fse.outputJson('./test/credentials.json', credentials);
}

async function generateCredentials(){
  try {
    const privateKey = fs.readFileSync(privateKeyPath);

    const sessions = await Promise.all([
      createSessionAndToken({ applicationId, privateKey }),
      createSessionAndToken({ applicationId, privateKey }),
      createSessionAndToken({ applicationId, privateKey })
    ]);

    await writeCredentials(sessions);
    console.info('Generated session credentials for test.');
  } catch(e) {
    console.error('Failed to generate test credentials', e);
  }
}

generateCredentials();
