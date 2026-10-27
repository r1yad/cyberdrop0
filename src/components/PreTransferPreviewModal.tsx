import React, { useState } from 'react';
import {
  ShieldAlert,
  Check,
  X,
  File,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  ExternalLink,
  Lock,
  Eye
} from 'lucide-react';
import { DevicePeer, TransferFileItem } from '../types/transfer';
import { formatBytes } from '../utils/formatters';

interface PreTransferPreviewModalProps {
  incomingItems: TransferFileItem[];
  senderPeer: DevicePeer;
  onAccept: (selectedItemIds: string[]) => void;
  onDecline: () => void;
}

export const PreTransferPreviewModal: React.FC<PreTransferPreviewModalProps> = ({
  incomingItems,
  senderPeer,
  onAccept,
  onDecline,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    incomingItems.map((i) => i.id)
  );
  const [previewingItem, setPreviewingItem] = useState<TransferFileItem | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalSelectedBytes = incomingItems
    .filter((i) => selectedIds.includes(i.id))
    .reduce((acc, i) => acc + i.size, 0);

  const isImage = (item: TransferFileItem) =>
    item.type.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(item.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0a1122] border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.25)] p-6 flex flex-col gap-4 overflow-hidden">
        {/* Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                INCOMING FILE REQUEST
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                From <span className="font-semibold text-cyan-300">{senderPeer.name}</span> via{' '}
                <span className="font-mono text-emerald-400">{senderPeer.protocol.toUpperCase()}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDecline}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Zero internet transfer. Inspect files and select items to receive onto this device.
          </span>
        </div>

        {/* File List with Previews & Selection Checkboxes */}
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
          {incomingItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500"
                  />

                  {/* Thumbnail / Mime Icon */}
                  <div className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center shrink-0 overflow-hidden border border-slate-700/60">
                    {item.previewUrl && isImage(item) ? (
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <File className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      {formatBytes(item.size)} · {item.type || 'Binary Data'}
                    </p>
                  </div>
                </div>

                {/* Instant Preview Action */}
                {item.previewUrl && (
                  <button
                    type="button"
                    onClick={() => setPreviewingItem(item)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-cyan-300 transition-colors shrink-0 ml-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Summary */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
          <span>{selectedIds.length} of {incomingItems.length} selected</span>
          <span className="text-cyan-300 font-semibold">{formatBytes(totalSelectedBytes)}</span>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onDecline}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Decline All
          </button>

          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => onAccept(selectedIds)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md ${
              selectedIds.length > 0
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>ACCEPT SELECTED</span>
          </button>
        </div>

        {/* Sub-Modal / Popover for Full Preview */}
        {previewingItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
            <div className="relative max-w-md w-full bg-slate-900 border border-cyan-500/50 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {previewingItem.name}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewingItem(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {previewingItem.previewUrl && isImage(previewingItem) ? (
                <div className="max-h-80 overflow-hidden rounded-xl border border-slate-800 flex items-center justify-center bg-black/60">
                  <img
                    src={previewingItem.previewUrl}
                    alt={previewingItem.name}
                    className="max-h-80 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  Binary file preview. Size: {formatBytes(previewingItem.size)}. SHA-256 validation enabled upon accept.
                </div>
              )}

              <button
                type="button"
                onClick={() => setPreviewingItem(null)}
                className="w-full py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
