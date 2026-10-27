import React, { useState } from 'react';
import {
  QrCode,
  KeyRound,
  Bluetooth,
  X,
  RefreshCw,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Radio,
  Wifi,
  Sparkles
} from 'lucide-react';
import { DevicePeer, UserDeviceProfile } from '../types/transfer';
import { generatePairingQRMatrix } from '../utils/qrCode';
import { generatePairCode } from '../utils/formatters';

interface PairingModalProps {
  myProfile: UserDeviceProfile;
  onUpdatePairCode: (newCode: string) => void;
  onConnectViaCode: (code: string) => void;
  onScanBluetooth: () => void;
  onAddSimulatedPeer: (type: 'windows' | 'android' | 'ios') => void;
  onClose: () => void;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  myProfile,
  onUpdatePairCode,
  onConnectViaCode,
  onScanBluetooth,
  onAddSimulatedPeer,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'code' | 'ble'>('qr');
  const [inputCode, setInputCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Generate QR Matrix for current session payload
  const qrPayload = JSON.stringify({
    id: myProfile.id,
    name: myProfile.name,
    code: myProfile.localCode,
    platform: myProfile.platform,
  });
  const qrMatrix = generatePairingQRMatrix(qrPayload);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myProfile.localCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim().length >= 4) {
      onConnectViaCode(inputCode.trim());
      setInputCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0a1122] border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.25)] p-6 flex flex-col gap-4 overflow-hidden">
        {/* Top Glow Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-100 tracking-wide">
              ZERO-INTERNET PAIRING HUB
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'qr'
                ? 'bg-cyan-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>My QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'code'
                ? 'bg-cyan-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Enter PIN</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ble')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ble'
                ? 'bg-cyan-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bluetooth className="w-3.5 h-3.5" />
            <span>Bluetooth</span>
          </button>
        </div>

        {/* Tab 1: QR Code & 6-Digit PIN */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center gap-4 py-2">
            {/* SVG Rendered QR Code */}
            <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-cyan-400/80">
              <svg
                width={200}
                height={200}
                viewBox={`0 0 ${qrMatrix.size} ${qrMatrix.size}`}
                className="shape-rendering-crispEdges"
              >
                {qrMatrix.modules.map((row, r) =>
                  row.map((cell, c) =>
                    cell ? (
                      <rect
                        key={`${r}-${c}`}
                        x={c}
                        y={r}
                        width={1}
                        height={1}
                        fill="#070b12"
                      />
                    ) : null
                  )
                )}
              </svg>
            </div>

            {/* 6-Digit Display */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                Pairing PIN Code
              </span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black font-mono tracking-widest text-cyan-300">
                  {myProfile.localCode.slice(0, 3)} {myProfile.localCode.slice(3)}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Copy PIN"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdatePairCode(generatePairCode())}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Generate new PIN"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 max-w-xs">
              Scan with camera or type the 6-digit PIN on your other phone or PC to pair without internet.
            </p>
          </div>
        )}

        {/* Tab 2: Enter PIN */}
        {activeTab === 'code' && (
          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300">
                Enter Other Device's 6-Digit PIN
              </label>
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center py-3 rounded-xl bg-slate-900 border border-slate-700 text-2xl font-mono tracking-widest text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={inputCode.length < 4}
              className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md ${
                inputCode.length >= 4
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              PAIR WITH DEVICE
            </button>

            {/* Sandbox Peer Simulation for Instant Demonstration */}
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                Instant Sandbox Discovery:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onAddSimulatedPeer('windows')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300"
                >
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+ Windows Rig</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddSimulatedPeer('android')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+ Android Phone</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 3: Bluetooth */}
        {activeTab === 'ble' && (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Bluetooth className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Web Bluetooth Low Energy
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Scan for nearby Bluetooth beacons and peripherals for ultra-low power offline signaling on Windows and Android.
              </p>
            </div>

            <button
              type="button"
              onClick={onScanBluetooth}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              <Bluetooth className="w-4 h-4" />
              <span>SCAN HARDWARE BLUETOOTH</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
