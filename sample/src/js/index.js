import NetworkTest from 'opentok-network-test-js';
import createChart from './chart.js';
import * as ConnectivityUI from './connectivity-ui.js';
import config from './config.js';
let sessionInfo = config;
let otNetworkTest;
let audioOnly;

const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

if (isSafari) {
  if (config.h264.apiKey) {
    sessionInfo = config.h264;
  }
} 

const precallDiv = document.getElementById('precall');
precallDiv.querySelector('#precall button').addEventListener('click', function() {
  document.getElementById('connectivity_status_container').style.display = 'block';
  precallDiv.style.display = 'none';
  startTest();
})

function startTest() {
  audioOnly = precallDiv.querySelector('#precall input').checked;
  var options = {audioOnly: audioOnly};
  otNetworkTest = new NetworkTest(OT, sessionInfo, options);
  otNetworkTest.testConnectivity()
    .then(results => ConnectivityUI.displayTestConnectivityResults(results))
    .then(testQuality);
}

function testQuality() {
  var audioChart = createChart('audio');
  var videoChart = createChart('video');
  ConnectivityUI.init(audioOnly);
  otNetworkTest.testQuality(function updateCallback(stats) {
    ConnectivityUI.graphIntermediateStats('audio', stats);
    ConnectivityUI.graphIntermediateStats('video', stats);
  }).then(results => ConnectivityUI.displayTestQualityResults(null, results))
    .catch(error => ConnectivityUI.displayTestQualityResults(error));
}
