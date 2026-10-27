/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  Radio,
  UploadCloud,
  Clipboard,
  History,
  QrCode,
  Github,
  Wifi,
  Bluetooth,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  HardDrive,
  FolderDown
} from 'lucide-react';
import {
  ClipboardItem,
  DevicePeer,
  TransferFileItem,
  UserDeviceProfile
} from './types/transfer';
import {
  loadClipboardItems,
  loadDeviceProfile,
  loadTransferHistory,
  saveClipboardItems,
  saveDeviceProfile,
  saveTransferHistory
} from './utils/storage';
import { computeFileChecksum, generateShortId } from './utils/formatters';
import { OfflineTransferEngine } from './utils/transferEngine';
import { RadarSweep } from './components/RadarSweep';
import { FileStagingQueue } from './components/FileStagingQueue';
import { ActiveTransferModal } from './components/ActiveTransferModal';
import { PreTransferPreviewModal } from './components/PreTransferPreviewModal';
import { TransferHistoryView } from './components/TransferHistoryView';
import { OfflineClipboardView } from './components/OfflineClipboardView';
import { PairingModal } from './components/PairingModal';
import { GitHubActionsInfoModal } from './components/GitHubActionsInfoModal';
import { RunGuideModal } from './components/RunGuideModal';

type NavTab = 'radar' | 'staging' | 'clipboard' | 'history';

