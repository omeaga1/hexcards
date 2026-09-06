import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchLatestVersion, 
  fetchAllChampions, 
  fetchChampionDetail, 
  fetchAllItems,
  checkRemotePatchVersion,
  purgeStaleCache
} from './services/ddragon';
import { loadMetaBuilds } from './services/metaBuildService';
import { ChampionSummary, ChampionDetail, ItemData } from './types';
import { getTacticsForChampion } from './data/championTactics';
import { Header } from './components/Header';
import { ChampionSelector } from './components/ChampionSelector';
import { ChampionHero } from './components/ChampionCard/ChampionHero';
import { AbilityCards } from './components/ChampionCard/AbilityCards';
import { DeadlockItemDeck } from './components/ChampionCard/DeadlockItemDeck';
import { RunesDemystified } from './components/ChampionCard/RunesDemystified';
import { GlossaryModal } from './components/Glossary/GlossaryModal';
import { ExportModal } from './components/LeagueExport/ExportModal';
import { DownloadModal } from './components/DownloadModal';
import { checkBridgeStatus } from './services/leagueExportService';
import { GameSessionBanner } from './components/GameSessionBanner';
import { PinnedCardProvider } from './context/PinnedCardContext';
import { PinnedWindowManager } from './components/FloatingWindows/PinnedWindowManager';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2, AlertCircle, ShoppingBag, Sparkles, Compass, Layers } from 'lucide-react';
import { useDevice } from './hooks/useDevice';

const DEFAULT_FAVORITES = ['Darius', 'Garen', 'Jinx', 'Ahri', 'Warwick', 'Thresh'];

