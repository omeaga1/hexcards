import React, { useMemo } from 'react';
import { ChampionDetail, TacticalGuide } from '../../types';
import { getPassiveIconUrl, getSpellIconUrl, cleanDDragonText } from '../../services/ddragon';
import { Swords, Info, ArrowRight, Clock, Droplets, Zap, Shield, Sparkles } from 'lucide-react';
import { GlossaryText } from '../Glossary/BG3Tooltip';
import { usePinnedCards } from '../../context/PinnedCardContext';
import { useDevice } from '../../hooks/useDevice';

interface AbilityCardsProps {
  version: string;
  champion: ChampionDetail;
  tactics: TacticalGuide;
}

export const AbilityCards: React.FC<AbilityCardsProps> = ({
  version,
  champion,
  tactics
}) => {
  const { registerHover, unregisterHover } = usePinnedCards();
  const { isMobile, isTouch } = useDevice();

  const isGeneric = (text: string) =>
    !text ||
    text.includes('Innate passive ability') ||
    text.includes('Primary bread-and-butter skill') ||
    text.includes('Secondary utility, defensive') ||
    text.includes('Mobility dash, crowd control') ||
    text.includes('High-impact ultimate ability');

  const passiveTldr = isGeneric(tactics.plainAbilities.passive.tldr) && champion.passive.description
    ? cleanDDragonText(champion.passive.description)
    : tactics.plainAbilities.passive.tldr;

  const getSpellTldr = (idx: number, fallback: string) => {
    const spell = champion.spells[idx];
    if (isGeneric(fallback) && spell?.description) {
      return cleanDDragonText(spell.description);
    }
    return fallback;
  };

  // Parse skill max order (e.g. "Q > E > W" -> ['Q', 'E', 'W'])
  const parsedMaxOrder = useMemo(() => {
    const raw = tactics.skillMaxOrder || 'Q > W > E';
    const letters = raw.toUpperCase().replace(/[^QWE]/g, '').split('') as ('Q' | 'W' | 'E')[];
    const unique = Array.from(new Set(letters));
    if (unique.length === 3) return unique;
    return ['Q', 'W', 'E'] as ('Q' | 'W' | 'E')[];
  }, [tactics.skillMaxOrder]);

  const [firstMaxKey, secondMaxKey, thirdMaxKey] = parsedMaxOrder;

  // Calculate standard 1-18 level progression matrix based on max order
  const skillMatrix = useMemo(() => {
    const allocation: Record<number, 'Q' | 'W' | 'E' | 'R'> = {
      1: firstMaxKey,
      2: secondMaxKey,
      3: thirdMaxKey,
      4: firstMaxKey,
      5: firstMaxKey,
      6: 'R',
      7: firstMaxKey,
      8: secondMaxKey,
      9: firstMaxKey,
      10: secondMaxKey,
      11: 'R',
      12: secondMaxKey,
      13: secondMaxKey,
      14: thirdMaxKey,
      15: thirdMaxKey,
      16: 'R',
      17: thirdMaxKey,
      18: thirdMaxKey,
    };

    const rows: Record<'Q' | 'W' | 'E' | 'R', Set<number>> = {
      Q: new Set(),
      W: new Set(),
      E: new Set(),
      R: new Set(),
    };

    for (let lvl = 1; lvl <= 18; lvl++) {
      const key = allocation[lvl];
      if (key) {
        rows[key].add(lvl);
      }
    }

    return { allocation, rows };
  }, [firstMaxKey, secondMaxKey, thirdMaxKey]);

  // Spell lookup helpers
  const spellKeyToIndex: Record<string, number> = { Q: 0, W: 1, E: 2, R: 3 };

  const getSpellIcon = (key: string) => {
    const idx = spellKeyToIndex[key];
    if (idx !== undefined && champion.spells[idx]) {
      return getSpellIconUrl(version, champion.spells[idx].image.full);
    }
    return '';
  };

  const getSpellName = (key: string) => {
    const idx = spellKeyToIndex[key];
    if (idx !== undefined && champion.spells[idx]) {
      return champion.spells[idx].name;
    }
    return key;
  };

  // Build structured ability cards
  const abilityCardsData = [
    {
      key: 'PASSIVE',
      name: champion.passive.name,
      iconUrl: getPassiveIconUrl(version, champion.passive.image.full),
      tldr: passiveTldr,
      whenToUse: tactics.plainAbilities.passive.whenToUse,
      maxRankBadge: null,
      cooldown: null,
      cost: 'Innate',
    },
    {
      key: 'Q',
      name: champion.spells[0]?.name || 'Ability Q',
      iconUrl: champion.spells[0] ? getSpellIconUrl(version, champion.spells[0].image.full) : '',
      tldr: getSpellTldr(0, tactics.plainAbilities.q.tldr),
      whenToUse: tactics.plainAbilities.q.whenToUse,
      maxRankBadge: firstMaxKey === 'Q' ? '1ST MAX' : secondMaxKey === 'Q' ? '2ND MAX' : '3RD MAX',
      cooldown: champion.spells[0]?.cooldownBurn,
      cost: champion.spells[0]?.costBurn && champion.spells[0]?.costBurn !== '0'
        ? `${champion.spells[0].costBurn} ${champion.partype || 'Mana'}`
        : 'No Cost',
    },
    {
      key: 'W',
      name: champion.spells[1]?.name || 'Ability W',
      iconUrl: champion.spells[1] ? getSpellIconUrl(version, champion.spells[1].image.full) : '',
      tldr: getSpellTldr(1, tactics.plainAbilities.w.tldr),
      whenToUse: tactics.plainAbilities.w.whenToUse,
      maxRankBadge: firstMaxKey === 'W' ? '1ST MAX' : secondMaxKey === 'W' ? '2ND MAX' : '3RD MAX',
      cooldown: champion.spells[1]?.cooldownBurn,
      cost: champion.spells[1]?.costBurn && champion.spells[1]?.costBurn !== '0'
        ? `${champion.spells[1].costBurn} ${champion.partype || 'Mana'}`
        : 'No Cost',
    },
    {
      key: 'E',
      name: champion.spells[2]?.name || 'Ability E',
      iconUrl: champion.spells[2] ? getSpellIconUrl(version, champion.spells[2].image.full) : '',
      tldr: getSpellTldr(2, tactics.plainAbilities.e.tldr),
      whenToUse: tactics.plainAbilities.e.whenToUse,
      maxRankBadge: firstMaxKey === 'E' ? '1ST MAX' : secondMaxKey === 'E' ? '2ND MAX' : '3RD MAX',
      cooldown: champion.spells[2]?.cooldownBurn,
      cost: champion.spells[2]?.costBurn && champion.spells[2]?.costBurn !== '0'
        ? `${champion.spells[2].costBurn} ${champion.partype || 'Mana'}`
        : 'No Cost',
    },
    {
      key: 'R',
      name: champion.spells[3]?.name || 'Ultimate',
      iconUrl: champion.spells[3] ? getSpellIconUrl(version, champion.spells[3].image.full) : '',
      tldr: getSpellTldr(3, tactics.plainAbilities.r.tldr),
      whenToUse: tactics.plainAbilities.r.whenToUse,
      maxRankBadge: 'RANKS AT 6 / 11 / 16',
      cooldown: champion.spells[3]?.cooldownBurn,
      cost: champion.spells[3]?.costBurn && champion.spells[3]?.costBurn !== '0'
        ? `${champion.spells[3].costBurn} ${champion.partype || 'Mana'}`
        : 'No Cost',
    },
  ];

  const progressionRows: Array<{ key: 'Q' | 'W' | 'E' | 'R'; label: string; priorityBadge: string }> = [
    { key: 'Q', label: champion.spells[0]?.name || 'Ability Q', priorityBadge: firstMaxKey === 'Q' ? '1st Max' : secondMaxKey === 'Q' ? '2nd Max' : '3rd Max' },
    { key: 'W', label: champion.spells[1]?.name || 'Ability W', priorityBadge: firstMaxKey === 'W' ? '1st Max' : secondMaxKey === 'W' ? '2nd Max' : '3rd Max' },
    { key: 'E', label: champion.spells[2]?.name || 'Ability E', priorityBadge: firstMaxKey === 'E' ? '1st Max' : secondMaxKey === 'E' ? '2nd Max' : '3rd Max' },
    { key: 'R', label: champion.spells[3]?.name || 'Ultimate', priorityBadge: 'Lvls 6, 11, 16' },
  ];

  return (
    <div className="deadlock-frame w-full rounded-xl p-3 sm:p-5 shadow-sm flex flex-col gap-4 font-['Barlow_Condensed'] bg-[#edf2e8] border-2 border-[#b5c2af]">
      
      {/* ============================================================ */}
      {/* HEADER & RECOMMENDED SKILL PRIORITY HERO CARDS (MOBALYTICS)  */}
      {/* ============================================================ */}
      <div className="rounded-xl bg-white border border-[#c8d4c2] p-3 sm:p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="deadlock-badge px-2.5 py-0.5 text-xs sm:text-sm text-emerald-800 bg-emerald-50 border-emerald-300">
              <span>SKILL PATH</span>
            </span>
            <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-wide">
              Recommended Skill Upgrade Order
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Optimal patch {version} solo-queue skill allocation</span>
          </div>
        </div>

        {/* 3 Priority Cards Connected by Chevrons (Mobalytics style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
          {/* 1st Max */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-white border-2 border-emerald-500 shadow-2xs relative overflow-hidden">
            <div className="w-12 h-12 rounded-lg border-2 border-emerald-600 overflow-hidden bg-slate-900 flex-shrink-0 shadow-sm relative">
              <img
                src={getSpellIcon(firstMaxKey)}
                alt={getSpellName(firstMaxKey)}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 bg-emerald-600 text-white text-[10px] font-black px-1 leading-tight rounded-tl font-mono">
                {firstMaxKey}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded font-sans">
                  1ST MAX
                </span>
                <span className="text-[11px] font-bold text-slate-500 font-sans">
                  (Levels 1, 4, 5, 7, 9)
                </span>
              </div>
              <h4 className="text-base font-black uppercase text-slate-900 truncate mt-0.5">
                [{firstMaxKey}] {getSpellName(firstMaxKey)}
              </h4>
            </div>
          </div>

          {/* 2nd Max */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-300 shadow-2xs relative overflow-hidden">
            <div className="w-12 h-12 rounded-lg border-2 border-slate-400 overflow-hidden bg-slate-900 flex-shrink-0 shadow-sm relative">
              <img
                src={getSpellIcon(secondMaxKey)}
                alt={getSpellName(secondMaxKey)}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 bg-slate-700 text-white text-[10px] font-black px-1 leading-tight rounded-tl font-mono">
                {secondMaxKey}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-200 px-1.5 py-0.2 rounded font-sans">
                  2ND MAX
                </span>
                <span className="text-[11px] font-bold text-slate-500 font-sans">
                  (Levels 2, 8, 10, 12, 13)
                </span>
              </div>
              <h4 className="text-base font-black uppercase text-slate-900 truncate mt-0.5">
                [{secondMaxKey}] {getSpellName(secondMaxKey)}
              </h4>
            </div>
          </div>

          {/* 3rd Max */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-300 shadow-2xs relative overflow-hidden">
            <div className="w-12 h-12 rounded-lg border-2 border-slate-400 overflow-hidden bg-slate-900 flex-shrink-0 shadow-sm relative">
              <img
                src={getSpellIcon(thirdMaxKey)}
                alt={getSpellName(thirdMaxKey)}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 bg-slate-700 text-white text-[10px] font-black px-1 leading-tight rounded-tl font-mono">
                {thirdMaxKey}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-200 px-1.5 py-0.2 rounded font-sans">
                  3RD MAX
                </span>
                <span className="text-[11px] font-bold text-slate-500 font-sans">
                  (Levels 3, 14, 15, 17, 18)
                </span>
              </div>
              <h4 className="text-base font-black uppercase text-slate-900 truncate mt-0.5">
                [{thirdMaxKey}] {getSpellName(thirdMaxKey)}
              </h4>
            </div>
          </div>
        </div>

        {/* Why Max Explanation Callout */}
        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 font-sans flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-950 font-bold">Why max {tactics.skillMaxOrder}? </strong>
            <span>{tactics.skillMaxReason || 'Provides optimal damage scaling, cooldown reduction, and wave priority in the early-to-mid game.'}</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1-18 LEVEL SKILL PROGRESSION MATRIX (MOBALYTICS / OP.GG)     */}
      {/* ============================================================ */}
      <div className="rounded-xl bg-white border border-[#c8d4c2] p-3 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
            Levels 1 – 18 Skill Progression Matrix
          </h3>
          <span className="text-[11px] text-slate-500 font-sans font-medium hidden sm:inline">
            Ultimate [R] automatically ranked at levels 6, 11, and 16
          </span>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto pb-1 no-scrollbar">
          <div className="min-w-[640px]">
            {/* Level Column Headers */}
            <div className="grid grid-cols-[140px_repeat(18,1fr)] gap-1 pb-1 text-center font-mono text-[11px] font-bold text-slate-500 border-b border-slate-200 mb-1.5">
              <div className="text-left font-['Barlow_Condensed'] font-black uppercase tracking-wider text-slate-700 text-xs pl-1">
                Ability / Level
              </div>
              {Array.from({ length: 18 }, (_, i) => i + 1).map((lvl) => (
                <div
                  key={lvl}
                  className={`py-0.5 rounded ${
                    lvl === 6 || lvl === 11 || lvl === 16
                      ? 'bg-amber-100 text-amber-900 font-black border border-amber-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {lvl}
                </div>
              ))}
            </div>

            {/* Spell Rows: Q, W, E, R */}
            <div className="space-y-1.5">
              {progressionRows.map(({ key, label, priorityBadge }) => {
                const isUlt = key === 'R';
                const isFirstMax = firstMaxKey === key;

                return (
                  <div
                    key={key}
                    className="grid grid-cols-[140px_repeat(18,1fr)] gap-1 items-center p-1 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    {/* Row Header with Spell Icon & Name */}
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <div className="w-7 h-7 rounded border border-slate-300 overflow-hidden bg-slate-900 flex-shrink-0 relative">
                        <img
                          src={getSpellIcon(key)}
                          alt={label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span
                            className={`px-1 py-0 text-[10px] font-black rounded font-mono ${
                              isUlt
                                ? 'bg-amber-200 text-amber-900'
                                : isFirstMax
                                ? 'bg-emerald-200 text-emerald-950'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {key}
                          </span>
                          <span className="text-xs font-black uppercase text-slate-800 truncate font-['Barlow_Condensed']">
                            {label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 18 Level Columns */}
                    {Array.from({ length: 18 }, (_, i) => i + 1).map((lvl) => {
                      const isSkilled = skillMatrix.rows[key].has(lvl);

                      if (!isSkilled) {
                        return (
                          <div
                            key={lvl}
                            className="h-7 rounded flex items-center justify-center bg-white/70 border border-slate-100 text-[10px] text-slate-300 font-mono"
                          >
                            ·
                          </div>
                        );
                      }

                      // Skilled at this level!
                      return (
                        <div
                          key={lvl}
                          className={`h-7 rounded flex items-center justify-center font-mono font-black text-xs shadow-2xs transition-transform transform hover:scale-105 ${
                            isUlt
                              ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 border border-amber-600 shadow-amber-200'
                              : isFirstMax
                              ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white border border-emerald-700 shadow-emerald-200'
                              : 'bg-gradient-to-b from-slate-700 to-slate-800 text-white border border-slate-900'
                          }`}
                          title={`Level ${lvl}: Upgrade [${key}] ${label}`}
                        >
                          {key}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PICTURED ABILITY CARDS WITH COOLDOWNS & COSTS (MOBALYTICS)   */}
      {/* ============================================================ */}
      <div className="rounded-xl bg-white border border-[#c8d4c2] p-3 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
              Detailed Ability Breakdown & Tactical Triggers
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-sans hidden sm:inline">
            Hover or pin abilities to inspect kit details
          </span>
        </div>

        <div className="space-y-2.5">
          {abilityCardsData.map((ability) => (
            <div
              key={ability.key}
              onMouseEnter={(e) => {
                if (isMobile || isTouch) return;
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                registerHover({
                  id: ability.key,
                  type: 'ability',
                  title: `[${ability.key}] ${ability.name}`,
                  category: 'Champion Ability',
                  data: {
                    spell: { name: ability.name, image: { full: ability.iconUrl.split('/').pop() || '' } },
                    abilityTactics: {
                      tldr: ability.tldr,
                      plainEnglish: ability.tldr,
                      whenToUse: ability.whenToUse
                    },
                    key: ability.key,
                    version
                  },
                  getCoords: () => ({
                    x: Math.min(window.innerWidth - 360, Math.max(20, mouseX + 20)),
                    y: Math.min(window.innerHeight - 250, Math.max(40, mouseY - 40))
                  })
                });
              }}
              onMouseLeave={() => {
                if (isMobile || isTouch) return;
                unregisterHover(ability.key);
              }}
              className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 sm:hover:border-emerald-500 sm:hover:bg-white sm:hover:shadow-sm transition-all flex flex-col sm:flex-row gap-3 items-start relative group"
            >
              {!isMobile && !isTouch && (
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[8.5px] px-1.5 py-0.2 rounded bg-slate-900 text-white font-bold border border-slate-700 font-sans absolute top-2 right-2">
                  [Tab] to Pin
                </span>
              )}

              {/* Large Pictured Ability Icon with Key & Status Badges */}
              <div className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-shrink-0 w-full sm:w-28">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-emerald-500 overflow-hidden bg-slate-900 flex-shrink-0 shadow-sm">
                  <img
                    src={ability.iconUrl}
                    alt={ability.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 bg-slate-950/85 text-emerald-400 font-black text-[11px] px-1.5 py-0.5 rounded-br border-r border-b border-emerald-500/50 font-mono">
                    {ability.key === 'PASSIVE' ? 'P' : ability.key}
                  </div>
                </div>

                <div className="flex-1 sm:text-center">
                  <span className="font-mono text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 rounded block sm:inline-block">
                    {ability.key}
                  </span>
                  {ability.maxRankBadge && (
                    <span className="text-[9.5px] font-black uppercase text-slate-600 bg-slate-200/80 px-1.5 py-0.2 rounded block mt-1 font-sans">
                      {ability.maxRankBadge}
                    </span>
                  )}
                </div>
              </div>

              {/* Ability Information, Cooldown, Cost, and Tactical Guide */}
              <div className="flex-1 space-y-2 w-full text-xs sm:text-[13px] font-sans">
                {/* Name & Resource Bar */}
                <div className="flex flex-wrap items-center justify-between gap-1 pb-1.5 border-b border-slate-200">
                  <h4 className="text-base sm:text-lg font-black uppercase text-slate-900 font-['Barlow_Condensed']">
                    {ability.name}
                  </h4>

                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                    {ability.cooldown && (
                      <span className="flex items-center gap-1 text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{ability.cooldown}s CD</span>
                      </span>
                    )}
                    {ability.cost && (
                      <span className="flex items-center gap-1 text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        <Droplets className="w-3 h-3 text-sky-600" />
                        <span>{ability.cost}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* What it does */}
                <p className="text-slate-800 leading-relaxed">
                  <strong className="text-emerald-900 font-bold">What it does: </strong>
                  <GlossaryText text={ability.tldr} />
                </p>

                {/* When to press */}
                <div className="p-2.5 rounded-lg bg-emerald-50/90 border border-emerald-200 text-slate-800 leading-relaxed">
                  <strong className="text-emerald-950 font-bold">When to press: </strong>
                  <GlossaryText text={ability.whenToUse} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* BREAD & BUTTER COMBOS (MOBALYTICS COMBO CARDS)               */}
      {/* ============================================================ */}
      {tactics.combos.length > 0 && (
        <div className="rounded-xl bg-white border border-[#c8d4c2] p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
            <span className="text-xs sm:text-sm font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5 font-['Barlow_Condensed']">
              <Swords className="w-4 h-4 text-emerald-600" />
              Bread & Butter Combos:
            </span>
            <span className="text-[11px] text-slate-500 font-sans hidden sm:inline">
              Practice execution in Practice Tool or early lane skirmishes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tactics.combos.map((combo, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-[13px] shadow-2xs">
                <span className="font-black uppercase text-slate-900 block mb-1.5 font-['Barlow_Condensed'] text-sm sm:text-base">
                  {combo.name}:
                </span>
                
                {/* Sequence Chips with Arrows */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2 font-['Barlow_Condensed']">
                  {combo.sequence.map((step, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span className="px-2 py-0.5 rounded bg-white text-slate-900 font-black text-xs border border-slate-300 shadow-2xs">
                        {step}
                      </span>
                      {sIdx < combo.sequence.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <p className="text-xs text-slate-700 font-sans leading-relaxed bg-white p-2 rounded-lg border border-slate-200">
                  <strong className="text-emerald-900 font-bold">Execution Tip:</strong> {combo.tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

