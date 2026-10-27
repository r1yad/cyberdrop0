import React, { useState } from 'react';
import {
  Github,
  X,
  Copy,
  Check,
  CheckCircle2,
  Box,
  Cpu,
  Smartphone,
  Monitor
} from 'lucide-react';

interface GitHubActionsInfoModalProps {
  onClose: () => void;
}

export const GitHubActionsInfoModal: React.FC<GitHubActionsInfoModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const workflowCode = `name: Build Native CyberDrop Binaries (.exe & .apk)

on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:

jobs:
  # 1. ANDROID APK (CyberDrop.apk via Capacitor & Gradle)
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: 'temurin', java-version: 17, cache: 'gradle' }
      - run: yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses || true
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm install --legacy-peer-deps && npm run build
      - run: |
          npx cap sync android
          cd android && chmod +x gradlew && ./gradlew assembleDebug
          cp app/build/outputs/apk/debug/app-debug.apk ../CyberDrop.apk
      - uses: actions/upload-artifact@v4
        with: { name: 'CyberDrop-Android-APK', path: 'CyberDrop.apk' }

  # 2. WINDOWS EXE (CyberDrop.exe via Native WebView2)
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm install --legacy-peer-deps && npm run build
      - run: |
          dotnet publish -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true -o output\\ windows\\CyberDrop.csproj
          mkdir output\\dist
          Copy-Item -Path "dist\\*" -Destination "output\\dist" -Recurse
          Copy-Item -Path "output\\CyberDrop.exe" -Destination ".\\CyberDrop.exe"
          Compress-Archive -Path "output\\*" -DestinationPath "CyberDrop-Windows-x64.zip"
      - uses: actions/upload-artifact@v4
        with: { name: 'CyberDrop-Windows-EXE', path: 'CyberDrop.exe' }`;

  const handleCopy = () => {
    navigator.clipboard.writeText(workflowCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0a1122] border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.25)] p-6 flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        {/* Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200">
              <Github className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                GITHUB ACTIONS CI/CD & 10–20MB PACKAGING
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated cross-platform compilation without heavy bloatware
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
              <Box className="w-4 h-4" />
              <span>Target Binary Size</span>
            </div>
            <span className="text-lg font-mono font-bold text-slate-100">10 – 20 MB</span>
            <span className="text-[11px] text-slate-400">Zero Electron runtime bloat</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <Monitor className="w-4 h-4" />
              <span>Windows Platform</span>
            </div>
            <span className="text-lg font-mono font-bold text-slate-100">WebView2 / PWA</span>
            <span className="text-[11px] text-slate-400">Native Windows window container</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
              <Smartphone className="w-4 h-4" />
              <span>Mobile Platform</span>
            </div>
            <span className="text-lg font-mono font-bold text-slate-100">Android TWA / PWA</span>
            <span className="text-[11px] text-slate-400">Runs offline via Service Worker</span>
          </div>
        </div>

        {/* Workflow File Code */}
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>.github/workflows/build-and-release.yml</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Workflow</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-y-auto max-h-56 select-all">
            {workflowCode}
          </pre>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-slate-950"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
