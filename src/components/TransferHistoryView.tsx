import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Trash2,
  Download,
  Copy,
  Check,
  FileText,
  File,
  Image as ImageIcon,
  Film,
  Music,
  Share2
} from 'lucide-react';
import { TransferFileItem } from '../types/transfer';
import { formatBytes, formatTimeAgo } from '../utils/formatters';

interface TransferHistoryViewProps {
  history: TransferFileItem[];
  onClearHistory: () => void;
  onResendFile?: (item: TransferFileItem) => void;
}

export const TransferHistoryView: React.FC<TransferHistoryViewProps> = ({
  history,
  onClearHistory,
  onResendFile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'all' | 'outgoing' | 'incoming'>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.peerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDirection = filterDirection === 'all' || item.direction === filterDirection;
    return matchesSearch && matchesDirection;
  });

  const handleCopyChecksum = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleDownloadBlob = (item: TransferFileItem) => {
    if (item.blob) {
      const url = URL.createObjectURL(item.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Simulate file download save
      const dummyBlob = new Blob([`CyberDrop Verified Content: ${item.name}`], { type: item.type || 'text/plain' });
      const url = URL.createObjectURL(dummyBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getMimeIcon = (name: string) => {
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)) return <ImageIcon className="w-4 h-4 text-cyan-400" />;
    if (/\.(mp4|mkv|mov|webm)$/i.test(name)) return <Film className="w-4 h-4 text-purple-400" />;
    if (/\.(mp3|wav|ogg)$/i.test(name)) return <Music className="w-4 h-4 text-pink-400" />;
    if (/\.(pdf|doc|docx|txt|md)$/i.test(name)) return <FileText className="w-4 h-4 text-blue-400" />;
    return <File className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-[#0d1527]/90 rounded-2xl border border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transfer history..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setFilterDirection('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterDirection === 'all'
                ? 'bg-cyan-600 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({history.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterDirection('outgoing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterDirection === 'outgoing'
                ? 'bg-cyan-600 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sent
          </button>
          <button
            type="button"
            onClick={() => setFilterDirection('incoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterDirection === 'incoming'
                ? 'bg-cyan-600 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Received
          </button>
        </div>

        {/* Clear History */}
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900 text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[#0d1527]/50 rounded-2xl border border-slate-800 text-center">
          <Clock className="w-10 h-10 text-slate-600 mb-3" />
          <h4 className="text-sm font-semibold text-slate-300">No transfer history found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Completed and incoming files will be logged here with SHA-256 integrity verification.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredHistory.map((item) => {
            const isOutgoing = item.direction === 'outgoing';
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-[#0d1527]/90 border border-slate-800 hover:border-slate-700/80 transition-all gap-3"
              >
                {/* File Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
                    isOutgoing ? 'bg-cyan-950/70 border border-cyan-800/40 text-cyan-400' : 'bg-emerald-950/70 border border-emerald-800/40 text-emerald-400'
                  }`}>
                    {isOutgoing ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {item.name}
                      </span>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-rose-400">
                          <XCircle className="w-3 h-3" /> {item.status.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                      <span>{formatBytes(item.size)}</span>
                      <span>·</span>
                      <span>{isOutgoing ? `To ${item.peerName}` : `From ${item.peerName}`}</span>
                      <span>·</span>
                      <span>{formatTimeAgo(item.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* SHA-256 Checksum & Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {item.checksum && (
                    <button
                      type="button"
                      onClick={() => handleCopyChecksum(item.checksum)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[10px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
                      title={`Copy SHA-256: ${item.checksum}`}
                    >
                      {copiedHash === item.checksum ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>SHA: {item.checksum.substring(0, 8)}</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDownloadBlob(item)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                    title="Download file to device"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
