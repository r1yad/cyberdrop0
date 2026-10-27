import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Smartphone,
  Download,
  CheckCircle2,
  AlertTriangle,
  Github,
  X,
  ExternalLink,
  ShieldCheck,
  FolderDown,
  Layers,
  ArrowRight
} from 'lucide-react';

interface RunGuideModalProps {
  onClose: () => void;
}

export const RunGuideModal: React.FC<RunGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'windows' | 'android' | 'github'>('windows');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => setPwaInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setPwaInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0a1122] border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.25)] p-6 flex flex-col gap-4 max-h-[92vh] overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <FolderDown className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                DOWNLOAD & RUN CYBERDROP NATIVELY
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                How to get and run CyberDrop.exe (Windows) and CyberDrop.apk (Android)
              </p>
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

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('windows')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'windows'
                ? 'bg-cyan-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Windows (.exe)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'android'
                ? 'bg-cyan-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android (.apk)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'github'
                ? 'bg-cyan-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>Where to Download</span>
          </button>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
          {/* TAB 1: WINDOWS */}
          {activeTab === 'windows' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-bold text-slate-100">
                      CyberDrop.exe (Native Windows WebView2)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-xs border border-cyan-800/60">
                    ~12 MB
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Runs natively on Windows 10 and 11 using the built-in WebView2 runtime. No external browsers, Node.js, or heavyweight Electron installs needed.
                </p>
              </div>

              {/* Step by step instructions */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Execution Steps:
                </h4>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 shrink-0">
                    1
                  </span>
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-slate-100">Download the file</p>
                    <p className="text-slate-400 mt-0.5">
                      On your GitHub repository, go to <strong>Actions</strong> → select the latest run → download <strong>CyberDrop-Windows-EXE</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 shrink-0">
                    2
                  </span>
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-slate-100">Extract & Double-click</p>
                    <p className="text-slate-400 mt-0.5">
                      Extract the zip or launch <strong>CyberDrop.exe</strong> directly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 shrink-0">
                    3
                  </span>
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-slate-100">SmartScreen Notice (If prompted)</p>
                    <p className="text-slate-400 mt-0.5">
                      Windows may show <em>"Windows protected your PC"</em> because the binary was compiled on your personal GitHub Actions. Click <strong>More info</strong> → <strong>Run anyway</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID */}
          {activeTab === 'android' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-slate-100">
                      CyberDrop.apk (Android Package)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-xs border border-emerald-800/60">
                    ~10 MB
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Standard Android APK package compiled by Gradle. Installs on any Android 8.0+ smartphone or tablet and runs 100% offline.
                </p>
              </div>

              {/* Android Steps */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Installation Steps:
                </h4>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300 shrink-0">
                    1
                  </span>
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-slate-100">Download CyberDrop.apk</p>
                    <p className="text-slate-400 mt-0.5">
                      Download <strong>CyberDrop-Android-APK</strong> from GitHub Actions onto your Android device.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300 shrink-0">
                    2
                  </span>
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-slate-100">Tap to Install</p>
                    <p className="text-slate-400 mt-0.5">
                      Open your file manager or notification shade and tap <strong>CyberDrop.apk</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300 shrink-0">
                    3
                  </span>
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-slate-100">Allow Installation</p>
                    <p className="text-slate-400 mt-0.5">
                      If Android asks to <em>"Install unknown apps"</em>, tap <strong>Settings</strong> and toggle on <strong>Allow from this source</strong>. Tap <strong>Install</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHERE TO DOWNLOAD IN GITHUB */}
          {activeTab === 'github' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
                <span className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider">
                  Where GitHub Stores The Built Files
                </span>
                <p className="text-xs text-slate-300">
                  GitHub Actions compiles your code in the cloud and automatically attaches the files to the run summary:
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                  <span className="text-cyan-400 font-bold">1.</span>
                  <span>Open your GitHub repository in your browser</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                  <span className="text-cyan-400 font-bold">2.</span>
                  <span>Click the <strong>Actions</strong> tab along the top bar</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                  <span className="text-cyan-400 font-bold">3.</span>
                  <span>Click the top completed workflow run (marked with a green checkmark)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                  <span className="text-cyan-400 font-bold">4.</span>
                  <span>Scroll down to the <strong>Artifacts</strong> section at the bottom</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800">
                  <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/30 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-bold">
                      <Monitor className="w-3.5 h-3.5" />
                      <span>CyberDrop-Windows-EXE</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Click to download CyberDrop.exe</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/30 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>CyberDrop-Android-APK</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Click to download CyberDrop.apk</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instant 1-Click PWA Option */}
          {deferredPrompt && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/70 to-emerald-950/70 border border-cyan-500/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Layers className="w-6 h-6 text-cyan-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-100">
                    Instant Zero-Download PWA Option
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Install CyberDrop directly into Windows or Android right now with 1 click.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstallPWA}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-slate-950 whitespace-nowrap shadow-md"
              >
                Install Now
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Internet Required · 100% Offline Operation</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-slate-950"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
