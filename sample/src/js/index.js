import NetworkTest from 'opentok-network-test-js';
import createChart from './chart.js';
import * as ConnectivityUI from './connectivity-ui.js';
import sessionInfo from './config.js';
var otNetworkTest;
var audioOnly;

var precallDiv = document.getElementById('precall');
precallDiv.querySelector('#precall button').addEventListener('click', function() {
  document.getElementById('connectivity_status_container').style.display = 'block';
  precallDiv.style.display = 'none';
  startTest();
})

function startTest() {
  audioOnly = precallDiv.querySelector('#precall input').checked;
  var options = {audioOnly: audioOnly};
  otNetworkTest = new NetworkTest(OT, sessionInfo, options);
  otNetworkTest.testConnectivity(function(results) {
    ConnectivityUI.displayTestConnectivityResults(results);
    testQuality();
  });
}

function testQuality() {
  var audioChart = createChart('audio');
  var videoChart = createChart('video');
  ConnectivityUI.init(audioOnly);
  otNetworkTest.testQuality(function updateCallback(stats) {
    ConnectivityUI.graphIntermediateStats('audio', stats);
    ConnectivityUI.graphIntermediateStats('video', stats);
  }, function resultsCallback(error, results) {
    ConnectivityUI.displayTestQualityResults(error, results);
  });
}
