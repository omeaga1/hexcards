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
        className="deadlock-frame retro-futuristic-card relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-xl border border-[#26433a] bg-[#13221c] shadow-2xl flex flex-col font-['Barlow_Condensed'] text-[#e2e5b8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#26433a] bg-[#13221c]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-[#2dd5b7] overflow-hidden bg-slate-900 flex-shrink-0 shadow-xs">
              <img
                src={getChampionIconUrl(version, champion.image.full)}
                alt={champion.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-[#e2e5b8] uppercase tracking-wider leading-none">
                  {champion.name} <span className="text-[#2dd5b7]">Item Set Exporter</span>
                </h3>
                <span className="deadlock-badge px-1.5 py-0.5 text-[9.5px] text-[#2dd5b7] bg-[#163026] border-[#2dd5b7]/50">
                  <span>{tactics.role}</span>
                </span>
              </div>
              <p className="text-[11px] text-[#769382] font-sans font-medium">
                Official Riot In-Game Shop Item Set & Rune Ingestion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-[#162821] text-[#769382] hover:text-[#e2e5b8] flex items-center justify-center transition-colors cursor-pointer"
            title="Close [Esc]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Bridge Connection Pill */}
        <div className="px-4 py-2 border-b border-[#26433a] bg-[#0f1c17] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${bridgeStatus.connected ? 'bg-[#2dd5b7] shadow-xs shadow-[#2dd5b7]/40' : 'bg-[#53685b]'}`} />
            <span className="font-bold uppercase tracking-wider text-[11px]">
              {bridgeStatus.connected ? (
                <span className="text-[#2dd5b7]">
                  League Client Linked: <strong className="text-[#e2e5b8]">{bridgeStatus.summonerName || 'Active'}</strong>
                </span>
              ) : (
                <span className="text-[#769382]">
                  Desktop Bridge: <strong className="text-[#c1c497]">Offline</strong> (Run <code className="text-[#2dd5b7] font-mono px-1 py-0.5 bg-[#162821] border border-[#26433a] rounded">npm run bridge</code> for 1-click injection)
                </span>
              )}
            </span>
          </div>

          <div className="text-[10.5px] text-[#769382] font-sans">
            Vanguard Safe • Riot LCU API
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-4 pt-2 bg-[#0f1c17] border-b border-[#26433a]">
          <button
            onClick={() => setActiveTab('bridge')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t font-black uppercase text-xs tracking-wider transition-all cursor-pointer border-t border-x ${
              activeTab === 'bridge'
                ? 'bg-[#13221c] text-[#2dd5b7] border-[#26433a] shadow-2xs'
                : 'text-[#769382] hover:text-[#e2e5b8] border-transparent'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1. Auto-Import (Live Client)</span>
          </button>

          <button
            onClick={() => setActiveTab('clipboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t font-black uppercase text-xs tracking-wider transition-all cursor-pointer border-t border-x ${
              activeTab === 'clipboard'
                ? 'bg-[#13221c] text-[#2dd5b7] border-[#26433a] shadow-2xs'
                : 'text-[#769382] hover:text-[#e2e5b8] border-transparent'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>2. Copy Riot JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t font-black uppercase text-xs tracking-wider transition-all cursor-pointer border-t border-x ${
              activeTab === 'file'
                ? 'bg-[#13221c] text-[#2dd5b7] border-[#26433a] shadow-2xs'
                : 'text-[#769382] hover:text-[#e2e5b8] border-transparent'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>3. Download .json</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 max-h-[60vh] bg-[#13221c]">
          {/* Tab 1: Live Bridge Auto-Import */}
          {activeTab === 'bridge' && (
            <div className="space-y-3 font-sans">
              <div className="p-3 rounded-lg bg-[#163026] border border-[#2dd5b7]/40">
                <h4 className="font-['Barlow_Condensed'] font-black uppercase text-sm text-[#2dd5b7] tracking-wide mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#2dd5b7]" />
                  Direct In-Game Shop & Rune Injection
                </h4>
                <p className="text-xs text-[#c1c497] leading-relaxed">
                  Pushes this complete Deadlock deck (Starters, Core 1-2-3, Situational Counters, and Consumables) plus the full Rune Kit directly into your open League Client with zero typing or clicking inside the client.
                </p>
              </div>

              {bridgeStatus.connected ? (
                <div className="space-y-3">
                  <button
                    onClick={handleAutoImport}
                    disabled={importing}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#2dd5b7] hover:bg-[#26bba0] text-[#07120e] font-['Barlow_Condensed'] font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#2dd5b7]/20 disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>{importing ? 'Injecting into League Client...' : `INJECT ITEM SET & RUNES FOR ${champion.name.toUpperCase()}`}</span>
                  </button>

                  {importResult && (
                    <div className="space-y-1.5">
                      <div className={`p-2.5 rounded border text-xs flex items-center gap-2 ${
                        importResult.success 
                          ? 'bg-[#163026] border-[#2dd5b7] text-[#2dd5b7]' 
                          : 'bg-[#28131a] border-[#f43f5e] text-[#f43f5e]'
                      }`}>
                        {importResult.success ? <CheckCircle2 className="w-4 h-4 text-[#2dd5b7] flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-[#f43f5e] flex-shrink-0" />}
                        <span>{importResult.message}</span>
                      </div>
                      {importResult.success && (
                        <p className="text-[11px] text-[#769382] bg-[#0f1c17] border border-[#26433a] rounded px-2.5 py-1.5 leading-snug">
                          💡 <strong>Shop Display Tip:</strong> If your in-game shop ever displays shifted to the left or cut off, simply click & drag the bottom-right corner of the in-game shop window to resize it slightly. League will immediately re-render and snap all item columns back into place!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#14251f] border border-[#26433a] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-[#e2e5b8] uppercase tracking-wider font-['Barlow_Condensed'] flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#2dd5b7]" />
                      Connect HexCards to League of Legends
                    </div>
                    <span className="text-[10px] font-bold text-[#e5c736] bg-[#262413] border border-[#e5c736]/40 px-1.5 py-0.5 rounded font-sans">
                      Setup Required
                    </span>
                  </div>

                  <p className="text-xs text-[#c1c497] leading-relaxed font-sans">
                    Web browsers cannot directly inspect local game client processes. Download the standalone <strong>HexCards Windows Companion (.exe)</strong> to enable <strong>1-click in-game shop injection</strong>, <strong>automatic Champion Select detection</strong>, and <strong>live lane opponent intelligence</strong>.
                  </p>

                  <a
                    href="https://github.com/omeaga1/hexcards/releases/download/v1.0.0/HexCards-Setup-1.0.0.exe"
                    download="HexCards-Setup-1.0.0.exe"
                    className="py-3 px-4 rounded-xl bg-[#2dd5b7] hover:bg-[#26bba0] text-[#07120e] font-['Barlow_Condensed'] font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download HexCards Companion for Windows (.exe)</span>
                  </a>

                  <div className="pt-2 border-t border-[#26433a] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#769382] font-sans">
                    <span>100% Vanguard Safe • Zero Ads • Riot LCU Loopback</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('clipboard')}
                      className="text-[#2dd5b7] font-bold hover:underline cursor-pointer"
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
                className="w-full py-2.5 px-4 rounded-lg bg-[#162821] hover:bg-[#192e26] border border-[#26433a] text-[#e2e5b8] font-['Barlow_Condensed'] font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4 text-[#2dd5b7]" /> : <Copy className="w-4 h-4 text-[#2dd5b7]" />}
                <span>{copied ? 'COPIED RIOT ITEM SET TO CLIPBOARD' : 'COPY RIOT ITEM SET JSON TO CLIPBOARD'}</span>
              </button>

              {/* 3-Step Guide */}
              <div className="p-3 rounded-lg bg-[#0f1c17] border border-[#26433a] space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#2dd5b7] font-['Barlow_Condensed']">
                  How to Import into League Client (3 Seconds):
                </div>
                <ol className="text-xs text-[#c1c497] space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Open League of Legends and click the <strong>Collection</strong> tab (backpack icon).</li>
                  <li>Click <strong>Items</strong> in the top sub-bar.</li>
                  <li>Click the <strong>"Import item set"</strong> button, select <strong>"Paste copied set"</strong>, and press <kbd className="px-1 py-0.5 rounded bg-[#172c23] border border-[#26433a] text-[#8cd3cb] font-mono text-[10px]">Ctrl + V</kbd>.</li>
                </ol>
                <div className="text-[10.5px] text-[#2dd5b7] font-medium pt-1 border-t border-[#26433a]">
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
                className="w-full py-2.5 px-4 rounded-lg bg-[#162821] hover:bg-[#192e26] border border-[#26433a] text-[#e2e5b8] font-['Barlow_Condensed'] font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#2dd5b7]" />
                <span>DOWNLOAD {champion.name.toUpperCase()}_ITEMSET.JSON</span>
              </button>

              <div className="p-3 rounded-lg bg-[#0f1c17] border border-[#26433a] space-y-1.5 text-xs text-[#c1c497] leading-relaxed">
                <div className="font-bold uppercase tracking-wider text-[#2dd5b7] font-['Barlow_Condensed']">
                  Permanent Game Config Placement:
                </div>
                <p>
                  Place this downloaded file directly into your League configuration folder:
                </p>
                <div className="p-2 rounded bg-[#13221c] border border-[#26433a] font-mono text-[11px] text-[#e5c736] select-all shadow-2xs">
                  C:\Riot Games\League of Legends\Config\Champions\{champion.name}\ItemSets.json
                </div>
                <p className="text-[10.5px] text-[#769382]">
                  League loads this file automatically in-game without needing any client imports.
                </p>
              </div>
            </div>
          )}

          {/* In-Game Shop Preview Box */}
          <div className="p-3 rounded-lg bg-[#0f1c17] border border-[#26433a] space-y-2">
            <div className="flex items-center justify-between text-xs font-['Barlow_Condensed']">
              <span className="text-[11px] font-black uppercase text-[#769382] tracking-wider">
                In-Game Shop Preview ({itemSet.blocks.length} Sections):
              </span>
              <span className="text-[10px] text-[#2dd5b7] font-mono font-bold">
                {itemSet.title}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {itemSet.blocks.map((block, i) => (
                <div key={i} className="p-2 rounded bg-[#13221c] border border-[#26433a] shadow-2xs">
                  <div className="text-[10px] font-black uppercase text-[#e2e5b8] font-['Barlow_Condensed'] tracking-wide mb-1 truncate">
                    {block.type}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {block.items.map((it, idx) => {
                      const data = allItems[it.id];
                      return (
                        <div
                          key={idx}
                          title={`${data?.name || it.id} (${data?.gold?.total || ''}g)`}
                          className="w-7 h-7 rounded border border-[#26433a] overflow-hidden bg-[#0d1713] flex-shrink-0"
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
        <div className="px-4 py-2.5 border-t border-[#26433a] bg-[#13221c] flex items-center justify-between text-xs text-[#769382]">
          <span>Compatible with Summoner's Rift & ARAM</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#162821] hover:bg-[#192e26] text-[#e2e5b8] border border-[#26433a] font-bold uppercase text-[11px] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
