
![logo](https://raw.githubusercontent.com/opentok/opentok-network-test-js/master/media/tokbox-logo.png)

# OpenTok Network Test

[![Build Status](https://travis-ci.org/opentok/opentok-network-test-js.svg?branch=master)](https://travis-ci.org/opentok/opentok-network-test-js)
[![license](https://img.shields.io/github/license/opentok/opentok-network-test-js.svg)](./.github/CONTRIBUTING.md)
[![npm](https://img.shields.io/npm/v/opentok-network-test-js.svg)](https://www.npmjs.com/package/opentok-accelerator-core)

This Node module lets you check network connectivity to resources and services required
to use [OpenTok](https://tokbox.com). Run this on a web client to get the following information:

* Whether the client will be able to succeed in connecting to an OpenTok session

* A [MOS estimate](https://en.wikipedia.org/wiki/Mean_opinion_score) for the session quality
  the client will experience

* A recommended frame rate and resolution to use for publishing to a session

For a sample that uses this module, see the [OpenTok Pre-call Test
tool](https://tokbox.com/developer/tools/precall/).

## Example Usage in Node/Browserify/Webpack

First, install the package:

```
$ npm install opentok-network-test-js
```

Now load the OpenTok Network Test in your project:

```javascript
const OTNetworkTest = require('opentok-network-test-js');
```

Load the OpenTok.js library.

Instantiate an instance of the test object, passing in the OpenTok.js OT object and
a configuration object. The configuration object contains an API key for your app's
OpenTok project, a session ID for a test session, and a token for that session:

```javascript
const otNetworkConnectivity = new NetworkConnectivity(OT, {
  apiKey: '123456', // Add the API key for your OpenTok project here.
  sessionId: '1_MX40NzIwMzJ-fjE1MDElGQkJJfn4', // Add a test session ID for that project
  token: 'T1==cGFydG5lcXN0PQ==' // Add a token for that session here
});
```

Use the [OpenTok server SDKs](https://tokbox.com/developer/sdks/server/) to generate a
unique session ID for each client. This session ID is used for the network test, and it must
be different than the session ID used for communication in the app. The test session must be
a routed session -- one that uses the [OpenTok Media
Router](https://tokbox.com/developer/guides/create-session/#media-mode). Also generate a test
token that has publish privileges.

Then run the test methods:

```javascript
otNetworkTest.testConnectivity().then((results) => {
  console.log('OpenTok connectivity test results', results);
  otNetworkTest.testQuality(updateCallback(stats) {
    // This function is called repeatedly as the quality test runs.
    // It includes cumulative audio and video statistics for the test.
    const currentStats = stats[stats.length - 1];
    console.log('testQuality stats', currentStats);
  }).then((results) => {
    // This function is called when the quality test is completed.
    console.log('OpenTok quality results', results);
    let publisherSettings = {};
    if (results.video.reason) {
      console.log('Video not supported:', results.video.reason);
      publisherSettings.videoSource = null; // audio-only
    } else {
      publisherSettings.frameRate = results.video.recommendedFrameRate;
      publisherSettings.resolution = results.video.recommendedResolution;
    }
    if (!results.audio.supported) {
      console.log('Audio not supported:', results.audio.reason);
      publisherSettings.audioSource = null;
      // video-only, but you probably don't want this -- notify the user?
    }
    if (!publisherSettings.videoSource && !publisherSettings.audioSource) {
      // Do not publish. Notify the user.
    } else {
      // Publish to the "real" session, using the publisherSettings object.
    }
  }).catch((error) => {
    console.log('OpenTok quality test error', error);
  });
}).catch(function(error) {
  console.log('OpenTok connectivity test error', error);
});
```

This code uses Promises returned by the `OTNetworkTest.testConnectivity()`
and `OTNetworkTest.testQuality()` methods. Alternatively, you can pass completion
handler functions into each of these methods.

See the following section for details on using the test results.

See the /sample subdirectory (and the /sample/README.md file) for a sample app.

## API reference

The OTNetworkTest NPM module includes three public methods:

* The OTNetworkTest() constructor method

* The `OTNetworkTest.testConnectivity()` method

* The `OTNetworkTest.testQuality()` method

### OTNetworkTest() constructor

The `OTNetworkTest()` constructor includes the following parameters (both required):

* `ot` -- A reference to the OpenTok.js `OT` object. You must load OpenTok.js into the
  web page and pass the OpenTok.js `OT` into the `OTNetworkTest()` constructor.

  Note that you may load OpenTok.js from the opentok.com server
  (https://static.opentok.com/v2/js/opentok.js) or via NPM
  (https://www.npmjs.com/package/@opentok/client). Or if your OpenTok project uses the [enterprise
  environment](https://tokbox.com/developer/enterprise/content/enterprise-overview.html),
  you will load OpenTok.js from the enterprise URL.

  Passing the OT object into the `OTNetworkTest()` constructor ensures that the tests will
  use the same version of OpenTok and the same OpenTok environment that will be used by the
  main OpenTok session in your application.

* `sessionInfo` -- An object containing the following:

  * `apiKey` -- The API key corresponding to the OpenTok project the app uses.

  * `sessionId` -- A test session ID. This must be an ID for a different session than
     the one that your application will be used for communication. Generate a unique
     session ID for each client. This session ID is used for the network test, and it
     must be different than the session ID used for communication in the app.
     The test session must be a routed session -- one that uses the [OpenTok Media
     Router](https://tokbox.com/developer/guides/create-session/#media-mode).


     To test connectivity
     in a specific region, specify a location hint when [creating the test
     session](https://tokbox.com/developer/guides/create-session/).

  * `token` -- A token corresponding to the test session. The role of the token must be
    either `publisher` or `moderator`.

### OTNetworkTest.testConnectivity(callback)

This method checks to see if the client can connect to OpenTok servers.
It includes one parameter: `callback`.

The `callback` parameter is the function to be called when the connectivity check completes.
This callback function takes two parameters:

* `error` -- An Error object. The `name` Property of this object is set to `ConnectivityError`.
  The `message` property describes the reason for the error. This will usually result from an
  invalid API key, session ID, or token passed into the `OTNetworkTest()` constructor. This
  is only set when the test could not run because of an error. If the connectivity can run
  (even if it results in failed tests), this property is undefined.

* `results` -- An object that contains the following properties:

  * `success` (Boolean) -- `true` if connectivity to OpenTok servers succeeded; `false` if
    any connectivity test failed.

  * `failedTests` (Array) -- If connectivity failed, this array contains a list of strings
    defining the failure types: `'api'`, `'media'`, `'logging'`.

    * `'api'` -- The test could not connect to the OpenTok API server. Connection to this
      server is required to connect to an OpenTok session.

    * `'media'` -- The test could not connect to the OpenTok media server. If your app uses
      a routed session, it will not succeed in using OpenTok. However, if your app uses
      a relayed session, the client *may* still succeed in using the OpenTok session, although
      it may fail if the relayed session requires use of a TURN server.

    * `'logging'` -- The test could not connect to the OpenTok logging server. The OpenTok.js
      library periodically logs data (such as video and audio quality) to this server. The client
      can still connect to an OpenTok session, however TokBox will not collect data that may help
      you debug issues with the session, using tools like [OpenTok
      Inspector](https://tokbox.com/developer/tools/inspector/).

    If all connectivity tests succeed, this property is undefined.

  `results` is undefined if there was an error in running the tests (and the `error` parameter
  is unset).

The callback function is optional. The `testConnectivity()` method returns a JavaScript promise.
The promise is resolved on success, and the `results` object is passed into the `success`
callback method of the promise's `then()` function, or the `error` object is passed into the
promise's `catch()` function.

### OTNetworkTest.testQuality(options, updateCallback, completionCallback)

This function runs a test publisher (using the API key, session ID and token provided in the constructor). Based on the measured video bitrate, audio bitrate, and the audio packet loss for
the published stream, it provides the following results:

* The MOS estimate (from 0 - 5) for the client participating in an OpenTok session.

* The recommended supported publisher settings. These settings include the recommended video
  frame rate and resolution for a stream published by the client. Or, if the stats do not support
  video, the results indicate whether an audio-only published is recommended or not, based on the
  measured audio bitrate and packet loss.

This method includes two parameters: `updateCallback` and `completionCallback`.

#### updateCallback

The `updateCallback` function is called periodically during the test (at a 1-second test interval).

The object passed into the `updateCallback` function includes statistics about the audio and
video in the test stream. The object has the following data:

  ```
  {
    audio: {
      timestamp: 1509747314,
      bytesReceived: 434349, // The total number of audio bytes received, cumulative
      packetsReceived: 24234,  // The total number of audio packets received, cumulative
      packetsLost: 0   // The total number of audio packets lost, cumulative
    },
    video: {
      timestamp: 1509747314,
      bytesReceived: 434349, // The total number of video bytes received, cumulative
      frameRate: 15,   // The video frame rate
      packetsReceived: 24234,  // The total number of video packets received, cumulative
      packetsLost: 0   // The total number of video packets lost, cumulative
    },
    timestamp: 1512679143897, // The timestamp of the sample
    phase: 'audio-video' // Either 'audio-video' or 'audio-only'
  }
  ```

The `phase` property is set to 'audio-video' during the initial audio-video test. If a
secondary audio-only test is required (because audio quality was not acceptable during the
audio-video test), the property is set to 'audio-only'.

Pass in a `null` value if you do not want to register an `updateCallback` function.

#### completionCallback

The `completionCallback` parameter of the `OTNetworkTest.testQuality()` method is a function that
is invoked when the connectivity check completes. This callback function takes two parameters:

* `error` -- An Error object. The `name` property of this object is set to `testQualityError`.
  The `message` property describes the reason for the error. This may result from an
  invalid API key, session ID, or token passed into the `OTNetworkTest()` constructor. This
  is only set when the test could not run because of an error. If the connectivity can run
  (even if it results in failed tests), this property is undefined.

* `results` -- An object that contains the following properties:

  * `mos` (Number) -- The MOS for the call quality. This will be in a range from 0 to 5.
    Values less than 1 indicate inadequate quality. Values greater than 4 are considered
    excellent quality.

  * `video` (Object) -- Contains the following properties:

      * `supported` (Boolean) -- Whether the results indicate that video is supported.

      * `recommendedFrameRate` (Number) -- The recommended video frame rate. However, if
        video is unsupported, this is set to `null`.

      * `recommendedResolution` (String) -- The recommended video resolution. This will be
        set to `'1280x720'`, `'640x480'`, or `'320x240`. However, if video is unsupported,
        this is set to `null`.

      * `reason` (String) -- A string describing the reason for an unsupported video recommendation.
        For example, `'No microphone was found.'`

      * `bitrate` (Number) -- The average number of video bits per second during the last
        five seconds of the test.

      * `frameRate` (Number) -- The average number of frames per second during the last five seconds
        of the test. Note that this is different than the `recommendedFrameRate`. The `frameRate`
        value is the actual frame rate observed during the test, and the `recommendedFrameRate`
        is the recommended frame rate.

      * `packetLossRatio` (Number) -- The audio packet loss ratio during the last five seconds
        of the test.

  * `audio` (Object) -- Contains the following properties:

    * `supported` (Boolean) -- Whether audio will be supported (`true`) or not (`false`).

    * `reason` (String) -- A string describing the reason for an unsupported audio recommendation.
      For example, `'No microphone was found.'`

    * `bitrate` (Number) -- The average number of audio bits per second during the last five seconds
      of the test.

    * `packetLossRatio` (Number) -- The video packet loss ratio during the last five seconds
      of the test.

  `results` is undefined if there was an error in running the tests (and the `error` parameter
  is unset).

The `completionCallback` function is optional. The `testConnectivity()` method returns a JavaScript
promise. The promise is resolved on success, and the `results` object is passed into the `success`
callback method of the promise's `then()` function, or the `error` object is passed into the
promise's `catch()` function.

The results, including the MOS score and the recommended video resolution and frame rate are
subjective. You can adjust the values used in the source code, or you can use the data passed into
the `updateCallback()` function and apply your own quality analysis algorithm.

## Building the module

To build the module:

```bash
$ npm install
$ npm run build
```

## Sample app

See the /sample subdirectory (and the /sample/README.md file) for a sample app.
