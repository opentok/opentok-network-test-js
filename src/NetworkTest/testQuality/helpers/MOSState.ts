export default class MOSState {
  statsLog: OT.SubscriberStats[];
  audioScoresLog: number[];
  videoScoresLog: number[];
  stats: HasAudioVideo<AverageStats>;
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

  readonly hasAudioTrack = (): boolean => this.statsLog[0] && !!this.statsLog[0].audio;
  readonly hasVideoTrack = (): boolean => this.statsLog[0] && !!this.statsLog[0].video;

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

  private pruneAudioScores() {
    const { audioScoresLog, maxLogLength } = this;
    while (audioScoresLog.length > maxLogLength) {
      audioScoresLog.shift();
    }
    this.audioScoresLog = audioScoresLog;
  }

  private pruneVideoScores() {
    const { videoScoresLog, maxLogLength } = this;
    while (videoScoresLog.length > maxLogLength) {
      videoScoresLog.shift();
    }
    this.videoScoresLog = videoScoresLog;
  }

  pruneScores() {
    this.pruneAudioScores();
    this.pruneVideoScores();
  }

  qualityScore(): number {
    const hasAudioTrack = this.hasAudioTrack();
    const hasVideoTrack = this.hasVideoTrack();
    if (hasAudioTrack && hasVideoTrack) {
      return Math.min(this.audioScore(), this.videoScore());
    } else if (hasAudioTrack && !hasVideoTrack) {
      return this.audioScore();
    } else if (!hasAudioTrack && hasVideoTrack) {
      return this.videoScore();
    } else {
      return 0;
    }
  }
}
