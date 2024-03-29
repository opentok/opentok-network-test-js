import NetworkTest from 'opentok-network-test-js';
import createChart from './chart.js';
import * as ConnectivityUI from './connectivity-ui.js';
import config from './config.js';
let sessionInfo = config;
let otNetworkTest;
let audioOnly;

const precallDiv = document.getElementById('precall');
precallDiv.querySelector('#precall button').addEventListener('click', function () {
    document.getElementById('connectivity_status_container').style.display = 'block';
    precallDiv.style.display = 'none';
    startTest();
});

function startTest() {
    const audioOnly = precallDiv.querySelector('#audioOnlyCheckbox').checked;
    const scalableVideo = precallDiv.querySelector('#scalableCheckbox').checked;
    const fullHd = precallDiv.querySelector('#fullHdCheckbox').checked;
      
    const timeoutSelect = precallDiv.querySelector('select');
    const timeout = timeoutSelect.options[timeoutSelect.selectedIndex].text * 1000;

    const options = {
        audioOnly: audioOnly,
        scalableVideo: scalableVideo,
        fullHd: fullHd,
        timeout: timeout
    };

    otNetworkTest = new NetworkTest(OT, sessionInfo, options);
    otNetworkTest.testConnectivity()
        .then(results => ConnectivityUI.displayTestConnectivityResults(results))
        .then(testQuality);
}

function testQuality() {
    createChart('audio');
    createChart('video');
    ConnectivityUI.init(audioOnly);
    document.getElementById('stop_test').addEventListener('click', function stopTestListener() {
        ConnectivityUI.hideStopButton();
        otNetworkTest.stop();
    });
    otNetworkTest.testQuality(function updateCallback(stats) {
        ConnectivityUI.checkToDisplayStopButton();
        ConnectivityUI.graphIntermediateStats('audio', stats);
        ConnectivityUI.graphIntermediateStats('video', stats);
    }).then(results => ConnectivityUI.displayTestQualityResults(null, results))
        .catch(error => ConnectivityUI.displayTestQualityResults(error));
}
