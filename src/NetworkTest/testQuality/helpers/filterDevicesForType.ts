import * as Promise from 'promise';
import * as e from '../../testQuality/errors';

export type InputDeviceType = 'audioInput' | 'videoInput';

export default function filterDevicesForType(
  OTInstance: typeof OT,
  type: InputDeviceType
) {
  return new Promise<OT.Device[]>((resolve, reject) => {
    OTInstance.getDevices((error?: OT.OTError, devices: OT.Device[] = []) => {
      if (error) {
        reject(new e.FailedToObtainMediaDevices());
      } else {
        const deviceList = devices.filter((device: OT.Device) => device.kind === type);
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
