import NetworkTest from 'opentok-network-test-js';
import { createChart, createRtcStatsChart } from './chart.js';
import * as ConnectivityUI from './connectivity-ui.js';
import config from './config.js';

let sessionInfo = config;
let otNetworkTest;
let audioOnly;

const precallDiv = document.getElementById('precall');
precallDiv.querySelector('#precall button').addEventListener('click', () => {
  document.getElementById('connectivity_status_container').style.display = 'block';
  precallDiv.style.display = 'none';
  startTest();
});

function startTest() {
  audioOnly = precallDiv.querySelector('#precall input').checked;
  const timeoutSelect = precallDiv.querySelector('select');
  const timeout = timeoutSelect.options[timeoutSelect.selectedIndex].text * 1000;
  const options = {
    audioOnly,
    timeout,
  };
    
  otNetworkTest = new NetworkTest(OT, sessionInfo, options);
  otNetworkTest.testConnectivity()
    .then((results) => ConnectivityUI.displayTestConnectivityResults(results))
    .then(testQuality);
}

function testQuality() {
    createChart('audio');
    createChart('video');

    createRtcStatsChartForAudio('audioBitrateChart', 'bitrate', 'Audio bitrate over time');
    createRtcStatsChartForAudio('audioByteSentChart', 'byteSent', 'Audio bytes sent over time');
    createRtcStatsChartForVideo('availableOutgoingBitrateChart', 'availableOutgoingBitrate', 'Available outgoing bitrate over time');
    createRtcStatsChartForVideo('videoStats', 'Total bitrate video kb/s', 'Video kb/s');
    createRtcStatsChartForVideo('videoStatsFramerate', 'framerate', 'Video Framerate');
    createRtcStatsChartForVideo('videoStatsPliCount', 'pliCount', 'Video PLI Count');
    createRtcStatsChartForVideo('videoStatsNackCount', 'nackCount', 'Video NACK Count');

    ConnectivityUI.init(audioOnly);

    document.getElementById('stop_test').addEventListener('click', function stopTestListener() {
        ConnectivityUI.hideStopButton();
        otNetworkTest.stop();
    });

    otNetworkTest.testQuality(function updateCallback(stats) {
        ConnectivityUI.checkToDisplayStopButton();
        ConnectivityUI.graphIntermediateStats('audio', stats);
        ConnectivityUI.graphIntermediateStats('video', stats);
        ConnectivityUI.updateRtcAudioStats(stats);
        ConnectivityUI.updateRtcVideoStats(stats);
        ConnectivityUI.updateStringBooleanTable(stats)
    }).then(results => ConnectivityUI.displayTestQualityResults(null, results))
        .catch(error => ConnectivityUI.displayTestQualityResults(error));
}

function createRtcStatsChartForVideo(id, titleText, yAxisText) {
  ConnectivityUI.addChart(id,
    createRtcStatsChart("video", id, titleText, yAxisText)
  );
}
function createRtcStatsChartForAudio(id, titleText, yAxisText) {
  ConnectivityUI.addChart(id,
    createRtcStatsChart("audio", id, titleText, yAxisText)
  );
}