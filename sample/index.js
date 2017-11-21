/* global require */

import OTNetworkTest from 'opentok-network-test-js';
var OTNetworkTestOptions = require('./config.js');
var otNetworkTest = new OTNetworkTest(OT, OTNetworkTestOptions);

showTestStatusElement('connectivity');
otNetworkTest.testConnectivity(function(error, results) {
  console.log('testConnectivity callback error', error);
  console.log('testConnectivity callback results', results);
}).then(function(results) {
  console.log('testConnectivity promise results', results);
  displayConnectivityStatusResults(results.success, results.statusText);
  testQuality();
}).catch(function(error) {
  console.log('testConnectivity promise error', error);
});

function testQuality() {
  showTestStatusElement('quality');
  otNetworkTest.testQuality(function updateCallback(stats) {
    console.log('testQuality updateCallback', stats);
  }).then(function(results) {
    console.log('testQuality promise results', results);
    showTestStatusElement('Quality test done.');
  }).catch(function(error) {
    console.log('testQuality promise error', error);
  });
}

function showTestStatusElement(testName) {
  var statusContainer = document.getElementById(testName + '_status_container');
  statusContainer.style.display = 'block';
  var statusMessageEl = statusContainer.querySelector('p');
}

function displayConnectivityStatusResults(success, failedTests) {
  var statusContainer = document.getElementById('connectivity_status_container');
  var statusMessageEl = statusContainer.querySelector('p');
  var statusIconEl = statusContainer.querySelector('img');
  statusMessageEl.style.display = 'block';
  
  var statusText;
  success = false;
  failedTests = ['foo', 'bar']
  if (success) {
    statusText = 'Passed';
    statusIconEl.src = 'assets/icon_pass.svg';
  } else {
    statusText = 'Failed tests: ' + failedTests.join(', ');
    statusIconEl.src = 'assets/icon_error.svg';
  }
  if (statusMessageEl.textContent) {
    statusMessageEl.textContent = statusText;
  } else if (statusMessageEl.innerText) {
    statusMessageEl.innerText = statusText;
  }
}
