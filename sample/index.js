/* global require */

import OTNetworkTest from 'opentok-network-test-js';
var OTNetworkTestOptions = require('./config.js');

console.log('sdfsdfsdf', OTNetworkTestOptions)
var otNetworkTest = new OTNetworkTest(OT, OTNetworkTestOptions);

setStatus('Testing connectivity');
otNetworkTest.testConnectivity(function(error, results) {
  console.log('testConnectivity callback error', error);
  console.log('testConnectivity callback results', results);
}).then(function(results) {
  console.log('testConnectivity promise results', results);
  testQuality();
}).catch(function(error) {
  console.log('testConnectivity promise error', error);
});

function testQuality() {
  setStatus('Testing quality.');
  otNetworkTest.testQuality(function updateCallback(stats) {
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
