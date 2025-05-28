export interface DebugLog {
  timestamp: string;
  message: string;
  data?: unknown;
  component?: string;
}

declare global {
  interface Window {
    farcasterDebug: DebugLog[];
  }
}
