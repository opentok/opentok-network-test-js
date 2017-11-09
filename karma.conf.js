module.exports = function (config) {
  let sauceLaunchers = {
    ie: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: process.env.BVER === '10' ? 'Windows 8' : 'Windows 8.1',
      version: process.env.BVER,
      prerun: {
        executable: 'http://localhost:5000/plugin-installer/SauceLabsInstaller.exe',
        background: false,
        timeout: 120,
      }
    },
    chrome: {
      base: 'Chrome',
      flags: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
    },
    firefox: {
      base: 'Firefox',
      prefs: {
        'media.navigator.permission.disabled': true,
        'media.navigator.streams.fake': true,
        'app.update.enabled': false,
      }
    }
  };
  let browser;
  if (process.env.BROWSER === 'safari') {
    browser = process.env.BVER === 'unstable' ? 'SafariTechPreview' : 'Safari'
  } else {
    browser = process.env.BROWSER || 'chrome';
  }
  config.set({
    hostname: '127.0.0.1',
    basePath: '../',

    files: [
      'test/*.spec.ts',
      'src/**/*.ts'
    ],

    autoWatch: true,

    frameworks: ["jasmine"],

    customLaunchers: sauceLaunchers,

    colors: true,

    browsers: [browser],

    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-safaritechpreview-launcher',
      'karma-sauce-launcher'
    ],

    preprocessors: {
      'test/*.spec.ts': ['webpack'],
      'src/**/*.ts': ['webpack'],
    },

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },

    sauceLabs: {
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },

    reporters: ['progress', 'saucelabs']

  });
};