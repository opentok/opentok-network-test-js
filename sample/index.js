/* global require */

import NetworkConnectivity from 'opentok-network-test-js';
var OTNetworkTestOptions = require('./config.js');
var statusContainerEl = document.getElementById('status_container');

var otNetworkConnectivity = new NetworkConnectivity(OT, OTNetworkTestOptions);

setStatus('testing connectivity')
otNetworkConnectivity.checkConnectivity(function(error, results) {
  console.log('checkConnectivity callback error', error);
  console.log('checkConnectivity callback results', results);
}).then(function(results) {
  console.log('checkConnectivity promise results', results);
  testQuality();
}).catch(function(error) {
  console.log('checkConnectivity promise error', error);
});

function testQuality() {
  otNetworkConnectivity.testQuality(function statusCallback(status) {
    console.log('testQuality statusCallback', status);
    setStatus(status);
  }, function updateCallback(stats) {
    console.log('testQuality updateCallback', stats);
  }).then(function(results) {
    console.log('testQuality promise results', results);
  }).catch(function(error) {
    console.log('testQuality promise error', error);
  });
}

function setStatus(statusText) {
  var statusMessageEl = statusContainerEl.querySelector('p');

  if (statusMessageEl.textContent) {
    statusMessageEl.textContent = statusText;
  } else if (statusMessageEl.innerText) {
    statusMessageEl.innerText = statusText;
  }
}

/*
otNetworkConnectivity.testQuality(function statusCallback(text, icon) {
  var statusMessageEl = statusContainerEl.querySelector('p');

  if (statusMessageEl.textContent) {
    statusMessageEl.textContent = text;
  } else if (statusMessageEl.innerText) {
    statusMessageEl.innerText = text;
  }

  if (icon) {
    statusContainerEl.querySelector('img').src = 'assets/icon_' + icon + '.svg';
  }
}, function resultsCallback(error, status) {
  if (error) {
    setStatus(error.message, 'error');
    return;
  }
  setStatus(status.text, status.category);
});
*/