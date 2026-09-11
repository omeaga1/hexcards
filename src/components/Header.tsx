import React, { useEffect, useRef, useState } from 'react';
import { Search, BookOpen, Shield, Zap, X, ChevronDown, ChevronUp, Download, RefreshCw, Sparkles, ShieldCheck, Settings } from 'lucide-react';
import { ChampionSummary } from '../types';
import { getChampionIconUrl } from '../services/ddragon';
import { useDevice } from '../hooks/useDevice';
import { useTheme } from '../context/ThemeContext';
import { useZoom } from '../context/ZoomContext';

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
  onOpenLanding?: () => void;
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
  onOpenLanding,
  isBridgeConnected = false,
  isSelectorExpanded = false,
  onToggleSelector
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isMobile } = useDevice();
  const isDesktop = typeof window !== 'undefined' && Boolean(window.electronAPI?.isDesktop);
  const { setIsThemeModalOpen, currentThemeConfig } = useTheme();
  const { zoomPercent, zoomIn, zoomOut, resetZoom, isMinZoom, isMaxZoom, minZoomPercent, maxZoomPercent } = useZoom();

  const [updateInfo, setUpdateInfo] = useState<{
    status: 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error';
    version?: string;
    percent?: number;
    message?: string;
  }>({ status: 'idle' });

  useEffect(() => {
    if (!isDesktop) return;

    // Check existing update status on mount
    if (window.electronAPI?.getUpdateStatus) {
      window.electronAPI.getUpdateStatus().then((status) => {
        if (status && (status.status === 'downloaded' || status.status === 'downloading' || status.status === 'available')) {
          setUpdateInfo(status as any);
        }
      }).catch(() => {});
    }

    if (!window.electronAPI?.onUpdateStatus) return;
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
        if (res.isNewer) {
          // Keep update button active persistently - do NOT reset to idle!
          setUpdateInfo({ status: 'available', percent: 0, version: res.version });
        } else {
          setUpdateInfo({ status: 'idle', message: `Up to date (v${res.currentVersion || ''}) ✓` });
          setTimeout(() => {
            setUpdateInfo((prev) => (prev.status === 'idle' ? { status: 'idle' } : prev));
          }, 3500);
        }
      } else if (res.status === 'dev') {
        setUpdateInfo({ status: 'idle', message: 'Dev Mode' });
        setTimeout(() => {
          setUpdateInfo((prev) => (prev.status === 'idle' ? { status: 'idle' } : prev));
        }, 3000);
      } else {
        setUpdateInfo({ status: 'idle', message: 'Check Failed' });
        setTimeout(() => {
          setUpdateInfo((prev) => (prev.status === 'idle' ? { status: 'idle' } : prev));
        }, 3000);
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
    <header className="sticky top-0 z-40 w-full bg-[#13221c]/95 backdrop-blur-md border-b border-[#26433a] shadow-xs font-['Barlow_Condensed'] select-none">
      <div className="w-full px-2.5 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 lg:gap-3">
        
        {/* Left: Brand + Patch + Champion Grid Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <div 
            onClick={() => onSelectRole('All')}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#162821] border border-[#2dd5b7]/60 flex items-center justify-center shadow-xs">
              <Shield className="w-4 h-4 text-[#2dd5b7]" />
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-wider text-[#e2e5b8] uppercase leading-none">
              HEX<span className="text-[#2dd5b7]">CARDS</span>
            </h1>
          </div>

          {newPatchAvailable ? (
            <button
              onClick={onSyncPatch}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#262413] border border-[#e5c736]/50 text-[#e5c736] hover:bg-[#322f18] transition-all cursor-pointer shadow-xs animate-pulse h-8"
              title={`New Patch ${newPatchAvailable} available. Click to sync.`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#e5c736]" />
              <span>{isMobile ? newPatchAvailable : `PATCH ${newPatchAvailable}`}</span>
            </button>
          ) : (
            <div 
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#162821] border border-[#26433a] text-[#2dd5b7] h-8"
              title={`Synced with Riot Data Dragon v${version}.`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#2dd5b7]" />
              <span>v{version}</span>
            </div>
          )}

          {/* Quick Champion Picker Trigger Button */}
          {onToggleSelector && (
            <button
              onClick={onToggleSelector}
              className={`h-8 px-3 sm:px-3.5 rounded-md text-xs sm:text-[13px] font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation active:scale-95 ${
                isSelectorExpanded
                  ? 'bg-[#2dd5b7] text-[#07120e] border-[#2dd5b7] shadow-xs'
                  : 'bg-[#162821] text-[#c1c497] hover:text-[#e2e5b8] border-[#26433a] hover:border-[#2dd5b7]/50'
              }`}
            >
              <span>CHAMPS</span>
              {isSelectorExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {/* Roles Pills (Wide Desktop Only) */}
          <div className="hidden 2xl:flex items-center gap-0.5">
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  onSelectRole(r.id);
                  if (onToggleSelector && !isSelectorExpanded && r.id !== 'All') {
                    onToggleSelector();
                  }
                }}
                className={`h-8 px-2 rounded-md text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer flex items-center justify-center ${
                  selectedRole === r.id
                    ? 'bg-[#2dd5b7] text-[#07120e] shadow-xs'
                    : 'bg-[#162821] hover:bg-[#192e26] text-[#c1c497] hover:text-[#e2e5b8] border border-[#26433a]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Search Bar + Favorite Champions Quick Deck */}
        <div className="flex items-center gap-2 lg:gap-2.5 flex-1 min-w-0 justify-start">
          {/* Search Input Container */}
          <div className="relative flex-shrink-0 w-36 xs:w-44 sm:w-52 md:w-56 lg:w-60 xl:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#769382]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={isMobile ? "Search..." : "Search champion... (/)"}
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (e.target.value && onToggleSelector && !isSelectorExpanded) {
                  onToggleSelector();
                }
              }}
              onKeyDown={handleSearchKeyDown}
              className="w-full h-8 sm:h-8.5 pl-8 sm:pl-9 pr-7 py-1 text-xs sm:text-sm rounded-md bg-[#0f1c17] border border-[#26433a] text-[#e2e5b8] placeholder-[#53685b] focus:outline-none focus:bg-[#13221c] focus:border-[#2dd5b7] focus:ring-1 focus:ring-[#2dd5b7] transition-all font-sans"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#769382] hover:text-[#e2e5b8] p-0.5 cursor-pointer touch-manipulation"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 text-[9.5px] bg-[#172c23] text-[#8cd3cb] px-1.5 py-0.5 rounded border border-[#26433a] font-mono leading-none pointer-events-none select-none">
                /
              </kbd>
            )}
          </div>

          {/* Quick Deck Champions (Beside Search Bar on Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 min-w-0 flex-nowrap overflow-hidden">
            {favorites.slice(0, 7).map((champId, idx) => {
              const champ = allChampions[champId];
              if (!champ) return null;
              const isSelected = selectedChampionId === champId;
              const responsiveClass = idx >= 5 ? 'hidden 2xl:flex' : idx >= 4 ? 'hidden xl:flex' : idx >= 3 ? 'hidden lg:flex' : 'flex';
              return (
                <button
                  key={champId}
                  onClick={() => onSelectChampion(champId)}
                  title={`Quick Deck: ${champ.name} • Click to view`}
                  className={`${responsiveClass} items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md border transition-all cursor-pointer flex-shrink-0 select-none ${
                    isSelected 
                      ? 'bg-[#1c392f] border-[#2dd5b7] text-[#2dd5b7] font-black shadow-xs ring-1 ring-[#2dd5b7]/50' 
                      : 'bg-[#152720] border-[#26433a] hover:border-[#2dd5b7]/50 text-[#c1c497] hover:text-[#e2e5b8] font-bold hover:bg-[#1a3227]'
                  }`}
                >
                  <img
                    src={getChampionIconUrl(version, champ.image.full)}
                    alt={champ.name}
                    className="w-5.5 h-5.5 rounded-full object-cover border border-[#26433a] flex-shrink-0"
                    loading="lazy"
                  />
                  <span className="text-xs sm:text-[13px] whitespace-nowrap font-bold tracking-tight">{champ.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Export Button */}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className={`h-8 px-2.5 sm:px-3 rounded-md border text-xs sm:text-[12.5px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs touch-manipulation ${
                isBridgeConnected
                  ? 'bg-[#1a352a] hover:bg-[#204234] border-[#2dd5b7]/60 text-[#2dd5b7]'
                  : 'bg-[#162821] hover:bg-[#192e26] border-[#26433a] text-[#e2e5b8] hover:border-[#2dd5b7]/50'
              }`}
              title="Export item set and runes to League Client"
            >
              <Zap className={`w-4 h-4 ${isBridgeConnected ? 'text-[#2dd5b7] fill-[#2dd5b7]' : 'text-[#e5c736]'}`} />
              <span className="hidden sm:inline">{isBridgeConnected ? 'Linked' : 'Export'}</span>
            </button>
          )}

          {/* Glossary Button */}
          <button
            onClick={onOpenGlossary}
            className="h-8 px-2 sm:px-2.5 rounded-md bg-[#162821] hover:bg-[#192e26] border border-[#26433a] text-[#e2e5b8] hover:border-[#2dd5b7]/50 text-xs sm:text-[12.5px] font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-xs touch-manipulation"
            title="LoL Terminology Glossary"
          >
            <BookOpen className="w-4 h-4 text-[#2dd5b7]" />
            <span className="hidden xl:inline">Glossary</span>
          </button>

          {/* Theme Settings Button */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="h-8 px-2 sm:px-2.5 rounded-md bg-[#162821] hover:bg-[#192e26] border border-[#26433a] text-[#e2e5b8] hover:border-[#2dd5b7]/50 text-xs sm:text-[12.5px] font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-xs touch-manipulation group"
            title={`Theme: ${currentThemeConfig.name} • Click to select theme or scale`}
            aria-label="Theme and Display Settings"
          >
            <Settings className="w-4 h-4 text-[#2dd5b7] group-hover:rotate-45 transition-transform duration-200" />
            <span className="hidden xl:inline">Theme</span>
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-xs flex-shrink-0"
              style={{ backgroundColor: currentThemeConfig.swatches.accent }}
            />
          </button>

          {/* Quick Zoom Stepper (Desktop/Tablet) */}
          <div className="hidden sm:flex items-center h-8 bg-[#101c17] hover:bg-[#14251f] border border-[#26433a] rounded-md px-1 shadow-2xs font-mono text-[#c1c497] transition-colors">
            <button
              onClick={zoomOut}
              disabled={isMinZoom}
              title={isMinZoom ? `At minimum zoom out (${minZoomPercent}%)` : `Zoom Out (Ctrl -) • Min: ${minZoomPercent}%`}
              className={`w-6 h-6 rounded flex items-center justify-center text-sm font-bold leading-none transition-all ${
                isMinZoom
                  ? 'text-[#53685b] cursor-not-allowed opacity-50'
                  : 'text-[#c1c497] hover:text-[#e2e5b8] hover:bg-[#192e26] active:scale-90 cursor-pointer'
              }`}
              aria-label="Zoom Out"
            >
              −
            </button>
            <button
              onClick={resetZoom}
              title={`Current Zoom: ${zoomPercent}% • Range: ${minZoomPercent}% (Max Out) to ${maxZoomPercent}% (Max In) • Click to Reset`}
              className="px-1.5 text-xs font-bold text-[#c1c497] hover:text-[#2dd5b7] tracking-tight leading-none cursor-pointer select-none"
              aria-label="Reset Zoom"
            >
              {zoomPercent}%
            </button>
            <button
              onClick={zoomIn}
              disabled={isMaxZoom}
              title={isMaxZoom ? `At maximum zoom in (${maxZoomPercent}%)` : `Zoom In (Ctrl +) • Max: ${maxZoomPercent}%`}
              className={`w-6 h-6 rounded flex items-center justify-center text-sm font-bold leading-none transition-all ${
                isMaxZoom
                  ? 'text-[#53685b] cursor-not-allowed opacity-50'
                  : 'text-[#c1c497] hover:text-[#e2e5b8] hover:bg-[#192e26] active:scale-90 cursor-pointer'
              }`}
              aria-label="Zoom In"
            >
              +
            </button>
          </div>

          {/* Desktop Update Status Notification OR Web Download Button */}
          {isDesktop ? (
            <div>
              {updateInfo.status === 'downloaded' ? (
                <button
                  onClick={() => window.electronAPI?.installUpdate?.()}
                  className="h-8 px-3 rounded-md bg-[#e5c736] hover:bg-[#d4b72e] text-[#07120e] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md animate-pulse active:scale-95"
                  title="Click to restart HexCards and apply the latest update"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Update Ready • Restart</span>
                </button>
              ) : updateInfo.status === 'downloading' ? (
                <div className="h-8 px-3 rounded-md bg-[#163026] text-[#2dd5b7] border border-[#2dd5b7]/50 text-xs font-bold flex items-center gap-1.5 font-mono shadow-2xs">
                  <RefreshCw className="w-3.5 h-3.5 text-[#2dd5b7] animate-spin" />
                  <span>Updating {updateInfo.percent || 0}%</span>
                </div>
              ) : updateInfo.status === 'available' ? (
                <div className="h-8 px-3 rounded-md bg-[#262413] text-[#e5c736] border border-[#e5c736]/50 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                  <RefreshCw className="w-3.5 h-3.5 text-[#e5c736] animate-spin" />
                  <span>Update Found...</span>
                </div>
              ) : updateInfo.status === 'checking' ? (
                <div className="h-8 px-2.5 rounded-md bg-[#162821] text-[#769382] border border-[#26433a] text-xs font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#769382]" />
                  <span>Checking...</span>
                </div>
              ) : (
                <button
                  onClick={handleCheckForUpdates}
                  className="h-8 px-2.5 rounded-md bg-[#162821] hover:bg-[#192e26] border border-[#26433a] text-[#769382] hover:text-[#e2e5b8] text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Check for software updates"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#769382]" />
                  <span className="hidden xl:inline">Updates</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {onOpenLanding && (
                <button
                  onClick={onOpenLanding}
                  className="h-8 px-2.5 sm:px-3 rounded-md bg-[#162821] hover:bg-[#192e26] text-[#c1c497] hover:text-[#e2e5b8] border border-[#26433a] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Return to HexCards Desktop App Landing Page"
                >
                  <Shield className="w-3.5 h-3.5 text-[#2dd5b7]" />
                  <span className="hidden sm:inline">Overview</span>
                </button>
              )}
              {onOpenDownloadModal ? (
                <button
                  onClick={onOpenDownloadModal}
                  className="h-8 px-2.5 sm:px-3 rounded-md bg-[#2dd5b7] hover:bg-[#26bba0] text-[#07120e] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Download standalone Windows desktop executable (.exe)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isMobile ? 'App' : 'Download .exe'}</span>
                </button>
              ) : null}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
