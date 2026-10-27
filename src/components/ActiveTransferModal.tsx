import React from 'react';
import {
  Pause,
  Play,
  X,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Bluetooth,
  ShieldCheck,
  Zap,
  Download
} from 'lucide-react';
import { TransferFileItem } from '../types/transfer';
import { formatBytes, formatDuration, formatSpeed } from '../utils/formatters';

interface ActiveTransferModalProps {
  activeTransfers: TransferFileItem[];
  onPause: (transferId: string) => void;
  onResume: (transferId: string) => void;
  onCancel: (transferId: string) => void;
  onClose: () => void;
}

export const ActiveTransferModal: React.FC<ActiveTransferModalProps> = ({
  activeTransfers,
  onPause,
  onResume,
  onCancel,
  onClose,
}) => {
  if (activeTransfers.length === 0) return null;

  // Aggregate batch statistics
  const totalBytes = activeTransfers.reduce((acc, t) => acc + t.size, 0);
  const transferredBytes = activeTransfers.reduce((acc, t) => acc + t.bytesTransferred, 0);
  const overallProgress = totalBytes > 0 ? Math.min(100, Math.round((transferredBytes / totalBytes) * 100)) : 0;
  const currentSpeed = activeTransfers.reduce((acc, t) => acc + t.speedBps, 0);
  const maxEta = Math.max(...activeTransfers.map((t) => t.etaSeconds));

  const allCompleted = activeTransfers.every((t) => t.status === 'completed');
  const anyPaused = activeTransfers.some((t) => t.status === 'paused');
  const firstItem = activeTransfers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#0a1122] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] p-6 flex flex-col gap-5 overflow-hidden">
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
              allCompleted
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                : 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-400'
            }`}>
              {allCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                {allCompleted ? 'TRANSFER COMPLETE' : 'P2P DIRECT STREAMING'}
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                <span>{firstItem.peerName}</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-cyan-400">
                  {firstItem.protocol === 'bluetooth' ? (
                    <Bluetooth className="w-3 h-3 text-indigo-400" />
                  ) : (
                    <Wifi className="w-3 h-3 text-emerald-400" />
                  )}
                  {firstItem.protocol.toUpperCase()}
                </span>
                <span>·</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> ZERO INTERNET
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High-Impact Main Progress Display */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-cyan-300">
              {overallProgress}%
            </span>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-400 font-semibold">
                {formatSpeed(currentSpeed)}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">
                ETA: {formatDuration(maxEta)}
              </span>
            </div>
          </div>

          {/* Master Cyber Progress Bar */}
          <div className="relative w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-cyan-900/40">
            <div
              style={{ width: `${overallProgress}%` }}
              className={`h-full transition-all duration-300 rounded-full ${
                allCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
                  : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 shadow-[0_0_15px_rgba(0,240,255,0.8)]'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
            <span>
              {formatBytes(transferredBytes)} transferred
            </span>
            <span>
              Total: {formatBytes(totalBytes)} ({activeTransfers.length} items)
            </span>
          </div>
        </div>

        {/* Individual File Items In Transfer */}
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {activeTransfers.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800"
            >
              <div className="flex flex-col min-w-0 flex-1 mr-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-200 truncate">
                    {item.name}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 shrink-0 ml-2">
                    {item.progress}%
                  </span>
                </div>
                {/* Micro Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${item.progress}%` }}
                    className="h-full bg-cyan-400 rounded-full transition-all duration-200"
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-slate-500">
                  <span>{formatBytes(item.size)}</span>
                  {item.checksum && (
                    <span className="truncate max-w-[140px]" title={`SHA-256: ${item.checksum}`}>
                      SHA: {item.checksum.substring(0, 10)}...
                    </span>
                  )}
                </div>
              </div>

              {/* Item Action Controls */}
              {!allCompleted && (
                <div className="flex items-center gap-1 shrink-0">
                  {item.status === 'paused' ? (
                    <button
                      type="button"
                      onClick={() => onResume(item.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400"
                      title="Resume"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  ) : item.status === 'transferring' ? (
                    <button
                      type="button"
                      onClick={() => onPause(item.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                      title="Pause"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => onCancel(item.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {!allCompleted && (
              <>
                {anyPaused ? (
                  <button
                    type="button"
                    onClick={() => activeTransfers.forEach((t) => onResume(t.id))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resume All</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => activeTransfers.forEach((t) => onPause(t.id))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pause All</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => activeTransfers.forEach((t) => onCancel(t.id))}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 text-xs font-medium transition-colors"
                >
                  Cancel All
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
              allCompleted
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {allCompleted ? 'DONE' : 'MINIMIZE'}
          </button>
        </div>
      </div>
    </div>
  );
};
