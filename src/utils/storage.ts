import { ClipboardItem, DevicePeer, TransferFileItem, UserDeviceProfile } from '../types/transfer';
import { detectCurrentPlatform, generatePairCode, generateShortId } from './formatters';

const STORAGE_KEYS = {
  PROFILE: 'cyberdrop_device_profile_v1',
  HISTORY: 'cyberdrop_transfer_history_v1',
  CLIPBOARD: 'cyberdrop_clipboard_v1',
  PEERS: 'cyberdrop_discovered_peers_v1',
};

export function loadDeviceProfile(): UserDeviceProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load profile', e);
  }

  const platform = detectCurrentPlatform();
  const defaultNames: Record<string, string> = {
    windows: 'Win-PC-' + generateShortId().toUpperCase().slice(0, 4),
    android: 'Android-' + generateShortId().toUpperCase().slice(0, 4),
    ios: 'iPhone-' + generateShortId().toUpperCase().slice(0, 4),
    mac: 'MacBook-' + generateShortId().toUpperCase().slice(0, 4),
    linux: 'Linux-Node-' + generateShortId().toUpperCase().slice(0, 4),
  };

  const defaultProfile: UserDeviceProfile = {
    id: 'peer-' + generateShortId(),
    name: defaultNames[platform] || 'CyberDevice-01',
    platform,
    protocol: 'wifi',
    localCode: generatePairCode(),
    signalSweepRange: 'extended',
  };

  saveDeviceProfile(defaultProfile);
  return defaultProfile;
}

export function saveDeviceProfile(profile: UserDeviceProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadTransferHistory(): TransferFileItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      const items: TransferFileItem[] = JSON.parse(raw);
      // Clean up ephemeral fields
      return items.map(item => ({
        ...item,
        blob: undefined, // Blobs cannot be serialized in localStorage
      }));
    }
  } catch (e) {
    console.error('Failed to load history', e);
  }
  return [];
}

export function saveTransferHistory(history: TransferFileItem[]): void {
  try {
    // Only store serializable metadata to prevent storage quota issues
    const serialized = history.slice(0, 50).map(item => ({
      ...item,
      blob: undefined,
      previewUrl: item.type.startsWith('image/') && item.size < 500000 ? item.previewUrl : undefined,
    }));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(serialized));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function loadClipboardItems(): ClipboardItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIPBOARD);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load clipboard', e);
  }
  return [];
}

export function saveClipboardItems(items: ClipboardItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIPBOARD, JSON.stringify(items.slice(0, 30)));
  } catch (e) {
    console.error('Failed to save clipboard', e);
  }
}
