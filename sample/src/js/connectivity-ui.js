// Utility functions to display test results in the sample app UI
import createChart from './chart.js';
var charts = {};
var resultCount = {
  audio: 0,
  video: 0
};
var prevBitsReceived = {
  audio: 0,
  video: 0
};

function convertFailedTestsToString(failedTests) {
  var failureTypes = [];
  for (var i = 0; i < failedTests.length; i++) {
    failureTypes.push(failedTests[i].type);
  }
  var mappedFailures = [];
  if (failureTypes.indexOf('api') > -1) {
    mappedFailures.push('OpenTok API server');
  }
  if (failureTypes.indexOf('media') > -1) {
    mappedFailures.push('OpenTok Media Router');
  }
  if (failureTypes.indexOf('logging') > -1) {
    mappedFailures.push('OpenTok logging server');
  }
  return mappedFailures.join(', ');
}

export function displayTestConnectivityResults(results) {
  var statusContainer = document.getElementById('connectivity_status_container');
  var statusMessageEl = statusContainer.querySelector('p');
  var statusIconEl = statusContainer.querySelector('img');
  statusMessageEl.style.display = 'block';
  
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

function convertFailedTestsToString(failedTests) {
  var failureTypes = [];
  for (var i = 0; i < failedTests.length; i++) {
    failureTypes.push(failedTests[i].type);
  }
  var mappedFailures = [];
  if (failureTypes.indexOf('api') > -1) {
    mappedFailures.push('OpenTok API server');
  }
  if (failureTypes.indexOf('messaging') > -1) {
    mappedFailures.push('OpenTok messaging WebSocket');
  }
  if (failureTypes.indexOf('media') > -1) {
    mappedFailures.push('OpenTok Media Router');
  }
  if (failureTypes.indexOf('logging') > -1) {
    mappedFailures.push('OpenTok logging server');
  }
  return mappedFailures.join(', ');
}

function rateMosScore(mos) {
  if (mos >= 3.8) {
    return 'Excellent';
  }
  if (mos >= 3.1) {
    return 'Good';
  }
  if (mos >= 2.4) {
    return 'Fair';
  }
  if (mos >= 1.7) {
    return 'Poor';
  }
  return 'Bad';
}

export function displayTestQualityResults(error, results) {
  var statusContainerEl = document.getElementById('quality_status_container');
  var statusEl = statusContainerEl.querySelector('p');
  var statusIconEl = statusContainerEl.querySelector('img');
  statusContainerEl.querySelector('#audio .results').style.display = 'block';
  statusContainerEl.querySelector('#video .results').style.display = 'block';

  if (error) {
    statusEl.textContent = error.message;
    statusIconEl.src = 'assets/icon_error.svg';
    return;
  }

  statusEl.textContent = 'Test complete.';
  var resultsEl = statusContainerEl.querySelector('#audio .results');
  resultsEl.style.display = 'block';
  resultsEl.querySelector('#audio-supported').textContent = results.audio.supported ? 'Yes' : 'No';
  var audioMos = results.audio.mos;
  resultsEl.querySelector('#audio-mos').textContent = audioMos.toFixed(2)
    + ' (' + rateMosScore(audioMos) + ')';
  resultsEl.querySelector('#audio-bitrate').textContent = results.audio.bitrate ?
    (results.audio.bitrate / 1000).toFixed(2) + ' kbps' : '--';
  resultsEl.querySelector('#audio-plr').textContent = results.audio.supported ?
    (results.audio.packetLossRatio / 100).toFixed(2) + '%' : '--';
  resultsEl = statusContainerEl.querySelector('#video .results');
  resultsEl.querySelector('#video-supported').textContent = results.video.supported ? 'Yes' : 'No';
  var videoMos = results.video.mos;
  resultsEl.querySelector('#video-mos').textContent = videoMos.toFixed(2)
    + ' (' + rateMosScore(videoMos) + ')';
  resultsEl.querySelector('#video-bitrate').textContent = results.video.bitrate ?
    (results.video.bitrate / 1000).toFixed(2) + ' kbps' : '--';
  resultsEl.querySelector('#video-plr').textContent = results.video.supported ?
    (results.video.packetLossRatio / 100).toFixed(2) + '%' : '--';
  resultsEl.querySelector('#video-recommendedResolution').textContent =
    results.video.recommendedResolution || '--';
  resultsEl.querySelector('#video-recommendedFrameRate').textContent =
    results.video.recommendedFrameRate ? results.video.recommendedFrameRate + ' fps' : '--';
  if (results.audio.supported) {
    if (results.video.supported) {
      statusIconEl.src = 'assets/icon_pass.svg';
    } else {
      statusIconEl.src = 'assets/icon_warning.svg';
      var reasonEl = resultsEl.querySelector('#video-unsupported-reason');
      reasonEl.style.display = 'block';
      reasonEl.querySelector('span').textContent = results.video.reason;
    }
  } else if (!results.video.supported) {
    statusIconEl.src = 'assets/icon_error.svg';
  }
}

export function graphIntermediateStats(mediaType, stats) {
  var mediaStats = stats[mediaType];
  if (!charts[mediaType]) {
    charts[mediaType] = createChart(mediaType);
  }
  var bitsReceived = mediaStats && mediaStats.bytesReceived ? mediaStats.bytesReceived * 8 : 0;
  resultCount[mediaType]++;
  charts[mediaType].series[0].addPoint({
    x: resultCount[mediaType],
    y: bitsReceived - prevBitsReceived[mediaType]
  }, true, false);
  var chartTitle = (stats.phase === 'audio-only') && (mediaType === 'video') ?
   'Testing audio-only stream' :
   'Bitrate over ' + resultCount[mediaType] + 'sec';
  charts[mediaType].setTitle(null, { text: chartTitle});
  prevBitsReceived[mediaType] = bitsReceived;
}
