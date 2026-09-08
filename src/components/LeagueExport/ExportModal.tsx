import React, { useState, useEffect } from 'react';
import { ChampionDetail, TacticalGuide, ItemData } from '../../types';
import { 
  generateRiotItemSet, 
  copyItemSetToClipboard, 
  downloadItemSetFile, 
  checkBridgeStatus, 
  autoImportToLeague,
  RiotItemSet 
} from '../../services/leagueExportService';
import { getItemIconUrl, getChampionIconUrl } from '../../services/ddragon';
import { 
  X, 
  Check, 
  Copy, 
  Download, 
  Zap, 
  Shield, 
  Sparkles, 
  ExternalLink, 
  Terminal, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface ExportModalProps {
  version: string;
  champion: ChampionDetail;
  tactics: TacticalGuide;
  allItems: Record<string, ItemData>;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  version,
  champion,
  tactics,
  allItems,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'bridge' | 'clipboard' | 'file'>('bridge');
  const [copied, setCopied] = useState<boolean>(false);
  const [bridgeStatus, setBridgeStatus] = useState<{
    connected: boolean;
    summonerName?: string;
    port?: string;
  }>({ connected: false });
  const [importing, setImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);

  const itemSet: RiotItemSet = React.useMemo(() => {
    return generateRiotItemSet(champion, tactics, allItems);
  }, [champion, tactics, allItems]);

  // Poll bridge status when modal is open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function check() {
      const status = await checkBridgeStatus();
      if (isMounted) {
        setBridgeStatus(status);
      }
    }
    check();
    const interval = setInterval(check, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const ok = await copyItemSetToClipboard(itemSet);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const filename = `${champion.name}_Deadlock_Deck.json`;
    downloadItemSetFile(itemSet, filename);
  };

  const handleAutoImport = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await autoImportToLeague(itemSet, tactics.runeKit);
      setImportResult(res);
    } catch (err: any) {
      setImportResult({
        success: false,
        message: err.message || 'Auto-import failed.'
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="deadlock-hatched relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl flex flex-col font-['Barlow_Condensed']"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-emerald-500 overflow-hidden bg-slate-100 flex-shrink-0 shadow-xs">
              <img
                src={getChampionIconUrl(version, champion.image.full)}
                alt={champion.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider leading-none">
                  {champion.name} <span className="text-emerald-600">Item Set Exporter</span>
                </h3>
                <span className="deadlock-badge px-1.5 py-0.5 text-[9.5px] text-emerald-800 bg-emerald-50 border-emerald-300">
                  <span>{tactics.role}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans font-medium">
                Official Riot In-Game Shop Item Set & Rune Ingestion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Close [Esc]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Bridge Connection Pill */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${bridgeStatus.connected ? 'bg-emerald-500 shadow-xs' : 'bg-slate-400'}`} />
            <span className="font-bold uppercase tracking-wider text-[11px]">
              {bridgeStatus.connected ? (
                <span className="text-emerald-800">
                  League Client Linked: <strong className="text-slate-900">{bridgeStatus.summonerName || 'Active'}</strong>
                </span>
              ) : (
                <span className="text-slate-500">
                  Desktop Bridge: <strong className="text-slate-600">Offline</strong> (Run <code className="text-emerald-700 font-mono px-1 py-0.5 bg-slate-200 rounded">npm run bridge</code> for 1-click injection)
                </span>
              )}
            </span>
          </div>

          <div className="text-[10.5px] text-slate-500 font-sans">
            Vanguard Safe • Riot LCU API
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-4 pt-2 bg-slate-100 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('bridge')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t font-black uppercase text-xs tracking-wider transition-all cursor-pointer border-t border-x ${
              activeTab === 'bridge'
                ? 'bg-white text-emerald-700 border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1. Auto-Import (Live Client)</span>
          </button>

          <button
            onClick={() => setActiveTab('clipboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t font-black uppercase text-xs tracking-wider transition-all cursor-pointer border-t border-x ${
              activeTab === 'clipboard'
                ? 'bg-white text-emerald-700 border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>2. Copy Riot JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t font-black uppercase text-xs tracking-wider transition-all cursor-pointer border-t border-x ${
              activeTab === 'file'
                ? 'bg-white text-emerald-700 border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>3. Download .json</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 max-h-[60vh] bg-white">
          {/* Tab 1: Live Bridge Auto-Import */}
          {activeTab === 'bridge' && (
            <div className="space-y-3 font-sans">
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <h4 className="font-['Barlow_Condensed'] font-black uppercase text-sm text-slate-900 tracking-wide mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  Direct In-Game Shop & Rune Injection
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Pushes this complete Deadlock deck (Starters, Core 1-2-3, Situational Counters, and Consumables) plus the full Rune Kit directly into your open League Client with zero typing or clicking inside the client.
                </p>
              </div>

              {bridgeStatus.connected ? (
                <div className="space-y-3">
                  <button
                    onClick={handleAutoImport}
                    disabled={importing}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-['Barlow_Condensed'] font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>{importing ? 'Injecting into League Client...' : `INJECT ITEM SET & RUNES FOR ${champion.name.toUpperCase()}`}</span>
                  </button>

                  {importResult && (
                    <div className="space-y-1.5">
                      <div className={`p-2.5 rounded border text-xs flex items-center gap-2 ${
                        importResult.success 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                          : 'bg-rose-50 border-rose-300 text-rose-900'
                      }`}>
                        {importResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                        <span>{importResult.message}</span>
                      </div>
                      {importResult.success && (
                        <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 leading-snug">
                          💡 <strong>Shop Display Tip:</strong> If your in-game shop ever displays shifted to the left or cut off, simply click & drag the bottom-right corner of the in-game shop window to resize it slightly. League will immediately re-render and snap all item columns back into place!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-slate-900 uppercase tracking-wider font-['Barlow_Condensed'] flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      Connect HexCards to League of Legends
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded font-sans">
                      Setup Required
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Web browsers cannot directly inspect local game client processes. Download the standalone <strong>HexCards Windows Companion (.exe)</strong> to enable <strong>1-click in-game shop injection</strong>, <strong>automatic Champion Select detection</strong>, and <strong>live lane opponent intelligence</strong>.
                  </p>

                  <a
                    href="https://github.com/omeaga1/hexcards/releases/download/v1.0.0/HexCards-Setup-1.0.0.exe"
                    download="HexCards-Setup-1.0.0.exe"
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-['Barlow_Condensed'] font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download HexCards Companion for Windows (.exe)</span>
                  </a>

                  <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-sans">
                    <span>100% Vanguard Safe • Zero Ads • Riot LCU Loopback</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('clipboard')}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Or copy JSON manually ➔
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Clipboard Paste Guide */}
          {activeTab === 'clipboard' && (
            <div className="space-y-3 font-sans">
              <button
                onClick={handleCopy}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-['Barlow_Condensed'] font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-600" />}
                <span>{copied ? 'COPIED RIOT ITEM SET TO CLIPBOARD' : 'COPY RIOT ITEM SET JSON TO CLIPBOARD'}</span>
              </button>

              {/* 3-Step Guide */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-['Barlow_Condensed']">
                  How to Import into League Client (3 Seconds):
                </div>
                <ol className="text-xs text-slate-700 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Open League of Legends and click the <strong>Collection</strong> tab (backpack icon).</li>
                  <li>Click <strong>Items</strong> in the top sub-bar.</li>
                  <li>Click the <strong>"Import item set"</strong> button, select <strong>"Paste copied set"</strong>, and press <kbd className="px-1 py-0.5 rounded bg-slate-200 border border-slate-300 text-slate-900 font-mono text-[10px]">Ctrl + V</kbd>.</li>
                </ol>
                <div className="text-[10.5px] text-emerald-700 font-medium pt-1 border-t border-slate-200">
                  The complete Deadlock Deck will immediately appear in your in-game shop whenever you play {champion.name}!
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: File Download */}
          {activeTab === 'file' && (
            <div className="space-y-3 font-sans">
              <button
                onClick={handleDownload}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-['Barlow_Condensed'] font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>DOWNLOAD {champion.name.toUpperCase()}_ITEMSET.JSON</span>
              </button>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700 leading-relaxed">
                <div className="font-bold uppercase tracking-wider text-emerald-800 font-['Barlow_Condensed']">
                  Permanent Game Config Placement:
                </div>
                <p>
                  Place this downloaded file directly into your League configuration folder:
                </p>
                <div className="p-2 rounded bg-white border border-slate-300 font-mono text-[11px] text-amber-800 select-all shadow-2xs">
                  C:\Riot Games\League of Legends\Config\Champions\{champion.name}\ItemSets.json
                </div>
                <p className="text-[10.5px] text-slate-500">
                  League loads this file automatically in-game without needing any client imports.
                </p>
              </div>
            </div>
          )}

          {/* In-Game Shop Preview Box */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-['Barlow_Condensed']">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                In-Game Shop Preview ({itemSet.blocks.length} Sections):
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">
                {itemSet.title}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {itemSet.blocks.map((block, i) => (
                <div key={i} className="p-2 rounded bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-black uppercase text-slate-800 font-['Barlow_Condensed'] tracking-wide mb-1 truncate">
                    {block.type}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {block.items.map((it, idx) => {
                      const data = allItems[it.id];
                      return (
                        <div
                          key={idx}
                          title={`${data?.name || it.id} (${data?.gold?.total || ''}g)`}
                          className="w-7 h-7 rounded border border-slate-300 overflow-hidden bg-slate-100 flex-shrink-0"
                        >
                          <img
                            src={getItemIconUrl(version, it.id)}
                            alt={it.id}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Compatible with Summoner's Rift & ARAM</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold uppercase text-[11px] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
