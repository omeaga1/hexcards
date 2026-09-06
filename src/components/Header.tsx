import React, { useEffect, useRef, useState } from 'react';
import { Search, BookOpen, Shield, Zap, X, ChevronDown, ChevronUp, Download, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { ChampionSummary } from '../types';
import { getChampionIconUrl } from '../services/ddragon';
import { useDevice } from '../hooks/useDevice';

interface HeaderProps {
  version: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRole: string;
  onSelectRole: (role: string) => void;
  favorites: string[];
  onSelectChampion: (champId: string) => void;
  onOpenGlossary: () => void;
  allChampions: Record<string, ChampionSummary>;
  selectedChampionId: string;
  newPatchAvailable?: string | null;
  onSyncPatch?: () => void;
  onOpenExportModal?: () => void;
  onOpenDownloadModal?: () => void;
  isBridgeConnected?: boolean;
  isSelectorExpanded?: boolean;
  onToggleSelector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  version,
  searchQuery,
  onSearchChange,
  selectedRole,
  onSelectRole,
  favorites,
  onSelectChampion,
  onOpenGlossary,
  allChampions,
  selectedChampionId,
  newPatchAvailable,
  onSyncPatch,
  onOpenExportModal,
  onOpenDownloadModal,
  isBridgeConnected = false,
  isSelectorExpanded = false,
  onToggleSelector
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isMobile } = useDevice();
  const isDesktop = typeof window !== 'undefined' && Boolean(window.electronAPI?.isDesktop);

  const [updateInfo, setUpdateInfo] = useState<{
    status: 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error';
    version?: string;
    percent?: number;
    message?: string;
  }>({ status: 'idle' });

  useEffect(() => {
    if (!isDesktop || !window.electronAPI?.onUpdateStatus) return;
    const unsubscribe = window.electronAPI.onUpdateStatus((data) => {
      setUpdateInfo(data);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isDesktop]);

  const handleCheckForUpdates = async () => {
    if (!window.electronAPI?.checkForUpdates) return;
    setUpdateInfo({ status: 'checking' });
    try {
      const res = await window.electronAPI.checkForUpdates();
      if (res.status === 'ok') {
        setUpdateInfo({ status: 'idle', message: 'Up to date ✓' });
        setTimeout(() => setUpdateInfo({ status: 'idle' }), 3500);
      } else {
        setUpdateInfo({ status: 'idle', message: 'Checked' });
        setTimeout(() => setUpdateInfo({ status: 'idle' }), 3000);
      }
    } catch {
      setUpdateInfo({ status: 'idle' });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const q = searchQuery.toLowerCase().trim();
    const matchingChamps = Object.values(allChampions).filter(
      (c) => q === '' || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (matchingChamps.length === 0) return;
      const currentIndex = matchingChamps.findIndex((c) => c.id === selectedChampionId);
      const nextIndex = (currentIndex + 1) % matchingChamps.length;
      onSelectChampion(matchingChamps[nextIndex].id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (matchingChamps.length === 0) return;
      const currentIndex = matchingChamps.findIndex((c) => c.id === selectedChampionId);
      const prevIndex = (currentIndex - 1 + matchingChamps.length) % matchingChamps.length;
      onSelectChampion(matchingChamps[prevIndex].id);
    } else if (e.key === 'Enter') {
      if (matchingChamps.length > 0) {
        const match = matchingChamps.find((c) => c.id === selectedChampionId) || matchingChamps[0];
        onSelectChampion(match.id);
        onSearchChange('');
        searchInputRef.current?.blur();
      }
    }
  };

  const roles = [
    { id: 'All', label: 'All' },
    { id: 'Top', label: 'Top' },
    { id: 'Jungle', label: 'Jgl' },
    { id: 'Mid', label: 'Mid' },
    { id: 'ADC', label: 'ADC' },
    { id: 'Support', label: 'Supp' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs font-['Barlow_Condensed'] select-none">
      <div className="w-full px-2 sm:px-4 py-1.5 flex items-center justify-between gap-1.5 sm:gap-2">
        
        {/* Left: Brand + Patch + Champion Grid Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div 
            onClick={() => onSelectRole('All')}
            className="flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-6 h-6 rounded bg-emerald-50 border border-emerald-500/60 flex items-center justify-center shadow-xs">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h1 className="text-base font-black tracking-wider text-slate-900 uppercase leading-none">
              HEX<span className="text-emerald-600">CARDS</span>
            </h1>
          </div>

          {newPatchAvailable ? (
            <button
              onClick={onSyncPatch}
              className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 transition-all cursor-pointer shadow-xs animate-pulse"
              title={`New Patch ${newPatchAvailable} available. Click to sync.`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{isMobile ? newPatchAvailable : `PATCH ${newPatchAvailable}`}</span>
            </button>
          ) : (
            <div 
              className="hidden sm:flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700"
              title={`Synced with Riot Data Dragon v${version}.`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>v{version}</span>
            </div>
          )}

          {/* Quick Champion Picker Trigger Button */}
          {onToggleSelector && (
            <button
              onClick={onToggleSelector}
              className={`px-2 py-0.5 rounded text-[10.5px] font-black uppercase tracking-wider border flex items-center gap-1 transition-all cursor-pointer touch-manipulation active:scale-95 ${
                isSelectorExpanded
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:text-emerald-700 border-slate-300 hover:border-emerald-400'
              }`}
            >
              <span>CHAMPS</span>
              {isSelectorExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {/* Roles Pills (Desktop Only) */}
          <div className="hidden md:flex items-center gap-1">
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  onSelectRole(r.id);
                  if (onToggleSelector && !isSelectorExpanded && r.id !== 'All') {
                    onToggleSelector();
                  }
                }}
                className={`px-1.5 py-0.2 rounded text-[10px] font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                  selectedRole === r.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="relative flex-1 min-w-[75px] max-w-[140px] sm:max-w-none sm:w-60 md:w-72">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={isMobile ? "Search..." : "Search champion... ('/')"}
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (e.target.value && onToggleSelector && !isSelectorExpanded) {
                onToggleSelector();
              }
            }}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-6 sm:pl-7 pr-6 py-0.5 text-xs rounded bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer touch-manipulation"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block absolute right-1.5 top-1/2 -translate-y-1/2 text-[8.5px] bg-slate-200 text-slate-500 px-1 py-0 rounded border border-slate-300">
              /
            </kbd>
          )}
        </div>

        {/* Right: Favorites Quick Deck & Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Quick Deck Chips (Desktop Only) */}
          <div className="hidden xl:flex items-center gap-1">
            {favorites.slice(0, 5).map(champId => {
              const champ = allChampions[champId];
              if (!champ) return null;
              const isSelected = selectedChampionId === champId;
              return (
                <button
                  key={champId}
                  onClick={() => onSelectChampion(champId)}
                  className={`flex items-center gap-1 px-1.5 py-0.2 rounded border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs' 
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-400 text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <img
                    src={getChampionIconUrl(version, champ.image.full)}
                    alt={champ.name}
                    className="w-3.5 h-3.5 rounded-full object-cover"
                    loading="lazy"
                  />
                  <span className="text-[9.5px] whitespace-nowrap font-bold">{champ.name}</span>
                </button>
              );
            })}
          </div>

          {/* Export Button */}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className={`p-1 sm:px-2 sm:py-0.5 rounded border text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-xs touch-manipulation ${
                isBridgeConnected
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
              title="Export item set and runes to League Client"
            >
              <Zap className={`w-3 h-3 ${isBridgeConnected ? 'text-emerald-600 fill-emerald-600' : 'text-amber-500'}`} />
              <span className="hidden sm:inline">{isBridgeConnected ? 'Linked' : 'Export'}</span>
            </button>
          )}

          {/* Glossary Button */}
          <button
            onClick={onOpenGlossary}
            className="p-1 sm:px-2 sm:py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 text-[10px] sm:text-[10.5px] font-bold uppercase flex items-center gap-1 transition-all cursor-pointer shadow-xs touch-manipulation"
            title="LoL Terminology Glossary"
          >
            <BookOpen className="w-3 h-3 text-emerald-600" />
            <span className="hidden sm:inline">Glossary</span>
          </button>

          {/* Desktop Update Status Notification OR Web Download Button */}
          {isDesktop ? (
            <div>
              {updateInfo.status === 'downloaded' ? (
                <button
                  onClick={() => window.electronAPI?.installUpdate?.()}
                  className="px-2.5 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md animate-pulse active:scale-95"
                  title="Click to restart HexCards and apply the latest update"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>Update Ready • Restart</span>
                </button>
              ) : updateInfo.status === 'downloading' ? (
                <div className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 font-mono">
                  <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
                  <span>Updating {updateInfo.percent || 0}%</span>
                </div>
              ) : updateInfo.status === 'checking' ? (
                <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                  <span>Checking...</span>
                </div>
              ) : (
                <button
                  onClick={handleCheckForUpdates}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="HexCards Desktop Companion • Click to check for updates"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{updateInfo.message || 'Check Updates'}</span>
                </button>
              )}
            </div>
          ) : onOpenDownloadModal ? (
            <button
              onClick={onOpenDownloadModal}
              className="px-2 sm:px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Download standalone Windows desktop executable (.exe)"
            >
              <Download className="w-3 h-3" />
              <span>{isMobile ? 'App' : 'Download .exe'}</span>
            </button>
          ) : null}
        </div>

      </div>
    </header>
  );
};
