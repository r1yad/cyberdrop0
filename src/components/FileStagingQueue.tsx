import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  File,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  Archive,
  Code,
  X,
  Send,
  FolderPlus,
  Plus
} from 'lucide-react';
import { DevicePeer, TransferFileItem } from '../types/transfer';
import { formatBytes } from '../utils/formatters';

interface FileStagingQueueProps {
  stagedFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onClearQueue: () => void;
  discoveredPeers: DevicePeer[];
  selectedPeer: DevicePeer | null;
  onSelectPeer: (peer: DevicePeer | null) => void;
  onDispatchTransfer: () => void;
}

export const FileStagingQueue: React.FC<FileStagingQueueProps> = ({
  stagedFiles,
  onAddFiles,
  onRemoveFile,
  onClearQueue,
  discoveredPeers,
  selectedPeer,
  onSelectPeer,
  onDispatchTransfer,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const totalBytes = stagedFiles.reduce((acc, f) => acc + f.size, 0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
    }
  };

  const getMimeIcon = (type: string, name: string) => {
    if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)) {
      return <ImageIcon className="w-4 h-4 text-cyan-400" />;
    }
    if (type.startsWith('video/') || /\.(mp4|mkv|mov|webm)$/i.test(name)) {
      return <Film className="w-4 h-4 text-purple-400" />;
    }
    if (type.startsWith('audio/') || /\.(mp3|wav|ogg|flac)$/i.test(name)) {
      return <Music className="w-4 h-4 text-pink-400" />;
    }
    if (/\.(zip|tar|gz|7z|rar)$/i.test(name)) {
      return <Archive className="w-4 h-4 text-amber-400" />;
    }
    if (/\.(js|ts|tsx|jsx|json|html|css|py|rs|go|cpp|c|sh)$/i.test(name)) {
      return <Code className="w-4 h-4 text-emerald-400" />;
    }
    if (/\.(pdf|doc|docx|txt|md|csv|xlsx)$/i.test(name)) {
      return <FileText className="w-4 h-4 text-blue-400" />;
    }
    return <File className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Hidden File / Folder Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Drag & Drop Hero Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_30px_rgba(0,240,255,0.25)]'
            : 'border-slate-800 hover:border-cyan-500/40 bg-[#0d1527]/70 hover:bg-[#0d1527]'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 mb-3 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-100">
          Drop files to stage transfer
        </h3>
        <p className="mt-1 text-xs text-slate-400 text-center max-w-sm">
          Drag & drop photos, documents, videos, or folders. Transferred directly over Wi-Fi / Bluetooth with 0% data usage.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-slate-950 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Select Files</span>
          </button>
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Folder</span>
          </button>
        </div>
      </div>

      {/* Staged Queue Panel (Shown when files are queued) */}
      {stagedFiles.length > 0 && (
        <div className="w-full bg-[#0d1527]/90 rounded-2xl border border-slate-800 p-5 flex flex-col gap-4 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">Batch Queue</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-xs border border-cyan-800/60">
                {stagedFiles.length} {stagedFiles.length === 1 ? 'file' : 'files'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {formatBytes(totalBytes)}
              </span>
            </div>

            <button
              type="button"
              onClick={onClearQueue}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Staged Items List */}
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {stagedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/90 shrink-0">
                    {getMimeIcon(file.type, file.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFile(idx)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors ml-2 shrink-0"
                  title="Remove from batch"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Target Peer Selector & Dispatch */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
            {/* Peer Picker */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-medium text-slate-400 shrink-0">Target Device:</span>
              <select
                value={selectedPeer?.id || ''}
                onChange={(e) => {
                  const target = discoveredPeers.find((p) => p.id === e.target.value) || null;
                  onSelectPeer(target);
                }}
                className="w-full max-w-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="">-- Choose Discovered Device --</option>
                {discoveredPeers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.protocol.toUpperCase()} · {p.signalStrength}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Send Dispatch CTA */}
            <button
              type="button"
              disabled={!selectedPeer}
              onClick={onDispatchTransfer}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-md shrink-0 ${
                selectedPeer
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>SEND BATCH ({formatBytes(totalBytes)})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
