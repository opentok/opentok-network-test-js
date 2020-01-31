import { get } from '../../util';

export type Browser =
  'Chrome' |
  'Firefox' |
  'not a browser' |
  'unsupported browser' |
  'WebKit browser without WebRTC support' |
  'Safari' |
  'Internet Explorer' |
  'Edge' |
  'non-Chromium Edge' |
  'Opera';

function detectBrowser(): Browser {

  const navigator = window && window.navigator;

  // Fail early if it's not a browser
  if (typeof window === 'undefined' || !window.navigator) {
    return 'not a browser';
  }

  // Firefox.
  if (get('mozGetUserMedia', navigator)) {
    return 'Firefox';
  }
  if (get('webkitGetUserMedia', navigator)) {
    // Chrome, Chromium, Webview, Opera, and Edge 79+ all use the chrome shim
    if (window.hasOwnProperty('webkitRTCPeerConnection')) {
      if (navigator.userAgent.match(/Edg/)) {
        return 'Edge';
      }
      if (navigator.userAgent.match(/Opera|OPR\//)) {
        return 'Opera';
      }
      return 'Chrome';
    }
    if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
      return 'Safari';
    }
    return 'WebKit browser without WebRTC support';
  }

  if (navigator.mediaDevices && navigator.userAgent.match(/edge\/(\d+).(\d+)$/)) { // Edge.
    return 'non-Chromium Edge';
  }

  if (navigator.userAgent.indexOf('MSIE ') > 0 ||
    !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
    return 'Internet Explorer';
  }

  if (navigator.mediaDevices && navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) {
    // Safari, with webkitGetUserMedia removed.
    return 'Safari';
  }
  // Default fallthrough: not supported.
  return 'unsupported browser';
}

export default function isSupportedBrowser(): { supported: boolean, browser: Browser } {
  const supportedBrowsers = ['Chrome', 'Firefox', 'Internet Explorer', 'Safari', 'Edge'];
  const browser = detectBrowser();
  const supported = supportedBrowsers.indexOf(browser) > -1;
  return { browser, supported };
}
