export interface IBroadcastService {
  startBroadcast():Promise<void>;
  stopBroadcast():Promise<void>;
  attachVideo(element:HTMLVideoElement):void;
}

