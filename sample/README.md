OpenTok Network Test sample app
===============================

This sample uses the opentok-network-test-js module to check connectivity to
OpenTok servers and test session quality.

## Configuring the app:

Make a copy of the /sample/src/js/configSample.js file, saving it to sample/src/js/config.js.
Edit the properties in that file:

* `apiKey` -- The API key corresponding to the OpenTok project the app uses.

* `sessionId` -- A test session ID.

   In a real (not test) app, this session ID must be for a different session than
   the one that the app will use for communication. And you will generate a unique test
   session ID for each client. This session ID is used for the network test, and it
   must be different than the session ID used for communication in the app. The test
   session must be a routed session -- one that uses the [OpenTok Media
   Router](https://tokbox.com/developer/guides/create-session/#media-mode).

* `token` -- A token corresponding to the test session. Generate a test
  token that has its role set to `publisher` or `moderator`.

For test purposes, you can obtain a test session ID an token from the [TokBox account
page](https://tokbox.com/account). However, in a real application, use the [OpenTok server
SDKs](https://tokbox.com/developer/sdks/server/) to generate a unique test session ID (and a
corresponding token) for each client.

## To run this test app:

Make sure you have configured the app (see the previous section). Then:

1. Make sure you have built the opentok-network-test-js module locally. See the README
   in the root directory of the project.

   If you want the sample app to load opentok-network-test-js from npmjs.com, change the
   package.json file in the /sample directory to load it from "*" (or a version, such as
   "^2.x") instead of "file://..":

   ```"opentok-network-test-js": "*"```

2. Run `npm install` (in the /sample directory).

3. Run `npm run build` (in the /sample directory). (Run this any time you edit the source code.)

4. Open the /sample/index.html page in a web browser.

## About the test app:

The app instantiates an `OTNetworkTest` object, passing in the API key, session ID and token you
set in the config.js file. (See "Configuring the app" above.)

Then it calls the `testConnectivity()` method of the `OTNetworkTest` object. The completion handler
for the method displays the test results. The results indicate whether the test succeeded, and if
not, which tests failed. Or, if there was an error in calling the method, the results indicate
that. 

Then the app calls the `testQuality()` method of the `OTNetworkTest` object. The completion handler
for the method displays the test results. The results display the resulting MOS estimate, the audio
statistics, and the video statistics. Or, if the test failed, the results indicate that.

While the quality test is running, the `updateCallback` function passed into the `testQuality()`
method is invoked. The intermediate audio and video statistics are passed into that method, and
the app displays the audio and video bitrate in a graph.
