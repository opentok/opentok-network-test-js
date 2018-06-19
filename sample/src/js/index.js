import OTNetworkTest from 'opentok-network-test-js';
import createChart from './chart.js';
import * as ConnectivityUI from './connectivity-ui.js';
import sessionInfo from './config.js';
var otNetworkTest;

var precallDiv = document.getElementById('precall');
precallDiv.querySelector('#precall button').addEventListener('click', function() {
  document.getElementById('connectivity_status_container').style.display = 'block';
  precallDiv.style.display = 'none';
  startTest();
})

function startTest() {
  var options = {audioOnly: precallDiv.querySelector('#precall input').checked};
  otNetworkTest = new OTNetworkTest(OT, sessionInfo, options);
  otNetworkTest.testConnectivity(function(error, results) {
    ConnectivityUI.displayTestConnectivityResults(error, results);
    testQuality();
  });
}

function testQuality() {
  var audioChart = createChart('audio');
  var videoChart = createChart('video');
  document.getElementById('quality_status_container').style.display = 'block';
  otNetworkTest.testQuality(function updateCallback(stats) {
    ConnectivityUI.graphIntermediateStats('audio', stats);
    ConnectivityUI.graphIntermediateStats('video', stats);
  }, function resultsCallback(error, results) {
    ConnectivityUI.displayTestQualityResults(error, results);
  });
}
