import OTNetworkTest from 'opentok-network-test-js';
import createChart from './chart.js';
import OTNetworkTestOptions from './config.js';
var otNetworkTest = new OTNetworkTest(OT, OTNetworkTestOptions);
document.getElementById('connectivity_status_container').style.display = 'block';
otNetworkTest.testConnectivity(null, function(error, results) {
  displayTestConnectivityResults(error, results);
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
    displayTestQualityResults(error, results);
  });
}

function displayTestConnectivityResults(error, results) {
  var statusContainer = document.getElementById('connectivity_status_container');
  var statusMessageEl = statusContainer.querySelector('p');
  var statusIconEl = statusContainer.querySelector('img');
  statusMessageEl.style.display = 'block';
  
  if (error) {
    statusMessageEl.textContent = error.message;
    statusIconEl.src = 'assets/icon_error.svg';
    return;
  }

  var statusText;
  if (results.success) {
    statusText = 'Passed';
    statusIconEl.src = 'assets/icon_pass.svg';
  } else {
    statusText = 'Failed tests: ' + convertFailedTestsToString(results.failedTests);
    statusIconEl.src = 'assets/icon_error.svg';
  }
  statusMessageEl.textContent = statusText;
}

function displayTestQualityResults(error, results) {
  var statusContainerEl = document.getElementById('quality_status_container');
  var statusEl = statusContainerEl.querySelector('p');

  if (error) {
    statusEl.textContent = error.message;
    statusIconEl.src = 'assets/icon_error.svg';
    return;
  }

  statusEl.textContent = 'Test complete. Quality estimate: ' + results.mos.toFixed(2);
  var resultsEl = statusContainerEl.querySelector('.results');
  resultsEl.style.display = 'block';
  resultsEl.querySelector('#audio-supported').textContent = results.audio.supported ? "Yes" : "No";
  resultsEl.querySelector('#audio-bitrate').textContent = (results.audio.bitrate / 1000).toFixed(2);
  resultsEl.querySelector('#audio-plr').textContent = (results.audio.packetLossRatio / 100)
    .toFixed(2);
  resultsEl.querySelector('#video-supported').textContent = results.video.supported ? "Yes" : "No";
  resultsEl.querySelector('#video-bitrate').textContent = (results.video.bitrate / 1000).toFixed(2);
  resultsEl.querySelector('#video-plr').textContent = (results.video.packetLossRatio / 100)
    .toFixed(2);
  resultsEl.querySelector('#video-recommendedResolution').textContent =
    results.video.recommendedResolution
      .substring(0, results.video.recommendedResolution.indexOf('@') - 1);
    resultsEl.querySelector('#video-recommendedFrameRate').textContent =
      results.video.recommendedResolution
        .substring(results.video.recommendedResolution.indexOf('@') + 1);
  var statusIconEl = statusContainerEl.querySelector('img');
  if (results.audio.supported) {
    if (results.video.supported) {
      statusIconEl.src = 'assets/icon_pass.svg';
    } else {
      statusIconEl.src = 'assets/icon_warning.svg';
    }
  } else if (!results.video.supported) {
    statusIconEl.src = 'assets/icon_error.svg';
  }
}

function convertFailedTestsToString(failedTests) {
  var mappedFailures = [];
  if (failedTests.indexOf('api') > -1) {
    mappedFailures.push('OpenTok API server');
  }
  if (failedTests.indexOf('router') > -1) {
    mappedFailures.push('OpenTok Media router');
  }
  if (failedTests.indexOf('logging') > -1) {
    mappedFailures.push('OpenTok logging server');
  }
  return mappedFailures.join(', ');
}
