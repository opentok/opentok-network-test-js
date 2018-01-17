require('dotenv').config()
const OpenTok = require('opentok');
const Promise = require('promise');
const fse = require('fs-extra');
const apiKey = process.env.TEST_API_KEY
const apiSecret = process.env.TEST_API_SECRET


function createSessionAndToken({ apiKey, apiSecret }) {
  return new Promise((resolve, reject) => {
    const opentok = new OpenTok(apiKey, apiSecret);
    opentok.createSession({ mediaMode: 'routed' }, (error, session) => {
      if (error) {
        reject(error);
      } else {
        const token = opentok.generateToken(session.sessionId);
        const { sessionId } = session;
        resolve({ apiKey, sessionId, token });
      }
    });
  });
}

function writeCredentials(credentialsArray) {
  const [primary, faultyLogging, faultyApi] = credentialsArray;
  const credentials = { primary, faultyLogging, faultyApi };
  return fse.outputJson('./test/credentials.json', credentials);
}

function generateCredentials(){
  const create = () => createSessionAndToken({ apiKey, apiSecret })

  Promise.all([create(), create(), create()])
    .then(writeCredentials)
    .then((results) => console.info('Generated session credentials for test.'))
    .catch(e => console.error('Failed to generate test credentials', e));
}

generateCredentials();
