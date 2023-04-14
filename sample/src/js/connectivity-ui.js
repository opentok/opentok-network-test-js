// Utility functions to display test results in the sample app UI
import { createChart } from "./chart.js";
var charts = {};
var audioOnlyTest;
const resultCount = {
  audio: 0,
  video: 0,
};
const prevBitsReceived = {
  audio: 0,
  video: 0,
};
var stopBtnTimeout;
var stopTestBtn = document.getElementById("stop_test");

export function init(audioOnly) {
  audioOnlyTest = audioOnly;
  document.getElementById("quality_status_container").style.display = "block";
  if (audioOnlyTest) {
    document.getElementById("video").style.display = "none";
  }
}

export function checkToDisplayStopButton() {
  if (!stopBtnTimeout) {
    stopBtnTimeout = window.setTimeout(function () {
      stopTestBtn.style.display = "block";
    }, 4000);
  }
}

export function hideStopButton() {
  stopTestBtn.style.display = "none";
}

export function addChart(id, newChart) {
  charts[id] = newChart;
}

export function displayTestConnectivityResults(results) {
  const statusContainer = document.getElementById(
    "connectivity_status_container"
  );
  const statusMessageEl = statusContainer.querySelector("p");
  const statusIconEl = statusContainer.querySelector("img");
  statusMessageEl.style.display = "block";

  let statusText;
  if (results.success) {
    statusText = "Passed";
    statusIconEl.src = "assets/icon_pass.svg";
  } else {
    statusText =
      "Failed tests: " + convertFailedTestsToString(results.failedTests);
    statusIconEl.src = "assets/icon_error.svg";
  }
  statusMessageEl.textContent = statusText;
}

function convertFailedTestsToString(failedTests) {
  const failureTypes = [];
  for (var i = 0; i < failedTests.length; i++) {
    failureTypes.push(failedTests[i].type);
  }
  var mappedFailures = [];
  if (failureTypes.indexOf("api") > -1) {
    mappedFailures.push("OpenTok API server");
  }
  if (failureTypes.indexOf("messaging") > -1) {
    mappedFailures.push("OpenTok messaging WebSocket");
  }
  if (failureTypes.indexOf("media") > -1) {
    mappedFailures.push("OpenTok Media Router");
  }
  if (failureTypes.indexOf("logging") > -1) {
    mappedFailures.push("OpenTok logging server");
  }
  return mappedFailures.join(", ");
}

function rateMosScore(mos) {
  if (mos >= 3.8) {
    return "Excellent";
  }
  if (mos >= 3.1) {
    return "Good";
  }
  if (mos >= 2.4) {
    return "Fair";
  }
  if (mos >= 1.7) {
    return "Poor";
  }
  return "Bad";
}

export function displayTestQualityResults(error, results) {
  hideStopButton();
  const statusContainerEl = document.getElementById("quality_status_container");
  const statusEl = statusContainerEl.querySelector("p");
  const statusIconEl = statusContainerEl.querySelector("img");
  statusContainerEl.querySelector("#audio .results").style.display = "block";
  statusContainerEl.querySelector("#video .results").style.display = "block";

  if (error) {
    statusEl.textContent = error.message;
    statusIconEl.src = "assets/icon_error.svg";
    return;
  }

  statusEl.textContent = "Test complete.";
  let resultsEl = statusContainerEl.querySelector("#audio .results");
  resultsEl.style.display = "block";
  resultsEl.querySelector("#audio-supported").textContent = results.audio
    .supported
    ? "Yes"
    : "No";
  const audioMos = results.audio.mos;
  resultsEl.querySelector("#audio-mos").textContent =
    audioMos.toFixed(2) + " (" + rateMosScore(audioMos) + ")";
  resultsEl.querySelector("#audio-bitrate").textContent = results.audio.bitrate
    ? (results.audio.bitrate / 1000).toFixed(2) + " kbps"
    : "--";
  resultsEl.querySelector("#audio-plr").textContent = results.audio
    .packetLossRatio
    ? (results.audio.packetLossRatio * 100).toFixed(2) + "%"
    : "0.00%";
  resultsEl = statusContainerEl.querySelector("#video .results");
  resultsEl.querySelector("#video-supported").textContent = results.video
    .supported
    ? "Yes"
    : "No";
  const videoMos = results.video.mos;
  resultsEl.querySelector("#video-mos").textContent =
    videoMos.toFixed(2) + " (" + rateMosScore(videoMos) + ")";
  resultsEl.querySelector("#video-bitrate").textContent = results.video.bitrate
    ? (results.video.bitrate / 1000).toFixed(2) + " kbps"
    : "--";
  resultsEl.querySelector("#video-plr").textContent = results.video
    .packetLossRatio
    ? (results.video.packetLossRatio * 100).toFixed(2) + "%"
    : "0.00%";
  resultsEl.querySelector("#video-recommendedResolution").textContent =
    results.video.recommendedResolution || "--";
  resultsEl.querySelector("#video-recommendedFrameRate").textContent = results
    .video.recommendedFrameRate
    ? results.video.recommendedFrameRate + " fps"
    : "--";
  if (results.audio.supported) {
    if (results.video.supported || audioOnlyTest) {
      statusIconEl.src = "assets/icon_pass.svg";
    } else {
      statusIconEl.src = "assets/icon_warning.svg";
      var reasonEl = resultsEl.querySelector("#video-unsupported-reason");
      reasonEl.style.display = "block";
      reasonEl.querySelector("span").textContent = results.video.reason;
    }
  } else if (!results.video.supported) {
    statusIconEl.src = "assets/icon_error.svg";
  }
}