export default function App() {
  // Device & Profile State
  const [profile, setProfile] = useState<UserDeviceProfile>(() => loadDeviceProfile());
  const [activeTab, setActiveTab] = useState<NavTab>('radar');

  // Discovered Peers
  const [discoveredPeers, setDiscoveredPeers] = useState<DevicePeer[]>([
    {
      id: 'peer-win-01',
      name: 'Win-Desk-4K',
      platform: 'windows',
      protocol: 'wifi',
      signalStrength: 94,
      rssi: -45,
      status: 'available',
      lastSeen: Date.now() - 12000,
      avatarSeed: 'win01',
    },
    {
      id: 'peer-android-02',
      name: 'Pixel-8-Pro',
      platform: 'android',
      protocol: 'bluetooth',
      signalStrength: 82,
      rssi: -58,
      status: 'available',
      lastSeen: Date.now() - 45000,
      avatarSeed: 'and02',
    },
  ]);
  const [selectedPeer, setSelectedPeer] = useState<DevicePeer | null>(discoveredPeers[0] || null);

  // File Staging
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);

  // Transfer Engine & Queues
  const [activeTransfers, setActiveTransfers] = useState<TransferFileItem[]>([]);
  const [showActiveTransferModal, setShowActiveTransferModal] = useState(false);

  // Pre-Transfer Preview Modal (Incoming transfers)
  const [incomingTransferBatch, setIncomingTransferBatch] = useState<{
    items: TransferFileItem[];
    sender: DevicePeer;
  } | null>(null);

  // History & Clipboard
  const [history, setHistory] = useState<TransferFileItem[]>(() => loadTransferHistory());
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>(() => loadClipboardItems());

  // Modals
  const [showPairModal, setShowPairModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showRunGuideModal, setShowRunGuideModal] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  // Transfer Engine Instance
  const transferEngine = useMemo(() => {
    return new OfflineTransferEngine(profile.id, profile.name);
  }, [profile.id, profile.name]);

  // Set up transfer engine listeners and broadcast
  useEffect(() => {
    transferEngine.setListeners({
      onPeerDiscovered: (peer: DevicePeer) => {
        setDiscoveredPeers((prev) => {
          if (prev.some((p) => p.id === peer.id)) return prev;
          return [...prev, peer];
        });
      },
      onIncomingTransferRequest: (files: TransferFileItem[], sender: DevicePeer) => {
        setIncomingTransferBatch({ items: files, sender });
      },
      onTransferProgress: (transferId, progress, speed, eta, bytesTransferred) => {
        setActiveTransfers((prev) =>
          prev.map((t) =>
            t.id === transferId
              ? { ...t, progress, speedBps: speed, etaSeconds: eta, bytesTransferred }
              : t
          )
        );
      },
      onTransferCompleted: (item) => {
        setActiveTransfers((prev) =>
          prev.map((t) => (t.id === item.id ? { ...item, status: 'completed' } : t))
        );
        // Persist to history
        setHistory((prev) => {
          const updated = [item, ...prev];
          saveTransferHistory(updated);
          return updated;
        });
      },
      onTransferFailed: (transferId, error) => {
        setActiveTransfers((prev) =>
          prev.map((t) => (t.id === transferId ? { ...t, status: 'failed', error } : t))
        );
      },
      onClipboardReceived: (text, peerName) => {
        const newItem: ClipboardItem = {
          id: 'clip-' + generateShortId(),
          text,
          timestamp: Date.now(),
          senderName: peerName,
          isSelf: false,
        };
        setClipboardItems((prev) => {
          const updated = [newItem, ...prev];
          saveClipboardItems(updated);
          return updated;
        });
      },
    });

    // Broadcast our beacon every 4 seconds
    const interval = setInterval(() => {
      if (isScanning) {
        transferEngine.broadcastBeacon(profile.platform, profile.protocol);
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      transferEngine.cleanup();
    };
  }, [transferEngine, isScanning, profile.platform, profile.protocol]);

  // Handler: Add files to staging
  const handleAddFiles = (files: File[]) => {
    setStagedFiles((prev) => [...prev, ...files]);
    setActiveTab('staging');
  };

  const handleRemoveStagedFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearStaging = () => {
    setStagedFiles([]);
  };

  // Handler: Start Dispatching Staged Batch
  const handleDispatchTransfer = async () => {
    if (!selectedPeer || stagedFiles.length === 0) return;

    // Convert staged files to TransferFileItems with real blobs & preview URLs
    const items: TransferFileItem[] = [];

    for (const file of stagedFiles) {
      const previewUrl = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;

      const checksum = await computeFileChecksum(file);

      items.push({
        id: 'trans-' + generateShortId(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'queued',
        progress: 0,
        bytesTransferred: 0,
        speedBps: 0,
        etaSeconds: 0,
        checksum,
        timestamp: Date.now(),
        direction: 'outgoing',
        peerId: selectedPeer.id,
        peerName: selectedPeer.name,
        protocol: selectedPeer.protocol,
        previewUrl,
        blob: file,
      });
    }

    setActiveTransfers(items);
    setShowActiveTransferModal(true);
    setStagedFiles([]);

    // Execute transfer stream
    await transferEngine.sendFileBatch(items, selectedPeer, (itemId, progress, speed, eta) => {
      setActiveTransfers((prev) =>
        prev.map((t) =>
          t.id === itemId
            ? { ...t, progress, speedBps: speed, etaSeconds: eta }
            : t
        )
      );
    });
  };

  // Handler: Accept Incoming Transfer
  const handleAcceptIncoming = (selectedItemIds: string[]) => {
    if (!incomingTransferBatch) return;

    const acceptedItems = incomingTransferBatch.items.filter((i) =>
      selectedItemIds.includes(i.id)
    );

    setActiveTransfers(acceptedItems);
    setShowActiveTransferModal(true);
    setIncomingTransferBatch(null);

    // Stream download simulation
    transferEngine.sendFileBatch(acceptedItems, incomingTransferBatch.sender, (itemId, progress, speed, eta) => {
      setActiveTransfers((prev) =>
        prev.map((t) =>
          t.id === itemId
            ? { ...t, progress, speedBps: speed, etaSeconds: eta }
            : t
        )
      );
    });
  };

  const handleDeclineIncoming = () => {
    setIncomingTransferBatch(null);
  };

  // Handler: Clipboard broadcast
  const handleSendSnippet = (text: string) => {
    const newItem: ClipboardItem = {
      id: 'clip-' + generateShortId(),
      text,
      timestamp: Date.now(),
      senderName: profile.name,
      isSelf: true,
    };
    const updated = [newItem, ...clipboardItems];
    setClipboardItems(updated);
    saveClipboardItems(updated);
    transferEngine.shareClipboard(text);
  };

  // Handler: Add Simulated Sandbox Peer
  const handleAddSimulatedPeer = (type: 'windows' | 'android' | 'ios') => {
    const names = {
      windows: 'Surface-Laptop-' + generateShortId().slice(0, 3).toUpperCase(),
      android: 'OnePlus-Pad-' + generateShortId().slice(0, 3).toUpperCase(),
      ios: 'iPad-Air-' + generateShortId().slice(0, 3).toUpperCase(),
    };
    const newPeer: DevicePeer = {
      id: 'sim-' + generateShortId(),
      name: names[type],
      platform: type,
      protocol: type === 'android' ? 'bluetooth' : 'wifi',
      signalStrength: Math.floor(75 + Math.random() * 24),
      rssi: -48,
      status: 'available',
      lastSeen: Date.now(),
      avatarSeed: type,
      isCustomPaired: true,
    };
    setDiscoveredPeers((prev) => [newPeer, ...prev]);
    setSelectedPeer(newPeer);
    setShowPairModal(false);
  };

  // Handler: Hardware Bluetooth Scan
  const handleScanBluetooth = async () => {
    const device = await transferEngine.scanBluetoothDevices();
    if (device) {
      setDiscoveredPeers((prev) => [device, ...prev]);
      setSelectedPeer(device);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 
        Top Bar Contract:
        Zone 1: Single text wordmark
        Zone 2: 4 single-line nav links
        Zone 3: 1 primary CTA
      */}
      <header className="sticky top-0 z-40 bg-[#070b12]/95 backdrop-blur-md border-b border-cyan-500/20 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          className="flex items-center gap-2 text-base sm:text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
        >
          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-mono text-cyan-400 tracking-wider">CYBERDROP</span>
        </a>

        {/* Zone 2: 4 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wide text-slate-400">
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'radar' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Radar Beacon</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staging')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'staging' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>File Staging {stagedFiles.length > 0 && `(${stagedFiles.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clipboard')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'clipboard' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'hover:text-slate-200'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Offline Clipboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowRunGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.35)] whitespace-nowrap shrink-0"
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span>Download & Run (.exe / .apk)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGitHubModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors whitespace-nowrap shrink-0"
            title="View GitHub Actions CI/CD configuration"
          >
            <Github className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">CI/CD</span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-[#0a1122] border-b border-slate-800 p-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('radar')}
          className={`px-3 py-1.5 rounded-lg ${activeTab === 'radar' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400'}`}
        >
          Radar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('staging')}
          className={`px-3 py-1.5 rounded-lg ${activeTab === 'staging' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400'}`}
        >
          Stage {stagedFiles.length > 0 && `(${stagedFiles.length})`}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('clipboard')}
          className={`px-3 py-1.5 rounded-lg ${activeTab === 'clipboard' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400'}`}
        >
          Clip
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 rounded-lg ${activeTab === 'history' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400'}`}
        >
          History
        </button>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Device Identity Status Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#0d1527]/80 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => {
                    const updated = { ...profile, name: e.target.value };
                    setProfile(updated);
                    saveDeviceProfile(updated);
                  }}
                  className="bg-transparent text-sm font-bold text-slate-100 hover:bg-slate-900/60 focus:bg-slate-900 px-1 py-0.5 rounded border border-transparent hover:border-slate-700 focus:border-cyan-500 font-mono"
                  title="Click to rename this device"
                />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 uppercase">
                  {profile.platform}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Internet Mode Active</span>
                <span>·</span>
                <span className="font-mono text-cyan-400">PIN: {profile.localCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {activeTransfers.length > 0 && (
              <button
                type="button"
                onClick={() => setShowActiveTransferModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300 hover:bg-cyan-900/60 animate-pulse"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>ACTIVE TRANSFER ({activeTransfers.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPairModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pair Hub</span>
            </button>
          </div>
        </div>

        {/* View Routing */}
        {activeTab === 'radar' && (
          <div className="flex flex-col gap-6">
            <RadarSweep
              myProfile={profile}
              discoveredPeers={discoveredPeers}
              onSelectPeer={(peer) => {
                setSelectedPeer(peer);
                setActiveTab('staging');
              }}
              onOpenQR={() => setShowPairModal(true)}
              onOpenCodePair={() => setShowPairModal(true)}
              onScanBluetooth={handleScanBluetooth}
              onRefreshScan={() => setIsScanning((prev) => !prev)}
              isScanning={isScanning}
            />

            {/* Quick File Staging Dropzone below Radar */}
            <div className="mt-2">
              <FileStagingQueue
                stagedFiles={stagedFiles}
                onAddFiles={handleAddFiles}
                onRemoveFile={handleRemoveStagedFile}
                onClearQueue={handleClearStaging}
                discoveredPeers={discoveredPeers}
                selectedPeer={selectedPeer}
                onSelectPeer={setSelectedPeer}
                onDispatchTransfer={handleDispatchTransfer}
              />
            </div>
          </div>
        )}

        {activeTab === 'staging' && (
          <div className="flex flex-col gap-4">
            <FileStagingQueue
              stagedFiles={stagedFiles}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveStagedFile}
              onClearQueue={handleClearStaging}
              discoveredPeers={discoveredPeers}
              selectedPeer={selectedPeer}
              onSelectPeer={setSelectedPeer}
              onDispatchTransfer={handleDispatchTransfer}
            />
          </div>
        )}

        {activeTab === 'clipboard' && (
          <OfflineClipboardView
            items={clipboardItems}
            onSendSnippet={handleSendSnippet}
            onClearSnippets={() => {
              setClipboardItems([]);
              saveClipboardItems([]);
            }}
            onDeleteSnippet={(id) => {
              const updated = clipboardItems.filter((i) => i.id !== id);
              setClipboardItems(updated);
              saveClipboardItems(updated);
            }}
          />
        )}

        {activeTab === 'history' && (
          <TransferHistoryView
            history={history}
            onClearHistory={() => {
              setHistory([]);
              saveTransferHistory([]);
            }}
          />
        )}
      </main>

      {/* Floating Active Transfer Bar if Modal is closed but transfer is running */}
      {!showActiveTransferModal && activeTransfers.length > 0 && (
        <div
          onClick={() => setShowActiveTransferModal(true)}
          className="fixed bottom-4 right-4 z-40 p-4 bg-[#0a1122]/95 border border-cyan-500/50 rounded-2xl shadow-2xl flex items-center gap-4 cursor-pointer hover:border-cyan-400 transition-all max-w-sm backdrop-blur-md"
        >
          <div className="w-8 h-8 rounded-full bg-cyan-950 flex items-center justify-center text-cyan-400">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="font-semibold text-slate-200 truncate">
                {activeTransfers[0].name}
              </span>
              <span className="text-cyan-400">{activeTransfers[0].progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${activeTransfers[0].progress}%` }}
                className="h-full bg-cyan-400 rounded-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showActiveTransferModal && (
        <ActiveTransferModal
          activeTransfers={activeTransfers}
          onPause={(id) => transferEngine.pauseTransfer(id)}
          onResume={(id) => transferEngine.resumeTransfer(id)}
          onCancel={(id) => transferEngine.cancelTransfer(id)}
          onClose={() => setShowActiveTransferModal(false)}
        />
      )}

      {incomingTransferBatch && (
        <PreTransferPreviewModal
          incomingItems={incomingTransferBatch.items}
          senderPeer={incomingTransferBatch.sender}
          onAccept={handleAcceptIncoming}
          onDecline={handleDeclineIncoming}
        />
      )}

      {showPairModal && (
        <PairingModal
          myProfile={profile}
          onUpdatePairCode={(newCode) => {
            const updated = { ...profile, localCode: newCode };
            setProfile(updated);
            saveDeviceProfile(updated);
          }}
          onConnectViaCode={(code) => {
            // Find or simulate peer with matching code
            handleAddSimulatedPeer('windows');
          }}
          onScanBluetooth={handleScanBluetooth}
          onAddSimulatedPeer={handleAddSimulatedPeer}
          onClose={() => setShowPairModal(false)}
        />
      )}

      {showGitHubModal && (
        <GitHubActionsInfoModal onClose={() => setShowGitHubModal(false)} />
      )}

      {showRunGuideModal && (
        <RunGuideModal onClose={() => setShowRunGuideModal(false)} />
      )}
    </div>
  );
}
