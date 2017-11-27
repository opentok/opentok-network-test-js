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
  var prevAudioBytesReceived = 0;
  var prevVideoBytesReceived = 0;
  var resultCount = 0;
  document.getElementById('quality_status_container').style.display = 'block';
  otNetworkTest.testQuality(function updateCallback(stats) {
    document.getElementById('graph_container').style.display = 'flex';
    var audioBytesReceived = stats.audio.bytesReceived * 8;
    resultCount ++;
    audioChart.series[0].addPoint({
      x: resultCount,
      y: audioBytesReceived - prevAudioBytesReceived
    }, true, false);
    audioChart.setTitle(null, { text: 'Bitrate over ' + resultCount + 'sec'});
    prevAudioBytesReceived = audioBytesReceived;
    var videoBytesReceived = stats.video.bytesReceived * 8;
    videoChart.series[0].addPoint({
      x: resultCount,
      y: videoBytesReceived - prevVideoBytesReceived
    }, true, false);
    videoChart.setTitle(null, { text: 'Bitrate over ' + resultCount + 'sec'});
    prevVideoBytesReceived = videoBytesReceived;
  }, function resultsCallback(error, results) {
    ConnectivityUI.displayTestQualityResults(error, results);
  });
}
