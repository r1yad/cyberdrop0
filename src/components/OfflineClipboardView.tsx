import React, { useState } from 'react';
import {
  Clipboard,
  Copy,
  Check,
  Send,
  Trash2,
  FileCode,
  Sparkles,
  Smartphone,
  Laptop
} from 'lucide-react';
import { ClipboardItem } from '../types/transfer';
import { formatTimeAgo } from '../utils/formatters';

interface OfflineClipboardViewProps {
  items: ClipboardItem[];
  onSendSnippet: (text: string) => void;
  onClearSnippets: () => void;
  onDeleteSnippet: (id: string) => void;
}

export const OfflineClipboardView: React.FC<OfflineClipboardViewProps> = ({
  items,
  onSendSnippet,
  onClearSnippets,
  onDeleteSnippet,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendSnippet(inputText.trim());
    setInputText('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Input Composer */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-[#0d1527]/90 rounded-2xl border border-slate-800 flex flex-col gap-3 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instant Offline Text & Snippet Sync</span>
          </label>
          <span className="text-[11px] font-mono text-emerald-400">
            0% DATA · LOCAL CHANNEL
          </span>
        </div>

        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste URL, verification code, Wi-Fi password, or code snippet to share instantly with nearby devices..."
          className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono resize-none"
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            {inputText.length} characters
          </span>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md ${
              inputText.trim()
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.35)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>BROADCAST SNIPPET</span>
          </button>
        </div>
      </form>

      {/* Snippet Feed */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-400">
            Synced Snippets ({items.length})
          </span>
          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearSnippets}
              className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-[#0d1527]/50 rounded-2xl border border-slate-800 text-center">
            <FileCode className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 font-medium">No synced snippets yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Type above to broadcast text between your phone and PC with zero internet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#0d1527]/90 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-cyan-300">
                      {item.isSelf ? 'You (Outgoing)' : item.senderName}
                    </span>
                    <span>·</span>
                    <span>{formatTimeAgo(item.timestamp)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.text)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteSnippet(item.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Snippet Content */}
                <pre className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs font-mono text-slate-200 whitespace-pre-wrap break-all select-all">
                  {item.text}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
