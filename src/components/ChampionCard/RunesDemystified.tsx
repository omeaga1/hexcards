import React, { useState } from 'react';
import { TacticalGuide } from '../../types';
import { ArrowRight, Shield, Zap, Sparkles, Heart, Activity, CheckCircle2, AlertCircle, Eye, Info } from 'lucide-react';
import { getRuneIconUrl, getTreeTheme, TREE_THEMES } from '../../data/runeIcons';
import { RUNE_TREES, STAT_SHARD_ROWS, getRuneByName, getRuneFourWords, RuneDefinition } from '../../data/runeTrees';
import { autoImportToLeague, generateRiotItemSet } from '../../services/leagueExportService';

interface RunesDemystifiedProps {
  tactics: TacticalGuide;
}

export const RunesDemystified: React.FC<RunesDemystifiedProps> = ({ tactics }) => {
  const { runeKit } = tactics;
  const primaryTreeData = RUNE_TREES[runeKit.primaryTree] || RUNE_TREES.Precision;
  const secondaryTreeData = RUNE_TREES[runeKit.secondaryTree] || RUNE_TREES.Resolve;
  const primaryTheme = getTreeTheme(runeKit.primaryTree);
  const secondaryTheme = getTreeTheme(runeKit.secondaryTree);

  // Active selected rune names
  const activeKeystoneName = runeKit.keystone.name;
  const activePrimaryMinorNames = runeKit.primaryMinors.map((m) => m.name);
  const activeSecondaryMinorNames = runeKit.secondaryMinors.map((m) => m.name);

  // Selected Shard indexes parsed from statShards string (handles both raw IDs e.g. "5005 • 5008 • 5011" and text names)
  const shardParts = (runeKit.statShards || '').split(/•|,|\//).map((s) => s.trim().toLowerCase());
  const s0 = shardParts[0] || '';
  const s1 = shardParts[1] || '';
  const s2 = shardParts[2] || '';

  const selectedOffenseIdx = s0.includes('5005') || s0.includes('attack speed') ? 1 : s0.includes('5007') || s0.includes('haste') ? 2 : 0;
  const selectedFlexIdx = s1.includes('5010') || s1.includes('speed') || s1.includes('move') ? 1 : s1.includes('5001') || s1.includes('scaling health') || s1.includes('scaling hp') ? 2 : 0;
  const selectedDefenseIdx = s2.includes('5013') || s2.includes('tenacity') ? 1 : s2.includes('5001') || s2.includes('scaling health') || s2.includes('scaling hp') ? 2 : 0;

  // Interactive inspected rune state (defaults to keystone)
  const defaultInspected = getRuneByName(activeKeystoneName) || {
    id: 0,
    name: activeKeystoneName,
    fourWords: runeKit.keystone.tldr || getRuneFourWords(activeKeystoneName),
    details: runeKit.keystone.why || 'Primary tactical keystone providing core combat identity.'
  };
  const [inspectedRune, setInspectedRune] = useState<RuneDefinition>(defaultInspected);

  // Synchronize inspected rune when champion changes
  React.useEffect(() => {
    setInspectedRune(defaultInspected);
  }, [tactics.championId, activeKeystoneName]);

  // 1-Click Client Injection State
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleQuickImport = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const dummyChamp = { key: '0', id: tactics.championId, name: tactics.championId } as any;
      const dummyItems = {} as any;
      const dummyItemSet = generateRiotItemSet(dummyChamp, tactics, dummyItems);
      const res = await autoImportToLeague(dummyItemSet, runeKit);
      setImportResult(res);
    } catch (err: any) {
      setImportResult({ success: false, message: err.message || 'Failed to inject runes.' });
    } finally {
      setImporting(false);
    }
  };

  const getShardIcon = (iconName: string) => {
    switch (iconName) {
      case 'adaptive':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'attack_speed':
        return <Sparkles className="w-3.5 h-3.5 text-amber-300" />;
      case 'ability_haste':
        return <Activity className="w-3.5 h-3.5 text-sky-400" />;
      case 'move_speed':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      case 'health_scaling':
      case 'health_flat':
        return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'tenacity':
        return <Shield className="w-3.5 h-3.5 text-slate-300" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden select-none font-['Barlow_Condensed'] text-slate-200">
      {/* Top Atmospheric Header */}
      <div className="px-4 py-3.5 bg-slate-950/90 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-md border border-slate-700/70 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">RUNE PAGE ENGINE</span>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-white tracking-wide flex items-center gap-2">
              <span>{tactics.championId} Rune Blueprint</span>
              <span className="text-xs font-bold text-slate-400 tracking-normal font-sans normal-case hidden md:inline">
                (Authentic In-Game Layout • ≤4 Word Summaries)
              </span>
            </h2>
          </div>
        </div>

        {/* Tree Path Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            <img src={primaryTreeData.icon} alt={runeKit.primaryTree} className="w-4 h-4 object-contain" />
            <span className="text-xs font-black uppercase text-white tracking-wide">
              {runeKit.primaryTree}
            </span>
            <span className="text-slate-600 font-black">/</span>
            <img src={secondaryTreeData.icon} alt={runeKit.secondaryTree} className="w-4 h-4 object-contain" />
            <span className="text-xs font-black uppercase text-slate-300 tracking-wide">
              {runeKit.secondaryTree}
            </span>
          </div>

          <span className="text-[11px] font-black uppercase text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 px-2.5 py-1 rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            META WINRATE
          </span>
        </div>
      </div>

      {/* Main Authentic 3-Column Rune Canvas (Mirroring the In-Game Client Layout) */}
      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================= */}
        {/* COLUMN 1: PRIMARY PATH (5 Cols)                           */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 rounded-xl bg-slate-900/60 border border-slate-800 p-4 relative overflow-hidden backdrop-blur-xs flex flex-col gap-4 shadow-inner">
          {/* Subtle Elemental Backdrop Glow */}
          <div
            className="absolute -top-20 -left-20 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: primaryTreeData.color }}
          />

          {/* Primary Tree Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 relative z-10">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full p-1 bg-slate-950 border border-amber-500/40 flex items-center justify-center shadow-md"
                style={{ borderColor: primaryTreeData.color }}
              >
                <img src={primaryTreeData.icon} alt={primaryTreeData.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block leading-none">
                  PRIMARY PATH
                </span>
                <span className="text-base font-black uppercase tracking-wide text-white">
                  {primaryTreeData.name}
                </span>
              </div>
            </div>

            {/* Tree Selector Badges (All 5 Trees) */}
            <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
              {Object.keys(RUNE_TREES).map((tName) => {
                const isCurrent = tName === runeKit.primaryTree;
                const icon = getRuneIconUrl(tName);
                return (
                  <div
                    key={tName}
                    title={tName}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'scale-110 opacity-100 ring-1 ring-white/60'
                        : 'opacity-30 hover:opacity-75 grayscale'
                    }`}
                  >
                    {icon && <img src={icon} alt={tName} className="w-3.5 h-3.5 object-contain" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical Track & Rune Tree Rows Container */}
          <div className="relative pl-6 space-y-5">
            {/* Authentic Vertical Circuit Line */}
            <div
              className="absolute left-2.5 top-3 bottom-3 w-0.5 rounded-full"
              style={{
                backgroundColor: primaryTreeData.color,
                opacity: 0.4,
                boxShadow: `0 0 8px ${primaryTreeData.color}`
              }}
            />

            {/* --- 1. KEYSTONE ROW --- */}
            <div className="relative">
              {/* Circuit Node Dot */}
              <div
                className="absolute -left-[19px] top-4 w-2 h-2 rounded-full ring-2 ring-slate-900 shadow-xs"
                style={{ backgroundColor: primaryTreeData.color }}
              />

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  KEYSTONES
                </span>
                <span className="text-[10px] font-mono text-amber-300 font-bold uppercase">
                  Pick 1
                </span>
              </div>

              {/* Horizontal Keystones List (Authentic Client Style) */}
              <div className="flex items-center gap-3.5 flex-wrap">
                {primaryTreeData.keystones.map((k) => {
                  const isSelected = k.name.toLowerCase() === activeKeystoneName.toLowerCase();
                  const kIcon = getRuneIconUrl(k.name);
                  const isInspected = inspectedRune.name.toLowerCase() === k.name.toLowerCase();

                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setInspectedRune(k)}
                      title={`${k.name}: ${k.fourWords}`}
                      className={`relative rounded-full transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'w-14 h-14 p-1 bg-slate-950 ring-4 shadow-lg scale-105 z-10'
                          : 'w-10 h-10 p-1 bg-slate-950/80 opacity-40 hover:opacity-90 grayscale hover:grayscale-0'
                      } ${isInspected ? 'ring-2 ring-white' : ''}`}
                      style={{
                        borderColor: isSelected ? primaryTreeData.color : 'transparent',
                        boxShadow: isSelected ? `0 0 20px ${primaryTreeData.glowColor}` : undefined
                      }}
                    >
                      {kIcon ? (
                        <img src={kIcon} alt={k.name} className="w-full h-full object-contain rounded-full" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                          KEY
                        </div>
                      )}

                      {isSelected && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border border-slate-950 flex items-center justify-center text-[9px] font-black text-slate-950 shadow-xs">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Keystone Highlight & 4-WORD PURPOSE */}
              <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 shadow-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black uppercase text-white tracking-wide truncate">
                      {activeKeystoneName}
                    </span>
                    {/* STRICTLY <= 4 WORDS BADGE */}
                    <span className="text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
                      {getRuneFourWords(activeKeystoneName)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5 line-clamp-1">
                    {runeKit.keystone.why || 'Core combat engine defining early trades and teamfight spikes.'}
                  </p>
                </div>
              </div>
            </div>

            {/* --- 2. THREE MINOR RUNES TIERS --- */}
            {primaryTreeData.slots.map((slot, slotIdx) => {
              const activeMinorName = activePrimaryMinorNames[slotIdx] || '';
              return (
                <div key={slotIdx} className="relative pt-1">
                  {/* Circuit Node Dot */}
                  <div
                    className="absolute -left-[19px] top-3.5 w-2 h-2 rounded-full ring-2 ring-slate-900"
                    style={{ backgroundColor: primaryTreeData.color }}
                  />

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10.5px] font-black uppercase tracking-widest text-slate-500">
                      TIER {slotIdx + 1}
                    </span>
                    {activeMinorName && (
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                        {activeMinorName}
                      </span>
                    )}
                  </div>

                  {/* Horizontal Tier Runes */}
                  <div className="flex items-center justify-between gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <div className="flex items-center gap-3">
                      {slot.runes.map((r) => {
                        const isSelected = activeMinorName.toLowerCase() === r.name.toLowerCase();
                        const rIcon = getRuneIconUrl(r.name);
                        const isInspected = inspectedRune.name.toLowerCase() === r.name.toLowerCase();

                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setInspectedRune(r)}
                            title={`${r.name}: ${r.fourWords}`}
                            className={`relative rounded-full transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'w-10 h-10 p-0.5 bg-slate-950 ring-2 shadow-md scale-105 z-10'
                                : 'w-8 h-8 p-0.5 bg-slate-950/80 opacity-35 hover:opacity-85 grayscale hover:grayscale-0'
                            } ${isInspected ? 'ring-2 ring-white' : ''}`}
                            style={{
                              borderColor: isSelected ? primaryTreeData.color : 'transparent',
                              boxShadow: isSelected ? `0 0 12px ${primaryTreeData.glowColor}` : undefined
                            }}
                          >
                            {rIcon ? (
                              <img src={rIcon} alt={r.name} className="w-full h-full object-contain rounded-full" />
                            ) : (
                              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold">
                                {slotIdx + 1}
                              </div>
                            )}

                            {isSelected && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-slate-950 flex items-center justify-center text-[8px] font-black text-slate-950">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Minor 4-WORD PURPOSE */}
                    {activeMinorName && (
                      <div className="text-right flex-1 min-w-0 pl-2">
                        <span className="text-[11px] font-black uppercase text-amber-300 tracking-wide block truncate">
                          {getRuneFourWords(activeMinorName)}
                        </span>
                        <span className="text-[9.5px] text-slate-500 font-sans block truncate">
                          {activeMinorName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: SECONDARY PATH & STAT SHARD MATRIX (4 Cols)     */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 rounded-xl bg-slate-900/60 border border-slate-800 p-4 relative overflow-hidden backdrop-blur-xs flex flex-col gap-4 shadow-inner">
          {/* Subtle Secondary Glow */}
          <div
            className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: secondaryTreeData.color }}
          />

          {/* Secondary Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 relative z-10">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full p-1 bg-slate-950 border flex items-center justify-center shadow-md"
                style={{ borderColor: secondaryTreeData.color }}
              >
                <img src={secondaryTreeData.icon} alt={secondaryTreeData.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block leading-none">
                  SECONDARY PATH
                </span>
                <span className="text-base font-black uppercase tracking-wide text-white">
                  {secondaryTreeData.name}
                </span>
              </div>
            </div>

            {/* Tree Selector Badges */}
            <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
              {Object.keys(RUNE_TREES).map((tName) => {
                const isCurrent = tName === runeKit.secondaryTree;
                const icon = getRuneIconUrl(tName);
                return (
                  <div
                    key={tName}
                    title={tName}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'scale-110 opacity-100 ring-1 ring-white/60'
                        : 'opacity-30 hover:opacity-75 grayscale'
                    }`}
                  >
                    {icon && <img src={icon} alt={tName} className="w-3.5 h-3.5 object-contain" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Secondary Minor Slots (Vertical Line + Rows) */}
          <div className="relative pl-6 space-y-3.5">
            {/* Vertical Circuit Line */}
            <div
              className="absolute left-2.5 top-3 bottom-3 w-0.5 rounded-full"
              style={{
                backgroundColor: secondaryTreeData.color,
                opacity: 0.4,
                boxShadow: `0 0 8px ${secondaryTreeData.color}`
              }}
            />

            {secondaryTreeData.slots.map((slot, slotIdx) => {
              // Find which rune (if any) is selected in this slot
              const chosenInSlot = slot.runes.find((r) =>
                activeSecondaryMinorNames.some((act) => act.toLowerCase() === r.name.toLowerCase())
              );

              return (
                <div key={slotIdx} className="relative">
                  {/* Circuit Node Dot */}
                  <div
                    className="absolute -left-[19px] top-3.5 w-2 h-2 rounded-full ring-2 ring-slate-900"
                    style={{ backgroundColor: secondaryTreeData.color }}
                  />

                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      TIER {slotIdx + 1}
                    </span>
                    {chosenInSlot && (
                      <span className="text-[9.5px] font-mono text-slate-400 font-bold uppercase truncate max-w-[130px]">
                        {chosenInSlot.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      {slot.runes.map((r) => {
                        const isSelected = activeSecondaryMinorNames.some(
                          (act) => act.toLowerCase() === r.name.toLowerCase()
                        );
                        const rIcon = getRuneIconUrl(r.name);
                        const isInspected = inspectedRune.name.toLowerCase() === r.name.toLowerCase();

                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setInspectedRune(r)}
                            title={`${r.name}: ${r.fourWords}`}
                            className={`relative rounded-full transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'w-9 h-9 p-0.5 bg-slate-950 ring-2 shadow-md scale-105 z-10'
                                : 'w-7 h-7 p-0.5 bg-slate-950/80 opacity-30 hover:opacity-80 grayscale hover:grayscale-0'
                            } ${isInspected ? 'ring-2 ring-white' : ''}`}
                            style={{
                              borderColor: isSelected ? secondaryTreeData.color : 'transparent',
                              boxShadow: isSelected ? `0 0 10px ${secondaryTreeData.glowColor}` : undefined
                            }}
                          >
                            {rIcon ? (
                              <img src={rIcon} alt={r.name} className="w-full h-full object-contain rounded-full" />
                            ) : (
                              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-bold">
                                {slotIdx + 1}
                              </div>
                            )}

                            {isSelected && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-slate-950 flex items-center justify-center text-[7px] font-black text-slate-950">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* 4-WORD PURPOSE */}
                    {chosenInSlot && (
                      <div className="text-right flex-1 min-w-0 pl-2">
                        <span className="text-[11px] font-black uppercase text-amber-300 tracking-wide block truncate">
                          {chosenInSlot.fourWords}
                        </span>
                        <span className="text-[9px] text-slate-500 font-sans block truncate">
                          {chosenInSlot.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider between Runes and Stat Shards */}
          <div className="border-t border-slate-800/80 pt-2">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Stat Shard Matrix
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                3 Adaptive Perks
              </span>
            </div>

            {/* 3 Rows of Stat Shards (Offense, Flex, Defense) */}
            <div className="relative pl-5 space-y-2">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-700/60 rounded-full" />

              {STAT_SHARD_ROWS.map((row, rowIdx) => {
                const selectedIdx = rowIdx === 0 ? selectedOffenseIdx : rowIdx === 1 ? selectedFlexIdx : selectedDefenseIdx;
                const chosenShard = row[selectedIdx] || row[0];

                return (
                  <div key={rowIdx} className="relative flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <div className="absolute -left-[15px] w-1.5 h-1.5 rounded-full bg-slate-600" />

                    <div className="flex items-center gap-2">
                      {row.map((shard, sIdx) => {
                        const isSelected = sIdx === selectedIdx;
                        return (
                          <div
                            key={shard.id + '_' + sIdx}
                            title={`${shard.name}: ${shard.fourWords}`}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                                : 'bg-slate-900 border border-slate-800 text-slate-600 opacity-40'
                            }`}
                          >
                            {getShardIcon(shard.iconName)}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-right pr-1">
                      <span className="text-[11px] font-black uppercase text-amber-300 font-mono block leading-none">
                        {chosenShard.fourWords}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase font-mono">
                        {rowIdx === 0 ? 'Offense' : rowIdx === 1 ? 'Flex' : 'Defense'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 3: TACTICAL ENGINE & MATCHUP PIVOTS (3 Cols)       */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Active Inspection Card (Shows what the clicked/hovered rune is for in <= 4 words) */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col gap-2 relative overflow-hidden">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                Rune Inspector
              </span>
              <span className="text-[9.5px] font-mono text-emerald-400 uppercase">
                4-Word Summary
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-slate-950 p-1 border border-slate-700 flex-shrink-0 flex items-center justify-center">
                {inspectedRune.icon ? (
                  <img src={inspectedRune.icon} alt={inspectedRune.name} className="w-full h-full object-contain rounded-full" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-black uppercase text-white tracking-wide block truncate">
                  {inspectedRune.name}
                </span>
                <span className="text-xs font-black uppercase text-amber-300 tracking-wider block">
                  {inspectedRune.fourWords}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1 border-t border-slate-800/60">
              {inspectedRune.details}
            </p>
          </div>

          {/* Matchup Swap Rule (Crucial Deadlock Pivot) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-amber-950/30 via-slate-900 to-amber-950/20 border border-amber-500/40 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/20">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Matchup Swap Rule
                </span>
              </div>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-400/40">
                PIVOT
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-950/80 border border-amber-500/20 text-[11px]">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-400 block mb-0.5">
                When Facing Matchup:
              </span>
              <p className="text-slate-200 font-sans font-medium leading-snug">
                {runeKit.swapRule.trigger}
              </p>
            </div>

            {/* Swap visual pathway */}
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[9px] font-black uppercase text-rose-400">DROP</span>
                <span className="text-[11px] font-black uppercase text-slate-300 truncate">
                  {runeKit.swapRule.insteadOf}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse" />
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[9px] font-black uppercase text-emerald-400">TAKE</span>
                <span className="text-[11px] font-black uppercase text-emerald-300 font-bold truncate">
                  {runeKit.swapRule.take}
                </span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-[10.5px] text-slate-400 font-sans leading-snug">
              <strong className="text-slate-300">Why:</strong> {runeKit.swapRule.why}
            </div>
          </div>

          {/* 1-Click Live Import Button */}
          <div className="space-y-2">
            <button
              onClick={handleQuickImport}
              disabled={importing}
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/40 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current text-slate-950" />
              <span>{importing ? 'Applying to Client...' : 'INJECT RUNES INTO LEAGUE'}</span>
            </button>

            {importResult && (
              <div className={`p-2 rounded-lg border text-xs flex items-center gap-2 font-sans ${
                importResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/60 text-rose-300'
              }`}>
                {importResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                <span className="line-clamp-2">{importResult.message}</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
