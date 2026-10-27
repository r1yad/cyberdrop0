import React, { useEffect, useRef, useState } from 'react';
import {
  Wifi,
  Bluetooth,
  Smartphone,
  Laptop,
  Monitor,
  Share2,
  Radio,
  RefreshCw,
  QrCode,
  KeyRound,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { DevicePeer, UserDeviceProfile } from '../types/transfer';

interface RadarSweepProps {
  myProfile: UserDeviceProfile;
  discoveredPeers: DevicePeer[];
  onSelectPeer: (peer: DevicePeer) => void;
  onOpenQR: () => void;
  onOpenCodePair: () => void;
  onScanBluetooth: () => void;
  onRefreshScan: () => void;
  isScanning: boolean;
}

export const RadarSweep: React.FC<RadarSweepProps> = ({
  myProfile,
  discoveredPeers,
  onSelectPeer,
  onOpenQR,
  onOpenCodePair,
  onScanBluetooth,
  onRefreshScan,
  isScanning,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredPeer, setHoveredPeer] = useState<DevicePeer | null>(null);
  const [sweepAngle, setSweepAngle] = useState(0);

  // Radar sweep animation on HTML5 Canvas
  useEffect(() => {
    let animationFrameId: number;
    let angle = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 15;

      ctx.clearRect(0, 0, width, height);

      // 1. Concentric distance rings
      const rings = [0.25, 0.5, 0.75, 1.0];
      rings.forEach((scale, i) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * scale, 0, Math.PI * 2);
        ctx.strokeStyle = i === rings.length - 1 ? 'rgba(0, 240, 255, 0.35)' : 'rgba(0, 240, 255, 0.12)';
        ctx.lineWidth = i === rings.length - 1 ? 1.5 : 1;
        ctx.setLineDash(i % 2 === 1 ? [4, 6] : []);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ring distance text labels
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`${(scale * 30).toFixed(0)}m`, centerX + 6, centerY - radius * scale + 12);
      });

      // 2. Crosshair grid lines
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 3. Diagonal secondary lines
      ctx.beginPath();
      const diag = radius * 0.7071;
      ctx.moveTo(centerX - diag, centerY - diag);
      ctx.lineTo(centerX + diag, centerY + diag);
      ctx.moveTo(centerX - diag, centerY + diag);
      ctx.lineTo(centerX + diag, centerY - diag);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
      ctx.stroke();

      // 4. Rotating sweep sector
      if (isScanning) {
        angle = (angle + 0.025) % (Math.PI * 2);
        setSweepAngle(angle);

        // Sweep cone with gradient
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle - 0.45, angle);
        ctx.closePath();

        const sweepGradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
        sweepGradient.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
        sweepGradient.addColorStop(0.7, 'rgba(0, 240, 255, 0.1)');
        sweepGradient.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
        ctx.fillStyle = sweepGradient;
        ctx.fill();

        // Sharp leading sweep line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isScanning]);

  const getPlatformIcon = (platform: string, className: string = 'w-4 h-4') => {
    switch (platform) {
      case 'windows':
        return <Monitor className={className} />;
      case 'mac':
        return <Laptop className={className} />;
      case 'android':
      case 'ios':
        return <Smartphone className={className} />;
      default:
        return <Monitor className={className} />;
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Radar Main Console Container */}
      <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center p-4">
        {/* Outer Hex/Circular Frame */}
        <div className="absolute inset-2 sm:inset-4 rounded-full border border-cyan-500/20 bg-gradient-to-b from-[#0a1224] via-[#070b14] to-[#040810] shadow-[0_0_50px_rgba(0,240,255,0.06)]" />

        {/* Outer Compass Degree Ticks */}
        <div className="absolute inset-4 rounded-full border border-cyan-500/10 pointer-events-none flex items-center justify-center">
          <div className="absolute top-2 text-[10px] font-mono text-cyan-400/50">000° N</div>
          <div className="absolute bottom-2 text-[10px] font-mono text-cyan-400/50">180° S</div>
          <div className="absolute right-2 text-[10px] font-mono text-cyan-400/50">090° E</div>
          <div className="absolute left-2 text-[10px] font-mono text-cyan-400/50">270° W</div>
        </div>

        {/* HTML5 Canvas for Radar Lines & Rotating Sweep */}
        <canvas
          ref={canvasRef}
          width={560}
          height={560}
          className="relative z-10 w-full h-full max-w-[560px] max-h-[560px]"
        />

        {/* Center Node: Self Device */}
        <div className="absolute z-20 flex flex-col items-center pointer-events-none">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-cyan-950/80 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.6)]">
            <Radio className="w-6 h-6 text-cyan-300 animate-pulse" />
            {/* Ambient Pulse Ripple */}
            <span className="absolute inset-0 rounded-full border border-cyan-400/60 animate-ping opacity-75" />
          </div>
          <div className="mt-1.5 px-2.5 py-0.5 rounded bg-slate-900/90 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 font-semibold tracking-wide whitespace-nowrap shadow-lg">
            {myProfile.name} (YOU)
          </div>
        </div>

        {/* Discovered Peer Blips Placed Around Center */}
        {discoveredPeers.map((peer, index) => {
          // Calculate polar position based on index or peer id
          const total = Math.max(discoveredPeers.length, 3);
          const angle = (index * (2 * Math.PI / total)) + 0.6;
          // Scale distance by signal strength: closer = stronger signal
          const distancePercent = Math.max(0.3, 0.85 - (peer.signalStrength / 200));

          const topPercent = 50 + Math.sin(angle) * distancePercent * 40;
          const leftPercent = 50 + Math.cos(angle) * distancePercent * 40;

          const isConnected = peer.status === 'connected';

          return (
            <div
              key={peer.id}
              style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
            >
              <button
                type="button"
                onClick={() => onSelectPeer(peer)}
                onMouseEnter={() => setHoveredPeer(peer)}
                onMouseLeave={() => setHoveredPeer(null)}
                className={`group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isConnected
                    ? 'bg-emerald-950/90 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-900/90 border border-cyan-400/60 text-cyan-300 hover:border-cyan-300 hover:scale-110 hover:shadow-[0_0_25px_rgba(0,240,255,0.7)]'
                }`}
                title={`Click to send file to ${peer.name}`}
              >
                {getPlatformIcon(peer.platform, 'w-5 h-5')}

                {/* Status Dot */}
                <span
                  className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 flex items-center justify-center ${
                    peer.protocol === 'bluetooth' ? 'bg-indigo-500' : 'bg-emerald-400'
                  }`}
                />

                {/* Subtle Ping Wave on node */}
                <span className="absolute inset-0 rounded-full border border-cyan-400/40 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all" />
              </button>

              {/* Peer Label & Signal pill */}
              <div className="mt-1 text-center whitespace-nowrap">
                <div className="px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700/80 text-[10px] font-medium text-slate-200">
                  {peer.name}
                </div>
                <div className="flex items-center justify-center gap-1 mt-0.5 text-[9px] font-mono text-cyan-400/80">
                  {peer.protocol === 'bluetooth' ? (
                    <Bluetooth className="w-2.5 h-2.5 text-indigo-400" />
                  ) : (
                    <Wifi className="w-2.5 h-2.5 text-emerald-400" />
                  )}
                  <span>{peer.signalStrength}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Radar Control Strip */}
      <div className="w-full max-w-2xl px-4 py-3 mt-1 flex flex-wrap items-center justify-between gap-3 bg-[#0d1527]/90 rounded-xl border border-cyan-500/20 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Radio className={`w-3.5 h-3.5 ${isScanning ? 'animate-pulse text-cyan-400' : 'text-slate-500'}`} />
            <span>{isScanning ? 'RADAR ACTIVE' : 'SCAN PAUSED'}</span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-400 font-semibold">{discoveredPeers.length} PEERS</span>
          </div>

          <button
            type="button"
            onClick={onRefreshScan}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title="Scan for new local devices"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Pairing Shortcut Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onScanBluetooth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-xs font-medium text-indigo-200 transition-colors whitespace-nowrap"
          >
            <Bluetooth className="w-3.5 h-3.5 text-indigo-400" />
            <span>BLE Device</span>
          </button>

          <button
            type="button"
            onClick={onOpenCodePair}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pair Code</span>
          </button>

          <button
            type="button"
            onClick={onOpenQR}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-slate-950 transition-colors shadow-sm whitespace-nowrap"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>My QR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
