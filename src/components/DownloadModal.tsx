import React, { useEffect } from 'react';
import { X, Download, ShieldCheck, Zap, Laptop, CheckCircle2, Sparkles, Terminal } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, version }) => {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-['Barlow_Condensed']"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl flex flex-col text-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black uppercase tracking-wider text-slate-900 leading-tight">
                  Download HexCards Desktop
                </h3>
                <span className="deadlock-badge px-1.5 py-0.2 text-[9.5px] text-emerald-800 bg-emerald-50 border-emerald-300 font-bold">
                  <span>WINDOWS 10/11</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Anti-Slop League Companion • Instant LCU Auto-Import • Zero RAM Bloat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Close [Esc]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto font-sans">
          
          {/* Primary Action Card */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col gap-3">
            <div>
              <span className="text-xs font-black uppercase text-emerald-800 font-['Barlow_Condensed'] tracking-wider block">
                Official Release v1.0.4
              </span>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                Includes the embedded Riot LCU connector. No terminal commands, no Node.js required—just launch and play.
              </p>
            </div>

            <a
              href="https://github.com/omeaga1/hexcards/releases/download/v1.0.4/HexCards-Setup-1.0.4.exe"
              download="HexCards-Setup-1.0.4.exe"
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-['Barlow_Condensed'] font-black uppercase text-sm sm:text-base tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span>Download HexCards for Windows (.exe)</span>
            </a>

            <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-1 border-t border-emerald-200/60 font-mono">
              <span>Size: ~117 MB</span>
              <span>Architecture: x64 Windows</span>
              <span>Updated: Patch {version}</span>
            </div>
          </div>

          {/* Comparison / Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1 font-['Barlow_Condensed'] uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Vanguard Safe</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Uses official Riot LCU out-of-game REST API. Zero memory injection, zero overlays hooks.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1 font-['Barlow_Condensed'] uppercase tracking-wide">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Auto-Client Sync</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Detects your locked-in champion in champ select and syncs your in-game shop items in 1 click.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1 font-['Barlow_Condensed'] uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Ads or Slop</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                No video ads, no subscription popups, and no background telemetry hogging your CPU.
              </p>
            </div>
          </div>

          {/* Direct Instructions */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <span className="font-bold text-slate-800 font-['Barlow_Condensed'] uppercase tracking-wider block">
              Quick Setup for You and Your Friends:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11.5px] leading-relaxed">
              <li>Download either the <strong>Installer</strong> or <strong>Portable</strong> executable above.</li>
              <li>Open League of Legends and launch HexCards.</li>
              <li>HexCards will instantly light up green with <strong>"Live Session Connected"</strong>.</li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="font-['Barlow_Condensed'] uppercase">Compatible with Summoner's Rift & ARAM</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 transition-colors uppercase text-[11px] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
