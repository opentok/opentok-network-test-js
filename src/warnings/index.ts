/**
 * @module Warnings
 */

 /**
  * Base class for warnings used throughout Network Connectivity tests.
  */

export class NetworkTestWarning {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}

export class AudioDeviceNotAvailableWarning extends NetworkTestWarning {
  constructor(id: string){
    super(`The audio device with id ${id} does not exist. Falling back to default device.`);
  }
}

export class VideoDeviceNotAvailableWarning extends NetworkTestWarning {
  constructor(id: string){
    super(`The video device with id ${id} does not exist. Falling back to default device.`);
  }
}

export class FailedToConnectToLoggingServer extends NetworkTestWarning {
  constructor(){
    super(`Failed to connect to the OpenTok logging server.`);
  }
}