const AppContent: React.FC = () => {
  const [version, setVersion] = useState<string>('16.17.1');
  const [newPatchAvailable, setNewPatchAvailable] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [allChampions, setAllChampions] = useState<Record<string, ChampionSummary>>({});
  const [allItems, setAllItems] = useState<Record<string, ItemData>>({});
  const [currentChampion, setCurrentChampion] = useState<ChampionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const { isMobile } = useDevice();

  // App State
  const [selectedChampionId, setSelectedChampionId] = useState<string>('Darius');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSelectorExpanded, setIsSelectorExpanded] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [isBridgeConnected, setIsBridgeConnected] = useState<boolean>(false);

  // Focus View Tab: 'items' | 'abilities' | 'runes' | 'all'
  const [activeTab, setActiveTab] = useState<'items' | 'abilities' | 'runes' | 'all'>('items');

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lol_qc_favorites');
      return saved ? JSON.parse(saved) : DEFAULT_FAVORITES;
    } catch {
      return DEFAULT_FAVORITES;
    }
  });

  // Initial Load
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const ver = await fetchLatestVersion();
        setVersion(ver);

        const [champs, items] = await Promise.all([
          fetchAllChampions(ver),
          fetchAllItems(ver),
          loadMetaBuilds()
        ]);

        setAllChampions(champs);
        setAllItems(items);

        // Load initial champion
        const detail = await fetchChampionDetail(ver, selectedChampionId);
        if (detail) {
          setCurrentChampion(detail);
        }
      } catch (err: any) {
        console.error('Initialization error:', err);
        setError('Failed to load League of Legends data. Check your internet connection.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Background Live Patch Revalidation
  useEffect(() => {
    if (!version) return;
    const timer = setTimeout(async () => {
      const remoteVer = await checkRemotePatchVersion();
      if (remoteVer && remoteVer !== version) {
        setNewPatchAvailable(remoteVer);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [version]);

  const handleSyncPatch = async () => {
    if (!newPatchAvailable) return;
    const targetVer = newPatchAvailable;
    setNewPatchAvailable(null);
    setLoading(true);
    try {
      purgeStaleCache(targetVer);
      setVersion(targetVer);
      const [champs, items] = await Promise.all([
        fetchAllChampions(targetVer),
        fetchAllItems(targetVer),
        loadMetaBuilds()
      ]);
      setAllChampions(champs);
      setAllItems(items);
      const detail = await fetchChampionDetail(targetVer, selectedChampionId);
      if (detail) {
        setCurrentChampion(detail);
      }
    } catch (err) {
      console.error('Failed to sync to new patch:', err);
    } finally {
      setLoading(false);
    }
  };

  // Poll HexCards Desktop Bridge status
  useEffect(() => {
    let isMounted = true;
    async function check() {
      const status = await checkBridgeStatus();
      if (isMounted) {
        setIsBridgeConnected(status.connected);
      }
    }
    check();
    const interval = setInterval(check, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // When selectedChampionId changes, fetch detail
  useEffect(() => {
    if (!version || !selectedChampionId) return;

    async function loadChampion() {
      setDetailLoading(true);
      try {
        const detail = await fetchChampionDetail(version, selectedChampionId);
        if (detail) {
          setCurrentChampion(detail);
        }
      } catch (err) {
        console.error('Error loading champion:', err);
      } finally {
        setDetailLoading(false);
      }
    }

    loadChampion();
  }, [selectedChampionId, version]);

  const handleToggleFavorite = (champId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(champId)
        ? prev.filter((id) => id !== champId)
        : [...prev, champId];
      try {
        localStorage.setItem('lol_qc_favorites', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const filteredChampions = useMemo(() => {
    return Object.values(allChampions).filter((champ) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        champ.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        champ.title.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesRole = true;
      if (selectedRole === 'Top') {
        matchesRole = champ.tags.includes('Fighter') || champ.tags.includes('Tank');
      } else if (selectedRole === 'Jungle') {
        matchesRole = champ.tags.includes('Fighter') || champ.tags.includes('Assassin') || champ.tags.includes('Tank');
      } else if (selectedRole === 'Mid') {
        matchesRole = champ.tags.includes('Mage') || champ.tags.includes('Assassin');
      } else if (selectedRole === 'ADC') {
        matchesRole = champ.tags.includes('Marksman');
      } else if (selectedRole === 'Support') {
        matchesRole = champ.tags.includes('Support') || champ.tags.includes('Tank') || champ.tags.includes('Mage');
      }

      return matchesSearch && matchesRole;
    });
  }, [allChampions, searchQuery, selectedRole]);

  const tactics = useMemo(() => {
    if (!currentChampion) return null;
    return getTacticsForChampion(currentChampion.id, currentChampion.tags, currentChampion.name);
  }, [currentChampion]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] deadlock-hatched flex flex-col items-center justify-center text-slate-600 gap-3 font-['Barlow_Condensed']">
        <Loader2 className="w-9 h-9 text-emerald-600 animate-spin" />
        <div className="text-center">
          <p className="text-lg font-black tracking-wider uppercase text-slate-900">Initializing HexCards Matrix...</p>
          <p className="text-xs text-slate-500 font-sans">Connecting to Riot Data Dragon v{version}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] deadlock-hatched flex flex-col items-center justify-center p-4 font-['Barlow_Condensed']">
        <div className="deadlock-frame p-6 rounded-xl max-w-md text-center space-y-3 bg-white border border-slate-200 shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-lg font-black uppercase text-slate-900">Connection Failed</h2>
          <p className="text-xs text-slate-600 font-sans">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="deadlock-badge px-4 py-1.5 text-xs text-emerald-800 bg-emerald-50 border-emerald-300 cursor-pointer"
          >
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] deadlock-hatched text-slate-900 flex flex-col">
      {/* Top Header */}
      <Header
        version={version}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q) setIsSelectorExpanded(true);
        }}
        selectedRole={selectedRole}
        onSelectRole={(role) => {
          setSelectedRole(role);
          if (role !== 'All') {
            setIsSelectorExpanded(true);
          }
        }}
        favorites={favorites}
        onSelectChampion={(id) => {
          setSelectedChampionId(id);
          setIsSelectorExpanded(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        allChampions={allChampions}
        selectedChampionId={selectedChampionId}
        newPatchAvailable={newPatchAvailable}
        onSyncPatch={handleSyncPatch}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        isBridgeConnected={isBridgeConnected}
        isSelectorExpanded={isSelectorExpanded}
        onToggleSelector={() => setIsSelectorExpanded(!isSelectorExpanded)}
      />

      {/* Game Session Detection Banner */}
      <GameSessionBanner
        isBridgeConnected={isBridgeConnected}
        champion={currentChampion}
        tactics={tactics}
        allItems={allItems}
        allChampions={allChampions}
        selectedChampionId={selectedChampionId}
        onSelectChampion={setSelectedChampionId}
        version={version}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full max-w-7xl mx-auto py-2 sm:py-3 space-y-3 ${isMobile ? 'pb-16 px-2' : 'px-3 sm:px-4 lg:px-6'}`}>
        
        {/* Collapsible Champion Drawer (controlled via Header CHAMPS trigger) */}
        {isSelectorExpanded && (
          <ChampionSelector
            version={version}
            champions={filteredChampions}
            selectedChampionId={selectedChampionId}
            onSelectChampion={(champId) => {
              setSelectedChampionId(champId);
              setIsSelectorExpanded(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            selectedRole={selectedRole}
            onSelectRole={(role) => setSelectedRole(role)}
          />
        )}

        {/* Champion Detail Card */}
        {detailLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-2 font-['Barlow_Condensed']">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <p className="text-xs uppercase tracking-wider">Loading champion deck...</p>
          </div>
        ) : currentChampion && tactics ? (
          <div className="space-y-2 animate-in fade-in duration-200">
            
            {/* 1. Champion Hero Banner */}
            <ChampionHero
              version={version}
              champion={currentChampion}
              tactics={tactics}
              compact={activeTab === 'items'}
              isFavorite={favorites.includes(currentChampion.id)}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* View Selector Tabs */}
            <div className="flex items-center justify-center sm:justify-start gap-1.5 p-1 rounded-xl bg-white border border-slate-200 shadow-xs w-full sm:w-auto overflow-x-auto font-['Barlow_Condensed']">
              <button
                onClick={() => setActiveTab('items')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'items'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Items</span>
              </button>

              <button
                onClick={() => setActiveTab('abilities')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'abilities'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Abilities</span>
              </button>

              <button
                onClick={() => setActiveTab('runes')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'runes'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Runes</span>
              </button>

              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>All-in-One</span>
              </button>
            </div>

            {/* Core Section 1: Deadlock Item Deck */}
            {(activeTab === 'all' || activeTab === 'items') && (
              <ErrorBoundary fallbackTitle="Tactical Item Canvas">
                <DeadlockItemDeck
                  version={version}
                  tactics={tactics}
                  allItems={allItems}
                />
              </ErrorBoundary>
            )}

            {/* Core Section 2: Abilities Explained */}
            {(activeTab === 'all' || activeTab === 'abilities') && (
              <AbilityCards
                version={version}
                champion={currentChampion}
                tactics={tactics}
              />
            )}

            {/* Core Section 3: Runes Demystified */}
            {(activeTab === 'all' || activeTab === 'runes') && (
              <RunesDemystified tactics={tactics} />
            )}

          </div>
        ) : null}
      </main>

      {/* League Item Set & Rune Exporter Modal */}
      {currentChampion && tactics && (
        <ExportModal
          version={version}
          champion={currentChampion}
          tactics={tactics}
          allItems={allItems}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {/* Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Download Desktop App Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        version={version}
      />

      {/* Mobile Sticky Bottom Tab Bar (Thumb Navigation) */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg select-none font-['Barlow_Condensed']">
          <button
            onClick={() => {
              setActiveTab('items');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all touch-manipulation active:scale-95 cursor-pointer ${
              activeTab === 'items'
                ? 'text-emerald-600 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Items</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('abilities');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all touch-manipulation active:scale-95 cursor-pointer ${
              activeTab === 'abilities'
                ? 'text-emerald-600 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Abilities</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('runes');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all touch-manipulation active:scale-95 cursor-pointer ${
              activeTab === 'runes'
                ? 'text-emerald-600 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Runes</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all touch-manipulation active:scale-95 cursor-pointer ${
              activeTab === 'all'
                ? 'text-emerald-600 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">All-in-One</span>
          </button>
        </nav>
      )}

      {/* Footer */}
      <footer className={`border-t border-slate-200 bg-white py-2 text-center text-[11px] text-slate-500 font-['Barlow_Condensed'] ${isMobile ? 'pb-14' : ''}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span className="uppercase tracking-wider font-medium">HexCards • Anti-Slop Tactical LoL Companion</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 hover:underline uppercase tracking-wide font-bold cursor-pointer"
            >
              LoL Terminology Glossary
            </button>
            <span>•</span>
            <span className="text-amber-800 font-bold">Riot Patch v{version}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PinnedCardProvider>
      <AppContent />
      <PinnedWindowManager />
    </PinnedCardProvider>
  );
};

export default App;
