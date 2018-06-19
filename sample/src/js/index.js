import NetworkTest from 'opentok-network-test-js';
import createChart from './chart.js';
import * as ConnectivityUI from './connectivity-ui.js';
import otNetworkTestOptions from './config.js';
var otNetworkTest = new NetworkTest(OT, otNetworkTestOptions);
document.getElementById('connectivity_status_container').style.display = 'block';
otNetworkTest.testConnectivity(function(results) {
  ConnectivityUI.displayTestConnectivityResults(results);
  testQuality();
});

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
