/* global require */

import NetworkConnectivity from 'opentok-network-test-js';
var OTNetworkTestOptions = require('./config.js');

var otNetworkConnectivity = new NetworkConnectivity(OT, OTNetworkTestOptions);

setStatus('Testing connectivity');
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
  setStatus('Testing quality.');
  otNetworkConnectivity.testQuality(function updateCallback(stats) {
    console.log('testQuality updateCallback', stats);
  }).then(function(results) {
    console.log('testQuality promise results', results);
    setStatus('Quality test done.');
  }).catch(function(error) {
    console.log('testQuality promise error', error);
  });
}

function setStatus(statusText) {
  var statusMessageEl = document.getElementById('status_container').querySelector('p');

  if (statusMessageEl.textContent) {
    statusMessageEl.textContent = statusText;
  } else if (statusMessageEl.innerText) {
    statusMessageEl.innerText = statusText;
  }
}
