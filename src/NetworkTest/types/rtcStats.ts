export interface RTCIceCandidateStats extends RTCStats {
  address: string;
  candidateType: string;
  foundation: string;
  ip: string;
  isRemote: boolean;
  networkType: string;
  port: number;
  priority: number;
  protocol: string;
  tcpType: string;
  transportId: string;
  usernameFragment: string;
}
