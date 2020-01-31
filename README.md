
![logo](https://raw.githubusercontent.com/opentok/opentok-network-test-js/master/media/tokbox-logo.png)

# OpenTok Network Test

[![Build Status](https://goo.gl/17JDLY)](https://travis-ci.com/opentok/opentok-network-test-js)
[![license](https://img.shields.io/github/license/opentok/opentok-network-test-js.svg)](https://github.com/opentok/opentok-network-test-js/blob/master/CONTRIBUTING.md)
[![npm](https://img.shields.io/npm/v/opentok-network-test-js.svg)](https://www.npmjs.com/package/opentok-network-test-js)

This Node module lets you check network connectivity to resources and services required
to use [OpenTok](https://tokbox.com). Run this on a web client to get the following information:

* Whether the client will be able to succeed in connecting to an OpenTok session

* [MOS estimates](https://en.wikipedia.org/wiki/Mean_opinion_score) for the audio and video quality
  the client will experience

* A recommended frame rate and resolution to use for publishing to a session

For a sample that uses this module, see the [OpenTok Pre-call Test
tool](https://tokbox.com/developer/tools/precall/).

## Example Usage in Node/Browserify/Webpack

First, install the package:

```
$ npm install opentok-network-test-js
```

Now load the OpenTok Network Test in your project. The module exports two objects:

* NetworkTest -- The class containing methods for testing your OpenTok connectivity and quality.
  This is the default export.

* ErrorNames -- An object enumerating error name values

Using CommonJS:

```javascript
const NetworkTest = require('opentok-network-test-js').default;
const ErrorNames = require('opentok-network-test-js').ErrorNames;
```

... or ES6 ...

```javascript
import NetworkTest, { ErrorNames } from 'opentok-network-test-js';
```

Load the OpenTok.js library.

Instantiate an instance of the test object, passing in the OpenTok.js OT object and
a configuration object. The configuration object contains an API key for your app's
OpenTok project, a session ID for a test session, and a token for that session:

```javascript
const otNetworkTest = new NetworkTest(OT, {
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
  otNetworkTest.testQuality(function updateCallback(stats) {
    console.log('intermediate testQuality stats', stats);
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

You can also run the tests in audio-only mode by passing in an `options` object
with `audioOnly` set to `true` into the constructor:

```javascript
const sessionInfo = {
  apiKey: '123456', // Add the API key for your OpenTok project here.
  sessionId: '1_MX40NzIwMzJ-fjE1MDElGQkJJfn4', // Add a test session ID for that project
  token: 'T1==cGFydG5lcXN0PQ==' // Add a token for that session here
}
const options = {audioOnly: true};
const otNetworkTest = new NetworkTest(OT, sessionInfo, options);

otNetworkTest.testQuality(function updateCallback(stats) {
  const currentStats = stats[stats.length - 1];
  console.log('testQuality stats', currentStats);
}).then((results) => {
  console.log('OpenTok quality results', results);
}).catch((error) => {
  console.log('OpenTok quality test error', error);
});
```

This code uses Promises returned by the `OTNetworkTest.testConnectivity()`
and `OTNetworkTest.testQuality()` methods. Alternatively, you can pass completion
handler functions into each of these methods.

See the following section for details on using the test results.

See the /sample subdirectory (and the /sample/README.md file) for a sample app.

## Supported browsers

The `OTNetworkTest.testConnectivity()` method is supported in Chrome, Firefox, Safari,
Internet Explorer, Opera, and Edge.

The `OTNetworkTest.testQuality()` method is supported in Chrome, Firefox, Safari,
Opera, Chromium-based versions of Edge (versions 79+), and Internet Explorer.
It is not supported in non-Chromium-based versions of Edge.

## API reference

The OTNetworkTest NPM module includes three public methods:

* The OTNetworkTest() constructor method

* The `OTNetworkTest.testConnectivity()` method

* The `OTNetworkTest.testQuality()` method

*Note:* Some API changes were introduced in v2. See the
[releases page][releases-page] for details.

### OTNetworkTest() constructor

The `OTNetworkTest()` constructor includes the following parameters:

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

    The `sessionInfo` parameter is required.

* `options` --The `options` parameter is an object containing the following properties,
  both of which are optional:

   * `audioOnly` (Boolean) -- Set this property to `true` to run audio-only tests.

    When this option is set to `false` (the default), the quality test will try to run
    an audio-video quality test (using both the camera and microphone). If there is no
    camera available, or if the results of the audio-video test do not support adequate
    audio quality, the test continues in audio-only mode.

    Setting the `audioOnly` to `true` will reduce the time of the quality test on systems that
    have both a microphone and camera attached (since the audio-only test is shorter than the audio-video test).

  * `timeout` (Number) -- Set this property to the maximum duration of the `testQuality()`
    test, in milliseconds. Set this to a value greater than 5000 (5 seconds) but less than
    30000 (30 seconds). (Values outside of this range are ignored.) If you do not set this value,
    the `testQuality()` test will run for approximately 30 seconds for an audio-video test or for 10 seconds for an audio-only test.

    The timeout period begins when the quality test starts publishing (after the user grants
    access to the camera and microphone).

    Setting a lower timeout duration may result in less accurate results, including MOS ratings.

  The `options` parameter is optional.

The constructor throws an Error object with a `message` property and a `name` property. The
message property describes the error. You should check the `name` property to determine the
type of error. The `name` property will be set to one of the values defined as properties of
the `ErrorNames` object (see [ErrorNames](#errornames)). For example:

```javascript
try {
  const otNetworkTest = new NetworkTest(OT, sessionInfo);
} catch (error) {
  switch (error.name) {
    case ErrorNames.MISSING_OPENTOK_INSTANCE:
      console.error('Missing OT instance in constructor.');
      break;
    case ErrorNames.INCOMPLETE_SESSON_CREDENTIALS:
    case ErrorNames.MISSING_SESSON_CREDENTIALS:
    case ErrorNames.INVALID_SESSON_CREDENTIALS:
      console.error('Missing or invalid OpenTok session credentials.');
      break;
    default:
      console.error('Unknown error .');
  }
}
```

### OTNetworkTest.testConnectivity()

This method checks to see if the client can connect to OpenTok servers. The method returns
a Promise that is resolved when the connectivity check completes. The promise is resolved
with a `results` object that has the following two properties:

* `success` (Boolean) -- `true` if connectivity to OpenTok servers succeeded; `false` if
  any connectivity test failed.

* `failedTests` (Array) -- If connectivity failed, this array contains an object for each
  failure type. The object has two properties, `type` and `errors`:

  * `type` -- A sting defining the failure type. It will be set to one of the following values:

    * `'api'` -- The test could not connect to the OpenTok API server. Connection to this
    server is required to connect to an OpenTok session.

    * `'messaging'` -- The test could not establish a connection to the OpenTok messaging WebSocket.
    This connection is required to connect to an OpenTok session. In addition to other causes
    for WebSocket connectivity failures, this failure type will occur if you pass an invalid
    OpenTok API key, session ID, or token into the `OTNetworkTest()` constructor.

    * `'media'` -- The test could not connect to the OpenTok Media Router. If your app uses
    a routed session, it will not succeed in using OpenTok. However, if your app uses
    a relayed session, the client *may* still succeed in using the OpenTok session, although
    it may fail if the relayed session requires use of a TURN server.

    * `'logging'` -- The test could not connect to the OpenTok logging server. The OpenTok.js
    library periodically logs data (such as video and audio quality) to this server. The client
    can still connect to an OpenTok session, however TokBox will not collect data that may help
    you debug issues with the session, using tools like [OpenTok
    Inspector](https://tokbox.com/developer/tools/inspector/).

  * `error` -- An object defining the reason for the type of failure. This object includes
  a `message` property and a `name` property. The message property describes the error.
  You should check the `name` property to determine the type of error. The `name` property
  will be set to one of the values defined as properties of the `ErrorNames`
  object (see [ErrorNames](#errornames)):

    For example:

    ```javascript
    otNetworkTest.testConnectivity(function(results) {
      results.failedTests && results.failedTests.forEach(result) => {
        switch (failedTest.error.name) {
          case ErrorNames.FAILED_TO_OBTAIN_MEDIA_DEVICES:
          // Display UI message about granting access to the microphone and camera
            break;
          case ErrorNames.NO_AUDIO_CAPTURE_DEVICES:
          case ErrorNames.NO_VIDEO_CAPTURE_DEVICES:
            // Display UI message about no available camera or microphone
            break;
          // Handle other errors, as needed
          default:
            console.error('Unknown error .');
        }
      }
    });
    ```

  If all connectivity tests succeed, the `failedTests` property is undefined.

### OTNetworkTest.testQuality(updateCallback)

This function runs a test publisher (using the API key, session ID and token provided in the constructor). Based on the measured video bitrate, audio bitrate, and the audio packet loss for
the published stream, it provides the following results:

* Whether audio and video are supported and a reason why they aren't supported (if they aren't).

* The MOS estimate (from 0 - 5) for the the audio and video published by the client.

* Statistics for the test, including bitrate and packet loss ratio (for both audio and video),
  as well as the video packet loss ratio.

* The recommended supported publisher settings. These settings include the recommended video
  frame rate and resolution for a stream published by the client. Or, if the stats do not support
  video, the results indicate whether an audio-only published is recommended or not, based on the
  measured audio bitrate and packet loss.

This method takes one parameter: `updateCallback`. The method returns a Promise.

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

#### Promise returned

The Promise returned by the `OTNetworkTest.testQuality()` method is resolved when
the connectivity check completes. The promise is resolved with a `results` object that has the
following properties:

* `video` (Object) -- Contains the following properties:

    * `supported` (Boolean) -- Whether the results indicate that video is supported.

    * `recommendedFrameRate` (Number) -- The recommended video frame rate. However, if
      video is unsupported, this is set to `null`. If the the test ran in audio-only mode
      (for example, because no camera was found), this property is undefined.

    * `recommendedResolution` (String) -- The recommended video resolution. This will be
      set to `'1280x720'`, `'640x480'`, or `'320x240'`. However, if video is unsupported,
      this is set to `null`. If the the test ran in audio-only mode (for example, because
      no camera was found), this property is undefined.

    * `reason` (String) -- A string describing the reason for an unsupported video recommendation.
      For example, `'No camera was found.'`

    * `bitrate` (Number) -- The average number of video bits per second during the last
      five seconds of the test. If the the test ran in audio-only mode (for example, because
      no camera was found), this property is undefined.

    * `frameRate` (Number) -- The average number of frames per second during the last five seconds
      of the test. Note that this is different than the `recommendedFrameRate`. The `frameRate`
      value is the actual frame rate observed during the test, and the `recommendedFrameRate`
      is the recommended frame rate. If the the test ran in audio-only mode (for example,
      because no camera was found), this property is undefined.

    * `packetLossRatio` (Number) -- The audio packet loss ratio during the last five seconds
      of the test. If the the test ran in audio-only mode (for example, because no camera was
      found), this property is undefined.

    * `mos` (Number) -- The MOS estimate for the test video quality. This will be in a range from
      1 to 4.5. See [MOS estimates](#mos-estimates) below for more information.

* `audio` (Object) -- Contains the following properties:

  * `supported` (Boolean) -- Whether audio will be supported (`true`) or not (`false`).

  * `reason` (String) -- A string describing the reason for an unsupported audio recommendation.
    For example, `'No microphone was found.'`

  * `bitrate` (Number) -- The average number of audio bits per second during the last five seconds
    of the test.

  * `packetLossRatio` (Number) -- The video packet loss ratio during the last five seconds
    of the test.

  * `mos` (Number) -- The MOS estimate for the test audio quality. This will be in a range from
    1 to 4.5. See [MOS estimates](#mos-estimates) below for more information.

`results` is undefined if there was an error in running the tests (and the `error` parameter
is unset).

*Important:* v1 included a `results.mos` property (an overall MOS rating for the test). This
was removed in v2 and replaced with `results.audio.mos` and `results.video.mos` properties.

The results, including the MOS estimates and the recommended video resolution and frame rate are
subjective. You can adjust the values used in the source code, or you can use the data passed into
the `updateCallback()` function and apply your own quality analysis algorithm.

The Promise returned by the `OTNetworkTest.testQuality()` method is rejected when the connectivity
check encounters an error. The promise is reject with an `error` object that has two properties:
a `message` property and a `name` property. The message property describes the error.
You should check the `name` property to determine the type of error. The `name` property
will be set to one of the values defined as properties of the `ErrorNames` object
(see [Error.name values](#errorname-values)).

```javascript
otNetworkTest.testQuality(null, function updateCallback() {
  // process intermediate results
}).then((results) => {
  // Display UI based on results
}).catch((error) => {
    switch (error.name) {
      case ErrorNames.UNSUPPORTED_BROWSER:
        // Display UI message about unsupported browser
        break;
      case ErrorNames.CONNECT_TO_SESSION_NETWORK_ERROR:
        // Display UI message about network error
        break;
      case ErrorNames.FAILED_TO_OBTAIN_MEDIA_DEVICES:
        // Display UI message about granting access to the microphone and camera
        break;
      case ErrorNames.NO_AUDIO_CAPTURE_DEVICES:
      case ErrorNames.NO_VIDEO_CAPTURE_DEVICES:
        // Display UI message about no available camera or microphone
        break;
      default:
        console.error('Unknown error .');
    }
});
```

### OTNetworkTest.stop()

Stops the `testConnectivity()` test if it is running. The test will not stop until it has been
running for at least 5 seconds (after the user has granted access to the camera and microphone).
While you can call `stop()` prior to this, results will not be returned until the 5-second mark.

### ErrorNames

The ErrorNames object includes properties that enumerate values used in the
`name` property of OTNetworkTest error objects. You should check the `name` property of
an error object (against the values defined in ErrorNames) to determine the type of error.

#### Errors thrown by the OTNetworkTest() constructor

| Error.name property set<br/>to this property of<br/>ErrorNames ... | Description |
| ------------------------------------------------------------------ | ----------- |
|   `MISSING_OPENTOK_INSTANCE` | An instance of OT, the OpenTok.js client SDK, was not passed into the constructor. |
|   `INCOMPLETE_SESSON_CREDENTIALS` | The sessionInfo object passed into the constructor did not include an `apiKey`, `sessionId`,  or `token` object. |
|   `MISSING_SESSON_CREDENTIALS` | No sessionInfo object was passed into the constructor. | 

#### testConnectivity() errors

The `testConnectivity()` returns a JavaScript promise that succeeds with a `results` object.
The `results` object contains a `failedTests` array, and each element of this array (if there are
any elements) has an `error` property, which is error object has a `name` property set to one of
the following:

| Error.name property set to this property<br/>of ErrorNames ... | Description |
| -------------------------------------------------------------- | ----------- |
|   `API_CONNECTIVITY_ERROR` | The test failed to connect to OpenTOK API Server. | 
|   `CONNECT_TO_SESSION_ERROR` | The test failed to connect to the test OpenTok session due to a network error. | 
|   `CONNECT_TO_SESSION_TOKEN_ERROR` | The test failed to connect to the test OpenTok session due to an invalid token. | 
|   `CONNECT_TO_SESSION_ID_ERROR` | The test failed to connect to the test OpenTok session due to an invalid session ID. | 
|   `CONNECT_TO_SESSION_NETWORK_ERROR` | The test failed to connect to the test OpenTok session due to a network error. | 
|   `FAILED_TO_OBTAIN_MEDIA_DEVICES` | The test failed to obtain media devices (a camera or microphone). | 
|   `NO_AUDIO_CAPTURE_DEVICES` | The browser cannot access a microphone. | 
|   `NO_VIDEO_CAPTURE_DEVICES` | The browser cannot access a camera. | 
|   `PUBLISH_TO_SESSION_ERROR` | Encountered an unknown error while attempting to publish to a session. | 
|   `FAILED_MESSAGING_SERVER_TEST` | The test failed to connect to media server due to messaging server connection failure. | 
|   `FAILED_TO_CREATE_LOCAL_PUBLISHER` | The test failed to create a local publisher object. | 
|   `PUBLISH_TO_SESSION_NOT_CONNECTED` | The test failed to publish to the test session because the client was not connected to the session. | 
|   `PUBLISH_TO_SESSION_PERMISSION_OR_TIMEOUT_ERROR` | The test failed to publish to the test session due a permissions error or timeout. | 
|   `PUBLISH_TO_SESSION_NETWORK_ERROR` | The test failed to publish to the test session due a network error. | 
|   `SUBSCRIBE_TO_SESSION_ERROR` | The test encountered an unknown error while attempting to subscribe to a test stream. | 
|   `LOGGING_SERVER_CONNECTION_ERROR` | The test failed to connect to the OpenTok logging server. | 

#### testQuality() errors

If the promised returned by the `testQuality()` is rejected, the error passed into the `.catch()`
method has a `name` property set to one of the following:

| Error.name property set to this<br/>property of ErrorNames ... | Description |
| -------------------------------------------------------------- | ----------- |
|   `INVALID_ON_UPDATE_CALLBACK` | The `updateCallback` parameter is invalid. It must be a function that accepts a single parameter. |
|   `UNSUPPORTED_BROWSER`  | The test is running on an unsupported browser (see [Supported browsers](#supported-browsers)). | 
|   `CONNECT_TO_SESSION_ERROR` | The test failed to connect to the test OpenTok session due to a network error. | 
|   `CONNECT_TO_SESSION_TOKEN_ERROR` | The test failed to connect to the test OpenTok session due to an invalid token. | 
|   `CONNECT_TO_SESSION_ID_ERROR` | The test failed to connect to the test OpenTok session due to an invalid session ID. | 
|   `CONNECT_TO_SESSION_NETWORK_ERROR` | The test failed to connect to the test OpenTok session due to a network error. | 
|   `FAILED_TO_OBTAIN_MEDIA_DEVICES` | The test failed to obtain media devices (a camera or microphone). | 
|   `NO_AUDIO_CAPTURE_DEVICES` | The browser cannot access a microphone. | 
|   `NO_VIDEO_CAPTURE_DEVICES` | The browser cannot access a camera. | 
|   `PUBLISH_TO_SESSION_ERROR` | The test encountered an unknown error while attempting to publish to a session. | 
|   `INIT_PUBLISHER_ERROR` | The test failed to initialize a publisher. | 
|   `PUBLISH_TO_SESSION_NOT_CONNECTED` | The test failed to publish to the test session because the client was not connected to the session. | 
|   `PUBLISH_TO_SESSION_PERMISSION_OR_TIMEOUT_ERROR` | The test failed to publish to the test session due a permissions error or timeout. | 
|   `SUBSCRIBE_TO_SESSION_ERROR` | The test encountered an unknown error while attempting to subscribe to a test stream. | 
|   `SUBSCRIBER_GET_STATS_ERROR` | The test failed to get audio and video statistics for the test stream. | 

## MOS estimates

The `testQuality()` results include MOS estimates for video (if supported) and audio (if supported).

A MOS estimate is a rating of audio or video quality. In subjective scoring, a user is asked
to rate quality from 1 (bad) to 5 (excellent). This module uses an objective test, calculating
the MOS value based on bitrate, packet loss ratio, and (for video) resolution. For example,
the audio MOS calculation is based on the [ITU G.107 specification][itu-g107]. These algorithms
limit the range of scores from 1.0 to 4.5.

| MOS value  | Meaning   |
| ---------- | --------- |
| 3.8 - 4.5  | Excellent |
| 3.1 - 3.79 | Good      |
| 2.4 - 3.09 | Fair      |
| 1.7 - 2.39 | Poor      |
| 1.0 - 1.69 | Bad       |

## Building the module

To build the module:

```bash
$ npm install
$ npm run build
```

## Sample app

See the /sample subdirectory (and the /sample/README.md file) for a sample app.


[itu-g107]: https://www.itu.int/rec/dologin_pub.asp?lang=s&id=T-REC-G.107-201402-S!!PDF-E

[releases-page]: https://github.com/opentok/opentok-network-test-js/releases