export function graphIntermediateStats(mediaType, stats) {
  const mediaStats = stats[mediaType];
  if (!charts[mediaType]) {
    charts[mediaType] = createChart(mediaType);
  }
  const bitsReceived =
    mediaStats && mediaStats.bytesReceived ? mediaStats.bytesReceived * 8 : 0;
  resultCount[mediaType]++;
  charts[mediaType].series[0].addPoint(
    {
      x: resultCount[mediaType],
      y: bitsReceived - prevBitsReceived[mediaType],
    },
    true,
    false
  );
  const chartTitle =
    stats.phase === "audio-only" && mediaType === "video"
      ? "Testing audio-only stream"
      : "Bitrate over " + resultCount[mediaType] + "sec";
  charts[mediaType].setTitle(null, { text: chartTitle });
  prevBitsReceived[mediaType] = bitsReceived;
}

export function updateStringBooleanTable(stats) {
  const container = document.getElementById("string-boolean-table-container");
  let table = container.querySelector("table");

  if (!table) {
    table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>SSRC</th>
          <th>Quality Limitation Reason</th>
          <th>Resolution</th>
          <th>Active</th>
          <th>Bitrate (Kbs)</th>
          <th>Frame Rate</th>
          <th>Transport Protocol</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `;
    container.appendChild(table);
  }

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  stats.rtcStats.videoStats.forEach((videoStat) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${videoStat.ssrc}</td>
      <td>${videoStat.qualityLimitationReason}</td>
      <td>${videoStat.resolution}</td>
      <td>${videoStat.active}</td>
      <td>${videoStat.kbs}</td>
      <td>${videoStat.framerate}</td>
      <td>${stats.rtcStats.transportProtocol}</td>
    `;
    tbody.appendChild(tr);
  });
}

export function updateRtcAudioStats(stats) {
  const audioStats = stats.rtcStats.audioStats;

  for (let i = 0; i < audioStats.length; i++) {
    const bitrate = audioStats[i].kbs;
    const byteSent = audioStats[i].byteSent;

    const audioBitrateChart = charts["audioBitrateChart"];
    if (!audioBitrateChart.series[i]) {
      audioBitrateChart.addSeries({
        name: `Audio SSRC: ${i}`,
        data: [],
      });
    }
    audioBitrateChart.series[i].addPoint(
      {
        x: resultCount.audio,
        y: bitrate,
      },
      false,
      false
    );

    const audioByteSentChart = charts["audioByteSentChart"];
    if (!audioByteSentChart.series[i]) {
      audioByteSentChart.addSeries({
        name: `Audio SSRC: ${i}`,
        data: [],
      });
    }
    audioByteSentChart.series[i].addPoint(
      {
        x: resultCount.audio,
        y: byteSent,
      },
      false,
      false
    );

    resultCount.audio++;
  }

  // Redraw the charts
  charts["audioBitrateChart"].redraw();
  charts["audioByteSentChart"].redraw();
}

export function updateRtcVideoStats(stats) {
  const rtcStats = stats.rtcStats;
  const videoStats = stats.rtcStats.videoStats;

  const videoAvailableOutgoingBitrateChart =
    charts["availableOutgoingBitrateChart"];
  if (!videoAvailableOutgoingBitrateChart.series[0]) {
    videoAvailableOutgoingBitrateChart.addSeries({
      name: `OutgoingBitrate`,
      data: [],
    });
  }

  videoAvailableOutgoingBitrateChart.series[0].addPoint(
    {
      x: resultCount.video,
      y: rtcStats.availableOutgoingBitrate,
    },
    false,
    false
  );

  const videoStatsChart = charts["videoStats"];

  if (!videoStatsChart.series[0]) {
    videoStatsChart.addSeries({
      name: `Video total kb/s: ${ssrc}`,
      data: [],
    });
  }
  videoStatsChart.series[0].addPoint(
    {
      x: resultCount.video,
      y: rtcStats.videoSentKbs,
    },
    false,
    false
  );

  for (let i = 0; i < videoStats.length; i++) {
    const ssrc = videoStats[i].ssrc;
    const framerate = videoStats[i].framerate;
    const pliCount = videoStats[i].pliCount;
    const nackCount = videoStats[i].nackCount;

    const videoStatsFramerateChart = charts["videoStatsFramerate"];
    if (!videoStatsFramerateChart.series[i]) {
      videoStatsFramerateChart.addSeries({
        name: `Video SSRC: ${ssrc}`,
        data: [],
      });
    }
    videoStatsFramerateChart.series[i].addPoint(
      {
        x: resultCount.video,
        y: framerate,
      },
      false,
      false
    );

    const videoStatsPliCountChart = charts["videoStatsPliCount"];
    if (!videoStatsPliCountChart.series[i]) {
      videoStatsPliCountChart.addSeries({
        name: `Video SSRC: ${ssrc}`,
        data: [],
      });
    }
    videoStatsPliCountChart.series[i].addPoint(
      {
        x: resultCount.video,
        y: pliCount,
      },
      false,
      false
    );

    const videoStatsNackCountChart = charts["videoStatsNackCount"];
    if (!videoStatsNackCountChart.series[i]) {
      videoStatsNackCountChart.addSeries({
        name: `Video SSRC: ${ssrc}`,
        data: [],
      });
    }
    videoStatsNackCountChart.series[i].addPoint(
      {
        x: resultCount.video,
        y: nackCount,
      },
      false,
      false
    );

    resultCount.video++;
  }

  // Redraw the charts
  charts["availableOutgoingBitrateChart"].redraw();
  charts["videoStats"].redraw();
  charts["videoStatsFramerate"].redraw();
  charts["videoStatsPliCount"].redraw();
  charts["videoStatsNackCount"].redraw();
}
