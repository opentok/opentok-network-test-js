export default class MOSState {
  statsLog: OT.SubscriberStats[];
  audioScoresLog: number[];
  videoScoresLog: number[];
  bandwidth: Bandwidth;
  intervalId?: number;
  maxLogLength: number;
  scoreInterval: number;

  constructor() {
    this.statsLog = [];
    this.audioScoresLog = [];
    this.videoScoresLog = [];
  }

  static readonly maxLogLength: number = 1000;
  static readonly scoreInterval: number = 1000;

  private audioScore(): number {
    return this.audioScoresLog.reduce((acc, score) => acc + score, 0);
  }

  private videoScore(): number {
    return this.videoScoresLog.reduce((acc, score) => acc + score, 0);
  }

  clearInterval() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
    this.intervalId = undefined;
  }

  pruneAudioScores() {
    const { audioScoresLog, maxLogLength } = this;
    while (audioScoresLog.length > maxLogLength) {
      audioScoresLog.shift();
    }
    this.audioScoresLog = audioScoresLog;
  }

  pruneVideoScores() {
    const { videoScoresLog, maxLogLength } = this;
    while (videoScoresLog.length > maxLogLength) {
      videoScoresLog.shift();
    }
    this.videoScoresLog = videoScoresLog;
  }

  qualityScore(): number {
    return Math.min(this.audioScore(), this.videoScore());
  }
}
