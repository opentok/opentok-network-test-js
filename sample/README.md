OpenTok Network Test sample app
===============================

This sample uses the opentok-network-test-js module to check connectivity to
OpenTok servers and test session quality.

## Configuring the app:

Make a copy of the /sample/configSample.js file, saving it to sample/config.js. Edit the
properties in that file:

* `apiKey` -- The API key corresponding to the OpenTok project the app uses.

* `sessionId` -- A test session ID.

   In a real (not test) app, this session ID must be for a different session than
   the one that the app will use for communication. And you will generate a unique test
   session ID for each client. This session ID is used for the network test, and it
   must be different than the session ID used for communication in the app.

* `token` -- A token corresponding to the test session.

For test purposes, you can obtain a test session ID an token from the [TokBox account
page](https://tokbox.com/account). However, in a real application, use the [OpenTok server
SDKs](https://tokbox.com/developer/sdks/server/) to generate a unique test session ID (and a
corresponding token) for each client.

## To run this test app:

Make sure you have configured the app (see the previous section). Then:

1. Run `npm install` (in the /sample directory).

   If you have locally modified the source code for the opentok-network-test-js package,
   run `npm install; npm run build` in the root directory of the project. Then run `npm link`
   in the root directory. Then run `npm link opentok-network-test-js` in the /sample directory.

2. Run `npm run build` (in the /sample directory). (Run this any time you edit the source code.)

3. Open the /sample/index.html page in a web browser.
