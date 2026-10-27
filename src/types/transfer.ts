export type DevicePlatform = 'windows' | 'android' | 'ios' | 'mac' | 'linux';
export type ConnectionProtocol = 'wifi' | 'bluetooth' | 'direct-lan';
export type PeerStatus = 'available' | 'connecting' | 'connected' | 'offline';

export interface DevicePeer {
  id: string;
  name: string;
  platform: DevicePlatform;
  protocol: ConnectionProtocol;
  signalStrength: number; // 0 to 100 percentage
  rssi?: number; // e.g. -45 dBm
  ipAddress?: string;
  status: PeerStatus;
  lastSeen: number;
  avatarSeed: string;
  isCustomPaired?: boolean;
}

export type TransferStatus =
  | 'queued'
  | 'transferring'
  | 'paused'
  | 'completed'
  | 'declined'
  | 'failed';

export type TransferDirection = 'outgoing' | 'incoming';

export interface TransferFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status: TransferStatus;
  progress: number; // 0 to 100
  bytesTransferred: number;
  speedBps: number; // bytes per second
  etaSeconds: number;
  checksum: string; // SHA-256
  timestamp: number;
  direction: TransferDirection;
  peerId: string;
  peerName: string;
  protocol: ConnectionProtocol;
  previewUrl?: string;
  blob?: Blob;
  error?: string;
  chunksTotal?: number;
  chunksCompleted?: number;
}

export interface ClipboardItem {
  id: string;
  text: string;
  timestamp: number;
  senderName: string;
  isSelf: boolean;
  copied?: boolean;
}

export interface UserDeviceProfile {
  id: string;
  name: string;
  platform: DevicePlatform;
  protocol: ConnectionProtocol;
  localCode: string; // 6-digit pair code
  signalSweepRange: 'local' | 'extended' | 'maximum';
}

export interface TransferStats {
  totalSentBytes: number;
  totalReceivedBytes: number;
  completedTransfers: number;
  activeTransferCount: number;
}
