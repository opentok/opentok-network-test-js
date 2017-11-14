import OT from '@opentok/client';
import Promise from 'bluebird';

import {
  NoVideoCaptureDevicesError,
  NoAudioCaptureDevicesError,
} from '../errors/errors';

function filterDevicesForType(type) {
  return new Promise((resolve, reject) => {
    const deviceList = [];

    OT.getDevices((error, devices) => {
      devices.forEach((device) => {
        if (device.kind === type) {
          deviceList.push(device);
        }
      });

      if (deviceList.length !== 0) {
        resolve(deviceList);
      } else if (type === 'videoInput') {
        reject(new NoVideoCaptureDevicesError('No video capture devices found!'));
      } else if (type === 'audioInput') {
        reject(new NoAudioCaptureDevicesError('No audio capture devices found!'));
      }
    });
  });
}

export default filterDevicesForType;
