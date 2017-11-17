const OpenTok = require('opentok');
const Promise = require('promise');
const fse = require('fs-extra');
const config = require('./config');

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
  const [ standardCredentials, safariCredentials] = credentialsArray;
  const credentials = {
    standard: standardCredentials,
    safari: safariCredentials,
  };
  return fse.outputJson('./test/credentials.json', credentials);
}

function generateCredentials(){
  const { standard, safari } = config;
  Promise.all([standard, safari].map(createSessionAndToken))
    .then(writeCredentials)
    .then((results) => console.info('Generated session credentials for test.'))
    .catch(e => console.error('Failed to generate test credentials', e));
}

generateCredentials();
