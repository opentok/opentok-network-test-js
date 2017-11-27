import OTNetworkTest from 'opentok-network-test-js';
import createChart from './chart.js';
import * as ConnectivityUI from './connectivity-ui.js';
import OTNetworkTestOptions from './config.js';
var otNetworkTest = new OTNetworkTest(OT, OTNetworkTestOptions);
document.getElementById('connectivity_status_container').style.display = 'block';
otNetworkTest.testConnectivity(null, function(error, results) {
  ConnectivityUI.displayTestConnectivityResults(error, results);
  testQuality();
});

function testQuality() {
  var audioChart = createChart('audio');
  var videoChart = createChart('video');
  document.getElementById('quality_status_container').style.display = 'block';
  otNetworkTest.testQuality(function updateCallback(stats) {
    ConnectivityUI.graphIntermediateStats('audio', stats.audio);
    ConnectivityUI.graphIntermediateStats('video', stats.video);
  }, function resultsCallback(error, results) {
    ConnectivityUI.displayTestQualityResults(error, results);
  });
}
