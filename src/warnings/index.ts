
export class NetworkConnectivityWarning {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}

export class AudioDeviceNotAvailableWarning extends NetworkConnectivityWarning {
  constructor(id: string){
    super(`The audio device with id ${id} does not exist. Falling back to default device.`);
  }
}

export class VideoDeviceNotAvailableWarning extends NetworkConnectivityWarning {
  constructor(id: string){
    super(`The video device with id ${id} does not exist. Falling back to default device.`);
  }
}
