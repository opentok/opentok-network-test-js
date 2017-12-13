type Browser =
  'chrome' |
  'firefox' |
  'not a browser' |
  'unsupported browser' |
  'webkit browser without WebRTC support' |
  'safari' |
  'edge';

function detectBrowser(): Browser {

  const navigator = window && window.navigator;

  // Fail early if it's not a browser
  if (typeof window === 'undefined' || !window.navigator) {
    return 'not a browser';
  }

  // Firefox.
  if (navigator.mozGetUserMedia) {
    return 'firefox';
  }
  if (navigator.webkitGetUserMedia) {
    // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
    if (window.hasOwnProperty('webkitRTCPeerConnection')) {
      return 'chrome';
    }
    if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
      return 'safari';
    }
    return 'webkit browser without WebRTC support';
  }

  if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) { // Edge.
    return 'edge';
  }

  if (navigator.mediaDevices && navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) {
    // Safari, with webkitGetUserMedia removed.
    return 'safari';
  }
  // Default fallthrough: not supported.
  return 'unsupported browser';
}

export default function isSupportedBrowser(): { supported: boolean, browser: Browser } {
  const supportedBrowsers = ['chrome', 'firefox'];
  const browser = detectBrowser();
  const supported = supportedBrowsers.includes(browser);
  return { browser, supported };
}
