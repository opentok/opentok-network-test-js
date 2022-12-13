import NetworkTest from 'opentok-network-test-js';
import createChart from './chart.js';
import * as ConnectivityUI from './connectivity-ui.js';
import config from './config.js';
let sessionInfo = config;
let otNetworkTest;
let audioOnly;

const precallDiv = document.getElementById('precall');
precallDiv.querySelector('#precall button').addEventListener('click', function () {
    document.getElementById('connectivity_status_container').style.display = 'block';
    precallDiv.style.display = 'none';
    startTest();
});

window.addEventListener('load', function onload() {
  var audioOnly = precallDiv.querySelector('#audioOnlyCheckBox').checked;
  var fhdCheckBox = precallDiv.querySelector('#fhdCheckBox');
  var fhdLabel = document.querySelector('#fhdLabel');
  var timeoutSelect = precallDiv.querySelector('select');
  var timeout = timeoutSelect.options[timeoutSelect.selectedIndex].text * 1000;
  var options = {
      audioOnly: audioOnly,
      timeout: timeout,
      maximumResolution: fhdCheckBox.checked ? '1920x1080' : '1280x720'
  };

  otNetworkTest = new NetworkTest(OT, sessionInfo, options);

  otNetworkTest.checkCameraSupport(1920, 1080)
    .then(() => {
      fhdCheckBox.disabled = false;
      fhdLabel.style.color = '#666';
      fhdLabel.innerText = '1080p'
    }).catch((error) => {
      switch(error.name) {
        case 'PermissionDeniedError':
          fhdLabel.innerText = '1080p support unknown. User denied access to the camera.'
          break;
        case 'UnsupportedResolutionError':
          fhdLabel.innerText = '1080p not supported by camera.'
          break;
        default:
          fhdLabel.innerText = 'Unknown error checking 1080p camera support.'
      }
    });
});

function startTest() {
    otNetworkTest.testConnectivity()
        .then(results => ConnectivityUI.displayTestConnectivityResults(results))
        .then(testQuality);
}

function testQuality() {
    createChart('audio');
    createChart('video');
    ConnectivityUI.init(audioOnly);
    document.getElementById('stop_test').addEventListener('click', function stopTestListener() {
        ConnectivityUI.hideStopButton();
        otNetworkTest.stop();
    });
    otNetworkTest.testQuality(function updateCallback(stats) {
        ConnectivityUI.checkToDisplayStopButton();
        ConnectivityUI.graphIntermediateStats('audio', stats);
        ConnectivityUI.graphIntermediateStats('video', stats);
    }).then(results => ConnectivityUI.displayTestQualityResults(null, results))
        .catch(error => ConnectivityUI.displayTestQualityResults(error));
}
