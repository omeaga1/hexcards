import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChampionDetail, ChampionSummary, TacticalGuide, ItemData } from '../types';
import { checkChampSelect, generateRiotItemSet, autoImportToLeague, EnemyChampionInfo } from '../services/leagueExportService';
import { getPivotSwapsForChampion } from '../data/pivotSwaps';
import { 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  RefreshCw, 
  Swords, 
  ShieldAlert, 
  Target, 
  Trophy, 
  Snowflake, 
  Flame, 
  Users 
} from 'lucide-react';

interface GameSessionBannerProps {
  isBridgeConnected: boolean;
  champion: ChampionDetail | null;
  tactics: TacticalGuide | null;
  allItems: Record<string, ItemData>;
  allChampions: Record<string, ChampionSummary>;
  selectedChampionId: string;
  onSelectChampion: (champId: string) => void;
  version: string;
}

export const GameSessionBanner: React.FC<GameSessionBannerProps> = ({
  isBridgeConnected,
  champion,
  tactics,
  allItems,
  allChampions,
  selectedChampionId,
  onSelectChampion,
  version,
}) => {
  const [inChampSelect, setInChampSelect] = useState(false);
  const [isInGame, setIsInGame] = useState(false);
  const [detectedChampKey, setDetectedChampKey] = useState<number | null>(null);
  const [assignedPosition, setAssignedPosition] = useState<string | undefined>();
  const [gameMode, setGameMode] = useState<string | undefined>();
  const [queueId, setQueueId] = useState<number | null | undefined>();
  const [opponentChampKey, setOpponentChampKey] = useState<number | null>(null);
  const [enemyChamps, setEnemyChamps] = useState<EnemyChampionInfo[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [autoSync] = useState(true);

  // Keep a ref to avoid stale closures in polling
  const lastSyncedChampKeyRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    let interval: ReturnType<typeof setInterval>;

    const poll = async () => {
      if (!isBridgeConnected) {
        if (isMounted) {
          setInChampSelect(false);
          setIsInGame(false);
          setDetectedChampKey(null);
          setOpponentChampKey(null);
          setEnemyChamps([]);
        }
        return;
      }

      const data = await checkChampSelect();
      if (!isMounted) return;

      setInChampSelect(data.inChampSelect);
      setIsInGame(Boolean(data.isInGame));
      setGameMode(data.gameMode);
      setQueueId(data.queueId);
      setAssignedPosition(data.assignedPosition);
      setOpponentChampKey(data.opponentChampionId || null);
      setEnemyChamps(data.enemyChampions || []);

      if (data.championId && data.championId > 0) {
        setDetectedChampKey(data.championId);

        // Auto-switch champion in HexCards if auto-sync is enabled
        if (autoSync && lastSyncedChampKeyRef.current !== data.championId) {
          const matchedChamp = Object.values(allChampions).find(
            c => c.key === String(data.championId)
          );
          if (matchedChamp && matchedChamp.id !== selectedChampionId) {
            lastSyncedChampKeyRef.current = data.championId;
            onSelectChampion(matchedChamp.id);
          }
        }
      } else {
        setDetectedChampKey(null);
      }
    };

    if (isBridgeConnected) {
      poll();
      interval = setInterval(poll, 2500);
    } else {
      setInChampSelect(false);
      setDetectedChampKey(null);
      setOpponentChampKey(null);
      setEnemyChamps([]);
    }

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [isBridgeConnected, allChampions, autoSync, selectedChampionId, onSelectChampion]);

  // Find detected champion summary from allChampions
  const detectedChampion = detectedChampKey
    ? Object.values(allChampions).find(c => c.key === String(detectedChampKey))
    : null;

  // Find direct opponent champion summary
  const opponentChampion = opponentChampKey
    ? Object.values(allChampions).find(c => c.key === String(opponentChampKey))
    : null;

  // Check for matchup intelligence against opponent
  const matchupAdvice = useMemo(() => {
    if (!tactics || !opponentChampion) return null;

    // 1. Check rune swap rule
    if (tactics.runeKit.swapRule) {
      const triggerLower = tactics.runeKit.swapRule.trigger.toLowerCase();
      const oppNameLower = opponentChampion.name.toLowerCase();
      if (triggerLower.includes(oppNameLower)) {
        return {
          type: 'rune',
          label: 'Rune Adaptation',
          text: `Take ${tactics.runeKit.swapRule.take} instead of ${tactics.runeKit.swapRule.insteadOf}`
        };
      }
    }

    // 2. Check pivot swap rules
    const pivotRules = getPivotSwapsForChampion(tactics);
    for (const rule of pivotRules) {
      if (rule.triggerChamps.toLowerCase().includes(opponentChampion.name.toLowerCase())) {
        return {
          type: 'item',
          label: rule.threatLabel,
          text: `Rush ${rule.earlyComponent?.name || rule.replacementItem.name}`
        };
      }
    }

    return null;
  }, [tactics, opponentChampion]);

  if (!isBridgeConnected || !inChampSelect) {
    return null;
  }

  const canImport = champion !== null && tactics !== null;

  const handleImport = async () => {
    if (!canImport) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const itemSet = generateRiotItemSet(champion, tactics, allItems);
      const result = await autoImportToLeague(itemSet, tactics.runeKit);
      setImportResult(result);

      if (result.success) {
        setTimeout(() => setImportResult(null), 6000);
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        message: err.message || 'Failed to import to League Client'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleManualSync = () => {
    if (detectedChampion) {
      onSelectChampion(detectedChampion.id);
    }
  };

  // Select game mode icon
  const renderGameModeIcon = () => {
    if (gameMode?.includes('Training') || gameMode?.includes('Practice')) {
      return <Target className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (gameMode?.includes('Ranked')) {
      return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (gameMode?.includes('ARAM')) {
      return <Snowflake className="w-3.5 h-3.5 text-cyan-400" />;
    }
    if (gameMode?.includes('Arena') || gameMode?.includes('URF')) {
      return <Flame className="w-3.5 h-3.5 text-rose-400" />;
    }
    return <Swords className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="px-3 sm:px-4 max-w-7xl mx-auto w-full mb-2">
      <div className="deadlock-frame retro-futuristic-card bg-[#13221c] border border-[#26433a] rounded-lg shadow-md flex flex-col p-2.5 sm:p-3 font-['Barlow_Condensed'] gap-2.5">
        
        {/* Top Row: Status, Game Mode, Your Pick, Opponent, and Action */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Left: Status & Game Mode Badge */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2dd5b7] shadow-xs shadow-[#2dd5b7]/40 animate-pulse shrink-0" />
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5">
              <span className="font-black uppercase tracking-wider text-[#e2e5b8] text-sm flex items-center gap-1.5">
                {isInGame ? <Swords className="w-4 h-4 text-[#e5c736]" /> : <Radio className="w-4 h-4 text-[#2dd5b7]" />}
                {isInGame ? 'Live Match Active' : 'Live Session Connected'}
              </span>

              {gameMode && (
                <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider bg-[#162821] text-[#2dd5b7] px-2 py-0.5 rounded border border-[#26433a] font-bold w-fit shadow-2xs">
                  {renderGameModeIcon()}
                  <span>{gameMode}</span>
                </span>
              )}
            </div>
          </div>

          {/* Center: Matchup Showcase (Your Pick VS Opponent) */}
          <div className="flex flex-wrap items-center gap-2 px-2.5 py-1 rounded bg-[#0f1c17] border border-[#26433a] shadow-2xs">
            
            {/* Your Champion */}
            {detectedChampion ? (
              <div className="flex items-center gap-1.5">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${detectedChampion.image.full}`}
                  alt={detectedChampion.name}
                  className="w-7 h-7 rounded border border-[#2dd5b7] object-cover shadow-xs"
                />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="font-black uppercase tracking-wider text-[#e2e5b8] text-xs">
                      {detectedChampion.name}
                    </span>
                    {assignedPosition && (
                      <span className="text-[9.5px] text-[#2dd5b7] font-bold uppercase bg-[#163026] px-1 rounded border border-[#26433a]">
                        {assignedPosition}
                      </span>
                    )}
                  </div>
                  <span className="text-[9.5px] text-[#769382] font-sans">
                    You
                  </span>
                </div>

                {detectedChampion.id !== selectedChampionId && (
                  <button
                    onClick={handleManualSync}
                    className="ml-1 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#162821] hover:bg-[#192e26] text-[#2dd5b7] border border-[#26433a] rounded transition-colors cursor-pointer flex items-center gap-1"
                    title="Switch HexCards to this champion"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Sync
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#769382] italic font-sans px-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2dd5b7] animate-ping" />
                Select your champion in League...
              </div>
            )}

            {/* VS Divider & Opponent */}
            {opponentChampion && (
              <>
                <span className="text-[#f43f5e] font-black text-xs px-1 uppercase tracking-widest">
                  VS
                </span>

                <div className="flex items-center gap-1.5 pl-1 border-l border-[#26433a]">
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${opponentChampion.image.full}`}
                    alt={opponentChampion.name}
                    className="w-7 h-7 rounded border border-[#f43f5e]/70 object-cover shadow-xs"
                  />
                  <div className="flex flex-col text-left">
                    <span className="font-black uppercase tracking-wider text-[#f43f5e] text-xs">
                      {opponentChampion.name}
                    </span>
                    <span className="text-[9.5px] text-[#769382] font-sans">
                      Opponent
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Revealed Enemy Team Lineup (if more than 1 enemy revealed) */}
            {enemyChamps.length > 1 && (
              <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-[#26433a]">
                <span className="text-[9.5px] uppercase font-bold text-[#769382] mr-0.5 flex items-center gap-0.5">
                  <Users className="w-3 h-3 text-[#53685b]" />
                  Enemies:
                </span>
                <div className="flex items-center -space-x-1">
                  {enemyChamps.map((enemy) => {
                    const eData = Object.values(allChampions).find(c => c.key === String(enemy.championId));
                    if (!eData) return null;
                    return (
                      <img
                        key={enemy.championId}
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${eData.image.full}`}
                        alt={eData.name}
                        title={`${eData.name} (${enemy.assignedPosition || 'Enemy'})`}
                        className="w-5 h-5 rounded-full border border-[#f43f5e]/60 object-cover shadow-2xs hover:scale-125 transition-transform"
                      />
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Right: Auto-Import Action & Feedback */}
          <div className="flex flex-col items-center sm:items-end w-full lg:w-auto">
            <button
              onClick={handleImport}
              disabled={!canImport || isImporting}
              className={`font-black uppercase text-xs tracking-wider px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs
                ${canImport 
                  ? 'bg-[#2dd5b7] hover:bg-[#26bba0] text-[#07120e] cursor-pointer active:scale-95 shadow-md shadow-[#2dd5b7]/20' 
                  : 'bg-[#162821] text-[#53685b] cursor-not-allowed border border-[#26433a]'
                }
              `}
            >
              <Zap className={`w-3.5 h-3.5 ${isImporting ? 'animate-pulse' : ''}`} />
              {!canImport
                ? 'Select a champion to import'
                : isImporting 
                  ? 'Importing to League...' 
                  : `AUTO-IMPORT FOR ${champion.name.toUpperCase()}`}
            </button>

            {importResult && (
              <div
                className={`mt-1 text-[11px] font-sans flex items-center gap-1 font-medium ${
                  importResult.success ? 'text-[#2dd5b7]' : 'text-[#f43f5e]'
                }`}
              >
                {importResult.success ? (
                  <CheckCircle2 className="w-3 h-3 text-[#2dd5b7]" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-[#f43f5e]" />
                )}
                {importResult.message}
              </div>
            )}
          </div>

        </div>

        {/* Bottom Context Row: Direct Matchup Advice Alert (if facing a known opponent) */}
        {matchupAdvice && opponentChampion && (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#262413] border border-[#e5c736]/40 rounded text-xs text-[#e2e5b8]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#e5c736] shrink-0" />
            <span className="font-black uppercase tracking-wider text-[#e5c736]">
              Matchup Intelligence ({opponentChampion.name}):
            </span>
            <span className="font-sans text-[11.5px] text-[#c1c497]">
              {matchupAdvice.text}
            </span>
          </div>
        )}

      </div>
    </div>
  );
};
