import NetworkTest, { ErrorNames } from 'opentok-network-test-js';
import createChart from './chart.js';
import * as ConnectivityUI from './connectivity-ui.js';
import config from './config.js';
declare const OT: any;
let sessionInfo = config;
let otNetworkTest : NetworkTest;
let audioOnly;

const precallDiv = document.getElementById('precall');
precallDiv.querySelector('#precall button').addEventListener('click', function () {
    document.getElementById('connectivity_status_container').style.display = 'block';
    precallDiv.style.display = 'none';
    startTest();
});

// Add event listener for retry button
const retryButton = document.getElementById('retry_test');
retryButton.addEventListener('click', function () {
    retryTest();
});

function displayPermissionDeniedError() {
    const statusContainer = document.getElementById('connectivity_status_container');
    const statusEl = statusContainer?.querySelector('p') as HTMLElement;
    const statusIconEl = statusContainer?.querySelector('img') as HTMLImageElement;
    
    if (statusEl && statusIconEl) {
        statusEl.innerHTML = `
            <strong class="permission-denied-error">Camera/Microphone Access Required</strong><br><br>
            <div class="permission-instructions">
                <p><strong>To enable the network test:</strong></p>
                <ol>
                    <li>Click the camera/microphone icon in your browser's address bar</li>
                    <li>Select "Allow" for both camera and microphone access</li>
                    <li>Refresh the page</li>
                </ol>
            </div>
        `;
        statusIconEl.src = 'assets/icon_error.svg';
    }
    ConnectivityUI.showRetryButton();
}

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

    otNetworkTest = new NetworkTest(OT, sessionInfo, options);
    otNetworkTest.testConnectivity()
        .then(results => ConnectivityUI.displayTestConnectivityResults(results))
        .then(testQuality)
        .catch(error => {
            // Handle permission errors - show message and retry button
            if (error.name === ErrorNames.PERMISSION_DENIED_ERROR) {
                displayPermissionDeniedError();
            } else {
                // Handle other errors - show failure message and retry button
                ConnectivityUI.displayTestConnectivityResults({ success: false, failedTests: [] });
                ConnectivityUI.showRetryButton();
            }
            
            console.error('Connectivity test failed:', error);
        });
}

function testQuality() {
    createChart('audio');
    createChart('video');
    ConnectivityUI.init(audioOnly);
    
    // Remove existing event listener if any and add new one
    const stopTestBtn = document.getElementById('stop_test') as HTMLButtonElement;
    const newStopTestBtn = stopTestBtn.cloneNode(true) as HTMLButtonElement;
    stopTestBtn.parentNode?.replaceChild(newStopTestBtn, stopTestBtn);
    
    newStopTestBtn.addEventListener('click', function stopTestListener() {
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

function retryTest() {
    // Reset UI state and clean up
    ConnectivityUI.resetUIForRetry();
    
    // Clean up any existing OpenTok elements
    const otElements = document.querySelectorAll('[id^="OT_"], [class*="OT_"], [data-opentok-publisher]');
    otElements.forEach(element => element.parentNode?.removeChild(element));
    
    // Reset status displays to "in progress" state
    const connectivityContainer = document.getElementById('connectivity_status_container') as HTMLElement;
    const connectivityStatusEl = connectivityContainer.querySelector('p') as HTMLElement;
    const connectivityIconEl = connectivityContainer.querySelector('img') as HTMLImageElement;
    connectivityStatusEl.textContent = 'Test in progress.';
    connectivityIconEl.src = 'assets/spinner.gif';
    connectivityContainer.style.display = 'block';
    
    const qualityContainer = document.getElementById('quality_status_container') as HTMLElement;
    const qualityStatusEl = qualityContainer.querySelector('p') as HTMLElement;
    const qualityIconEl = qualityContainer.querySelector('img') as HTMLImageElement;
    qualityStatusEl.textContent = 'Test in progress.';
    qualityIconEl.src = 'assets/spinner.gif';

    // Start the test again
    startTest();
}
