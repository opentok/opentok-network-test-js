

export type InitSessionOptions = {
  ipWhitelist?: boolean;
  iceConfig?: {
    includeServers: 'all' | 'custom';
    transportPolicy: 'all' | 'relay';
    customServers: {
      urls: string | string[];
      username?: string;
      credential?: string;
    }[];
  };
  proxyUrl?: string;
};

export interface SessionCredentials {
  apiKey: string;
  sessionId: string;
  token: string;
}

