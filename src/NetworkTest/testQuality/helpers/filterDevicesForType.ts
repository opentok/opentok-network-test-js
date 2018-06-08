import * as Promise from 'promise';
import * as e from '../../testConnectivity/errors';
import { Device } from '../../types/opentok';
import { OTError } from '../../types/opentok/error';

export default function filterDevicesForType(OT: OpenTok, type: InputDeviceType) {
  return new Promise((resolve, reject) => {
    OT.getDevices((error?: OTError, devices: Device[] = []) => {
      if (error) {
        reject(new e.FailedToObtainMediaDevices());
      } else {
        const deviceList = devices.filter((device: Device) => device.kind === type);
        if (deviceList.length !== 0) {
          resolve(deviceList);
        } else if (type === 'videoInput') {
          reject(new e.NoVideoCaptureDevicesError());
        } else if (type === 'audioInput') {
          reject(new e.NoAudioCaptureDevicesError());
        }
      }
    });
  });
}
