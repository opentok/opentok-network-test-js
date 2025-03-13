import NetworkTest from '@vonage/video-client-network-test';
import createChart from './chart.js';
import * as ConnectivityUI from './connectivity-ui.js';
import config from './config.js';
declare const OT: any;
let sessionInfo = config;
let videoNetworkTest : NetworkTest;
let audioOnly;

const precallDiv = document.getElementById('precall');
precallDiv.querySelector('#precall button').addEventListener('click', function () {
    document.getElementById('connectivity_status_container').style.display = 'block';
    precallDiv.style.display = 'none';
    startTest();
});

function startTest() {
    const audioOnly = (precallDiv.querySelector('#audioOnlyCheckbox') as HTMLInputElement).checked;
    const scalableVideo = (precallDiv.querySelector('#scalableCheckbox') as HTMLInputElement).checked;
    const fullHd = (precallDiv.querySelector('#fullHdCheckbox') as HTMLInputElement).checked;
      
    const timeoutSelect = precallDiv.querySelector('select');
    const timeout = Number(timeoutSelect.options[timeoutSelect.selectedIndex].text) * 1000;

    const options = {
        audioOnly: audioOnly,
        scalableVideo: scalableVideo,
        fullHd: fullHd,
        timeout: timeout
    };

    videoNetworkTest = new NetworkTest(OT, sessionInfo, options);
    videoNetworkTest.testConnectivity()
        .then(results => ConnectivityUI.displayTestConnectivityResults(results))
        .then(testQuality);
}

function testQuality() {
    createChart('audio');
    createChart('video');
    ConnectivityUI.init(audioOnly);
    document.getElementById('stop_test').addEventListener('click', function stopTestListener() {
        ConnectivityUI.hideStopButton();
        videoNetworkTest.stop();
    });
    videoNetworkTest.testQuality(function updateCallback(stats) {
        ConnectivityUI.checkToDisplayStopButton();
        ConnectivityUI.graphIntermediateStats('audio', stats);
        ConnectivityUI.graphIntermediateStats('video', stats);
    }).then(results => ConnectivityUI.displayTestQualityResults(null, results))
        .catch(error => ConnectivityUI.displayTestQualityResults(error));
}