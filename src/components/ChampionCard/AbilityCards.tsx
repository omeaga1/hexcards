import React, { useState, useMemo } from 'react';
import { ChampionDetail, TacticalGuide } from '../../types';
import { getPassiveIconUrl, getSpellIconUrl, cleanDDragonText } from '../../services/ddragon';
import {
  Swords,
  Info,
  ArrowRight,
  Clock,
  Droplets,
  Target,
  Zap,
  Layers,
  Crosshair
} from 'lucide-react';
import { GlossaryText } from '../Glossary/BG3Tooltip';
import { usePinnedCards } from '../../context/PinnedCardContext';
import { useDevice } from '../../hooks/useDevice';

interface AbilityCardsProps {
  version: string;
  champion: ChampionDetail;
  tactics: TacticalGuide;
}

type AbilityKey = 'PASSIVE' | 'Q' | 'W' | 'E' | 'R';

// Generic filler words blacklist
const isGenericSlop = (text: string): boolean => {
  if (!text) return true;
  const lower = text.toLowerCase();
  return (
    lower.includes('innate passive ability') ||
    lower.includes('innate passive providing') ||
    lower.includes('primary bread-and-butter') ||
    lower.includes('core bread-and-butter') ||
    lower.includes('bread-and-butter') ||
    lower.includes('establishing lane dominance') ||
    lower.includes('secondary utility, defensive') ||
    lower.includes('mobility dash, crowd control') ||
    lower.includes('high-impact ultimate ability') ||
    lower.includes('game-altering ultimate') ||
    lower.includes('tactical utility, survivability') ||
    lower.includes('execute primary ability rotation') ||
    lower.includes('initiate with cc / gap closer') ||
    lower.includes('track passive cooldowns') ||
    lower.includes('use frequently for last hitting')
  );
};

// Deadlock-inspired mechanic tags detector
const detectAbilityTags = (
  key: AbilityKey,
  spell: any,
  description: string
): string[] => {
  const d = (description || '').toLowerCase();
  const tags: string[] = [];

  if (key === 'PASSIVE') {
    tags.push('PASSIVE');
    if (/\b(?:heal|healing|lifesteal|vamp|health)\b/.test(d) && !/missing health/.test(d)) {
      tags.push('SUSTAIN');
    }
    if (/\b(?:movement speed|bonus move|dash)\b/.test(d)) {
      tags.push('MOBILITY');
    }
    if (/\b(?:attack speed|stacks|ramping|stacking)\b/.test(d)) {
      tags.push('BUFF / RAMP');
    }
    return tags;
  }

  const range = spell?.rangeBurn || '';
  if (range === '25000' || range.toLowerCase() === 'global' || /across the map|global/.test(d)) {
    tags.push('GLOBAL');
  } else if (parseInt(range, 10) >= 1000) {
    tags.push('LONG RANGE');
  }

  if (/\b(?:stun|stuns|stunned)\b/.test(d)) tags.push('STUN');
  if (/\b(?:root|roots|rooted|snare|snares)\b/.test(d)) tags.push('ROOT');
  if (/\b(?:knockup|knock up|knocks up|airborne|displaces?)\b/.test(d)) tags.push('DISPLACEMENT');
  if (/\b(?:charm|charms|charmed)\b/.test(d)) tags.push('CHARM');
  if (/\b(?:fear|fears|feared|flee)\b/.test(d)) tags.push('FEAR');
  if (/\b(?:suppress|suppresses|suppression)\b/.test(d)) tags.push('SUPPRESSION');
  if (/\b(?:slows|slowed|slowing)\b/.test(d) && !/attacks slower|slows self/.test(d)) tags.push('SLOW');
  if (/\b(?:dash|dashes|leap|leaps|blink|blinks|teleport)\b/.test(d)) tags.push('MOBILITY');
  if (/\b(?:shield|shields|barrier|damage reduction)\b/.test(d)) tags.push('SHIELD');
  if (/\b(?:heals|healing|restores health)\b/.test(d)) tags.push('HEAL');
  if (/\b(?:execute|missing health|true damage)\b/.test(d)) tags.push('TRUE DMG / EXECUTE');
  if (/\b(?:skillshot|projectile|fires a|fires an|launches|shoots|sends out)\b/.test(d)) tags.push('SKILLSHOT');
  if (/\b(?:area of effect|nearby enemies|aoe|all enemies in|radius|surrounding)\b/.test(d)) tags.push('AOE');

  if (tags.length === 0) tags.push('TARGET / COMBAT');
  return tags.slice(0, 4);
};

// Tag styling helper
const getTagBadgeStyle = (tag: string): string => {
  switch (tag) {
    case 'PASSIVE':
      return 'bg-purple-100/90 text-purple-900 border-purple-300';
    case 'SKILLSHOT':
      return 'bg-sky-100/90 text-sky-900 border-sky-300';
    case 'AOE':
      return 'bg-amber-100/90 text-amber-900 border-amber-300';
    case 'SLOW':
      return 'bg-teal-100/90 text-teal-900 border-teal-300';
    case 'ROOT':
    case 'STUN':
    case 'SUPPRESSION':
    case 'CHARM':
    case 'FEAR':
      return 'bg-rose-100/90 text-rose-900 border-rose-300 font-bold';
    case 'DISPLACEMENT':
      return 'bg-orange-100/90 text-orange-900 border-orange-300';
    case 'MOBILITY':
      return 'bg-emerald-100/90 text-emerald-900 border-emerald-300';
    case 'SHIELD':
    case 'HEAL':
    case 'SUSTAIN':
      return 'bg-green-100/90 text-green-900 border-green-300';
    case 'TRUE DMG / EXECUTE':
      return 'bg-red-100/90 text-red-900 border-red-300 font-bold';
    case 'GLOBAL':
    case 'LONG RANGE':
      return 'bg-indigo-100/90 text-indigo-900 border-indigo-300 font-bold';
    case 'BUFF / RAMP':
      return 'bg-yellow-100/90 text-yellow-900 border-yellow-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

// Stat formatting helpers
const formatCooldown = (cd?: string): string => {
  if (!cd || cd === '0') return 'No CD';
  const parts = cd.split('/');
  if (parts.length > 1 && parts[0] !== parts[parts.length - 1]) {
    return `${parts[0]}s ➔ ${parts[parts.length - 1]}s`;
  }
  return `${parts[0]}s`;
};

const formatCost = (cost?: string, costType?: string, partype?: string): string => {
  if (!cost || cost === '0') return 'No Cost';
  const trimmedType = (costType || '').trim();
  const resource = trimmedType && !trimmedType.startsWith('{{') ? trimmedType : (partype || 'Mana');
  const parts = cost.split('/');
  if (parts.length > 1 && parts[0] !== parts[parts.length - 1]) {
    return `${parts[0]} ➔ ${parts[parts.length - 1]} ${resource}`;
  }
  return `${parts[0]} ${resource}`;
};

const formatRange = (range?: string): string => {
  if (!range || range === '0' || range.toLowerCase() === 'self') return 'Self';
  if (range === '25000' || range.toLowerCase() === 'global') return 'Global';
  return `${range} Range`;
};

// Dynamic tactical cue synthesizer (when no handcrafted cue exists)
const getCombatApplication = (
  key: AbilityKey,
  tags: string[],
  handcraftedWhenToUse?: string
): string => {
  if (handcraftedWhenToUse && !isGenericSlop(handcraftedWhenToUse)) {
    return handcraftedWhenToUse;
  }

  if (
    tags.includes('STUN') ||
    tags.includes('ROOT') ||
    tags.includes('CHARM') ||
    tags.includes('SUPPRESSION') ||
    tags.includes('DISPLACEMENT')
  ) {
    return 'Lead initiation or layer immediately onto allied crowd control to guarantee hits.';
  }
  if (tags.includes('GLOBAL') || tags.includes('LONG RANGE')) {
    return 'Snipe escaping targets or assist sidelane skirmishes from long distance.';
  }
  if (tags.includes('TRUE DMG / EXECUTE')) {
    return 'Save for low-health targets to maximize missing-health burst and secure takedowns.';
  }
  if (tags.includes('MOBILITY')) {
    return 'Hold for dodging lethal skillshots, navigating terrain, or aggressively closing the gap.';
  }
  if (tags.includes('SHIELD') || tags.includes('HEAL')) {
    return 'Pop during enemy burst trades or tower dives to negate incoming damage.';
  }
  if (tags.includes('SLOW')) {
    return 'Cast to peel approaching threats or lock down retreating targets for follow-up attacks.';
  }
  if (key === 'PASSIVE') {
    return 'Track status and stack counters to time favorable trading windows.';
  }
  if (key === 'R') {
    return 'Deploy in teamfight clashes to turn skirmishes and secure decisive advantages.';
  }
  if (key === 'Q') {
    return 'Cast to poke, contest minion waves, or initiate short trades.';
  }
  return 'Weave between basic attacks to maximize spell rotation efficiency.';
};

export const AbilityCards: React.FC<AbilityCardsProps> = ({
  version,
  champion,
  tactics
}) => {
  const { registerHover, unregisterHover } = usePinnedCards();
  const { isMobile, isTouch } = useDevice();
  const [viewMode, setViewMode] = useState<'deck' | 'inspector'>('deck');
  const [focusedKey, setFocusedKey] = useState<AbilityKey>('Q');

  // Parse skill max order (e.g. "Q > E > W" -> ['Q', 'E', 'W'])
  const parsedMaxOrder = useMemo(() => {
    const raw = tactics.skillMaxOrder || 'Q > W > E';
    const letters = raw.toUpperCase().replace(/[^QWE]/g, '').split('') as ('Q' | 'W' | 'E')[];
    const unique = Array.from(new Set(letters));
    if (unique.length === 3) return unique;
    return ['Q', 'W', 'E'] as ('Q' | 'W' | 'E')[];
  }, [tactics.skillMaxOrder]);

  const [firstMaxKey, secondMaxKey, thirdMaxKey] = parsedMaxOrder;

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

  // 1-18 Level Progression Matrix calculation
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
      if (key) rows[key].add(lvl);
    }

    return { allocation, rows };
  }, [firstMaxKey, secondMaxKey, thirdMaxKey]);

  // Build authentic, zero-slop ability data array
  const abilitiesData = useMemo(() => {
    const qSpell = champion.spells[0];
    const wSpell = champion.spells[1];
    const eSpell = champion.spells[2];
    const rSpell = champion.spells[3];

    // Description resolution (Riot DataDragon clean text without filler)
    const passiveDesc = champion.passive?.description
      ? cleanDDragonText(champion.passive.description)
      : tactics.plainAbilities?.passive?.tldr || '';

    const getDesc = (spell: any, fallback: string) => {
      if (spell?.description) return cleanDDragonText(spell.description);
      return !isGenericSlop(fallback) ? fallback : '';
    };

    const passiveTags = detectAbilityTags('PASSIVE', null, passiveDesc);
    const qTags = detectAbilityTags('Q', qSpell, qSpell?.description || '');
    const wTags = detectAbilityTags('W', wSpell, wSpell?.description || '');
    const eTags = detectAbilityTags('E', eSpell, eSpell?.description || '');
    const rTags = detectAbilityTags('R', rSpell, rSpell?.description || '');

    return [
      {
        key: 'PASSIVE' as AbilityKey,
        shortKey: 'P',
        name: champion.passive?.name || 'Innate',
        iconUrl: getPassiveIconUrl(version, champion.passive?.image?.full || ''),
        tags: passiveTags,
        cooldownFormatted: 'Innate',
        costFormatted: 'No Cost',
        rangeFormatted: 'Self',
        description: passiveDesc,
        combatApplication: getCombatApplication('PASSIVE', passiveTags, tactics.plainAbilities?.passive?.whenToUse),
        maxPriorityBadge: 'INNATE PASSIVE',
        priorityTier: 'passive' as const,
        priorityColor: 'border-purple-400 bg-purple-50 text-purple-950',
      },
      {
        key: 'Q' as AbilityKey,
        shortKey: 'Q',
        name: qSpell?.name || 'Ability Q',
        iconUrl: qSpell ? getSpellIconUrl(version, qSpell.image.full) : '',
        tags: qTags,
        cooldownFormatted: formatCooldown(qSpell?.cooldownBurn),
        costFormatted: formatCost(qSpell?.costBurn, qSpell?.costType, champion.partype),
        rangeFormatted: formatRange(qSpell?.rangeBurn),
        description: getDesc(qSpell, tactics.plainAbilities?.q?.tldr || ''),
        combatApplication: getCombatApplication('Q', qTags, tactics.plainAbilities?.q?.whenToUse),
        maxPriorityBadge: firstMaxKey === 'Q' ? 'MAX 1ST (LVL 1, 4, 5, 7, 9)' : secondMaxKey === 'Q' ? 'MAX 2ND (LVL 2, 8, 10, 12, 13)' : 'MAX 3RD',
        priorityTier: firstMaxKey === 'Q' ? ('1st' as const) : secondMaxKey === 'Q' ? ('2nd' as const) : ('3rd' as const),
        priorityColor: firstMaxKey === 'Q' ? 'border-emerald-500 bg-emerald-50 text-emerald-950' : 'border-slate-400 bg-slate-100 text-slate-800',
      },
      {
        key: 'W' as AbilityKey,
        shortKey: 'W',
        name: wSpell?.name || 'Ability W',
        iconUrl: wSpell ? getSpellIconUrl(version, wSpell.image.full) : '',
        tags: wTags,
        cooldownFormatted: formatCooldown(wSpell?.cooldownBurn),
        costFormatted: formatCost(wSpell?.costBurn, wSpell?.costType, champion.partype),
        rangeFormatted: formatRange(wSpell?.rangeBurn),
        description: getDesc(wSpell, tactics.plainAbilities?.w?.tldr || ''),
        combatApplication: getCombatApplication('W', wTags, tactics.plainAbilities?.w?.whenToUse),
        maxPriorityBadge: firstMaxKey === 'W' ? 'MAX 1ST (LVL 1, 4, 5, 7, 9)' : secondMaxKey === 'W' ? 'MAX 2ND (LVL 2, 8, 10, 12, 13)' : 'MAX 3RD',
        priorityTier: firstMaxKey === 'W' ? ('1st' as const) : secondMaxKey === 'W' ? ('2nd' as const) : ('3rd' as const),
        priorityColor: firstMaxKey === 'W' ? 'border-emerald-500 bg-emerald-50 text-emerald-950' : 'border-slate-400 bg-slate-100 text-slate-800',
      },
      {
        key: 'E' as AbilityKey,
        shortKey: 'E',
        name: eSpell?.name || 'Ability E',
        iconUrl: eSpell ? getSpellIconUrl(version, eSpell.image.full) : '',
        tags: eTags,
        cooldownFormatted: formatCooldown(eSpell?.cooldownBurn),
        costFormatted: formatCost(eSpell?.costBurn, eSpell?.costType, champion.partype),
        rangeFormatted: formatRange(eSpell?.rangeBurn),
        description: getDesc(eSpell, tactics.plainAbilities?.e?.tldr || ''),
        combatApplication: getCombatApplication('E', eTags, tactics.plainAbilities?.e?.whenToUse),
        maxPriorityBadge: firstMaxKey === 'E' ? 'MAX 1ST (LVL 1, 4, 5, 7, 9)' : secondMaxKey === 'E' ? 'MAX 2ND (LVL 2, 8, 10, 12, 13)' : 'MAX 3RD',
        priorityTier: firstMaxKey === 'E' ? ('1st' as const) : secondMaxKey === 'E' ? ('2nd' as const) : ('3rd' as const),
        priorityColor: firstMaxKey === 'E' ? 'border-emerald-500 bg-emerald-50 text-emerald-950' : 'border-slate-400 bg-slate-100 text-slate-800',
      },
      {
        key: 'R' as AbilityKey,
        shortKey: 'R',
        name: rSpell?.name || 'Ultimate',
        iconUrl: rSpell ? getSpellIconUrl(version, rSpell.image.full) : '',
        tags: rTags,
        cooldownFormatted: formatCooldown(rSpell?.cooldownBurn),
        costFormatted: formatCost(rSpell?.costBurn, rSpell?.costType, champion.partype),
        rangeFormatted: formatRange(rSpell?.rangeBurn),
        description: getDesc(rSpell, tactics.plainAbilities?.r?.tldr || ''),
        combatApplication: getCombatApplication('R', rTags, tactics.plainAbilities?.r?.whenToUse),
        maxPriorityBadge: 'ULTIMATE (RANKS AT 6, 11, 16)',
        priorityTier: 'ult' as const,
        priorityColor: 'border-amber-500 bg-amber-50 text-amber-950',
      },
    ];
  }, [champion, version, tactics, firstMaxKey, secondMaxKey, thirdMaxKey]);

  // Current focused ability for inspector mode
  const currentAbility = useMemo(() => {
    return abilitiesData.find((a) => a.key === focusedKey) || abilitiesData[1];
  }, [abilitiesData, focusedKey]);

  // Filter combos to prevent generic filler
  const validCombos = useMemo(() => {
    return (tactics.combos || []).filter(
      (c) =>
        c &&
        c.name &&
        c.sequence &&
        c.sequence.length > 0 &&
        !isGenericSlop(c.name) &&
        !isGenericSlop(c.tip)
    );
  }, [tactics.combos]);

  const progressionRows = [
    { key: 'Q' as const, label: champion.spells[0]?.name || 'Ability Q' },
    { key: 'W' as const, label: champion.spells[1]?.name || 'Ability W' },
    { key: 'E' as const, label: champion.spells[2]?.name || 'Ability E' },
    { key: 'R' as const, label: champion.spells[3]?.name || 'Ultimate' },
  ];

  return (
    <div className="deadlock-frame w-full rounded-xl p-3 sm:p-5 shadow-sm flex flex-col gap-4 font-['Barlow_Condensed'] bg-[#edf2e8] border-2 border-[#b5c2af]">
      
      {/* ============================================================ */}
      {/* 1. HERO SKILL PATH & UPGRADE PRIORITY CARDS                 */}
      {/* ============================================================ */}
      <div className="deadlock-frame retro-futuristic-card rounded-xl p-3 sm:p-4 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#26433a]">
          <div className="flex items-center gap-2.5">
            <span className="deadlock-badge px-2.5 py-0.5 text-xs sm:text-sm text-emerald-800 bg-emerald-50 border-emerald-300">
              <span>SKILL PATH</span>
            </span>
            <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-wide">
              Skill Upgrade Priority & Level Milestones
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Patch {version} optimal solo-queue skill allocation</span>
          </div>
        </div>

        {/* 3 Deadlock Hero Priority Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
          {/* 1st Max */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#162b23] border-2 border-[#2dd5b7] shadow-xs relative overflow-hidden">
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
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded font-sans">
                  MAX 1ST
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
                  MAX 2ND
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
                  MAX 3RD
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
        <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs text-slate-800 font-sans flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-950 font-bold">Why max {tactics.skillMaxOrder}? </strong>
            <span>{tactics.skillMaxReason || 'Provides optimal damage scaling, cooldown reduction, and wave priority in the early-to-mid game.'}</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. 1-18 LEVEL SKILL PROGRESSION MATRIX                       */}
      {/* ============================================================ */}
      <div className="deadlock-frame retro-futuristic-card rounded-xl p-3 sm:p-4 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#26433a]">
          <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
            Levels 1 – 18 Skill Progression Matrix
          </h3>
          <span className="text-[11px] text-slate-500 font-sans font-medium hidden sm:inline">
            Ultimate [R] automatically skilled at levels 6, 11, and 16
          </span>
        </div>

        {/* Matrix Table */}
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
              {progressionRows.map(({ key, label }) => {
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
                          <span className="text-xs font-black uppercase text-[#c1c497] truncate font-['Barlow_Condensed']">
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
                            className="h-7 rounded flex items-center justify-center bg-[#0d1713]/60 border border-[#26433a] text-[10px] text-[#53685b] font-mono"
                          >
                            ·
                          </div>
                        );
                      }

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
      {/* 3. DEADLOCK ABILITY SYSTEM: CARDS DECK & FOCUS INSPECTOR     */}
      {/* ============================================================ */}
      <div className="deadlock-frame retro-futuristic-card rounded-xl p-3 sm:p-4 shadow-md relative overflow-hidden">
        
        {/* Section Header with View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#26433a]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2dd5b7] shadow-xs shadow-[#2dd5b7]/40" />
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-[#e2e5b8]">
              Tactical Abilities HUD & Combat Application
            </h3>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#0f1c17] p-0.5 rounded-lg border border-[#26433a] self-start sm:self-auto">
            <button
              onClick={() => setViewMode('deck')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold font-sans transition-all cursor-pointer ${
                viewMode === 'deck'
                  ? 'bg-[#1a352a] text-[#2dd5b7] shadow-2xs border border-[#2dd5b7]/50 font-black'
                  : 'text-[#769382] hover:text-[#e2e5b8] hover:bg-[#162821]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#2dd5b7]" />
              <span>All Abilities Deck</span>
            </button>
            <button
              onClick={() => setViewMode('inspector')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold font-sans transition-all cursor-pointer ${
                viewMode === 'inspector'
                  ? 'bg-[#1a352a] text-[#2dd5b7] shadow-2xs border border-[#2dd5b7]/50 font-black'
                  : 'text-[#769382] hover:text-[#e2e5b8] hover:bg-[#162821]'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 text-[#2dd5b7]" />
              <span>Focus Inspector</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* MODE A: DEADLOCK FOCUS INSPECTOR (HERO TAB BAR)              */}
        {/* ------------------------------------------------------------ */}
        {viewMode === 'inspector' && (
          <div className="space-y-3 mb-2">
            {/* Deadlock Hotkey Selector Strip */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 p-1.5 rounded-xl bg-[#0f1c17] border border-[#26433a]">
              {abilitiesData.map((ability) => {
                const isActive = ability.key === focusedKey;
                return (
                  <button
                    key={ability.key}
                    onClick={() => setFocusedKey(ability.key)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1a352a] border-[#2dd5b7] shadow-sm text-[#2dd5b7] scale-[1.02]'
                        : 'bg-transparent border-transparent hover:bg-[#162821] text-[#769382] hover:text-[#c1c497]'
                    }`}
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded overflow-hidden bg-slate-900 relative flex-shrink-0 border border-[#26433a]">
                      <img
                        src={ability.iconUrl}
                        alt={ability.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 bg-slate-950/90 text-[#2dd5b7] text-[9px] font-black px-0.5 rounded-tl font-mono">
                        {ability.shortKey}
                      </span>
                    </div>
                    <div className="text-center sm:text-left min-w-0">
                      <span className="block text-[11px] sm:text-xs font-black uppercase truncate font-['Barlow_Condensed'] text-[#e2e5b8]">
                        [{ability.shortKey}] {ability.name}
                      </span>
                      <span className="hidden sm:block text-[9.5px] font-sans text-[#769382] truncate">
                        {ability.cooldownFormatted}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Focused Ability Card Display */}
            <div className="p-4 rounded-xl bg-[#13221c] border-2 border-[#2dd5b7]/60 shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#26433a]">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl border-2 border-[#2dd5b7] overflow-hidden bg-slate-900 shadow-sm flex-shrink-0">
                    <img
                      src={currentAbility.iconUrl}
                      alt={currentAbility.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-0 left-0 bg-slate-950/85 text-[#2dd5b7] font-mono font-black text-xs px-1.5 py-0.5 rounded-br border-r border-b border-[#2dd5b7]/50">
                      {currentAbility.shortKey}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-black uppercase text-[#e2e5b8] tracking-wide font-['Barlow_Condensed']">
                        {currentAbility.name}
                      </h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border font-sans bg-[#163026] border-[#2dd5b7]/50 text-[#2dd5b7]">
                        {currentAbility.maxPriorityBadge}
                      </span>
                    </div>
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {currentAbility.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[9.5px] uppercase font-black px-1.5 py-0.2 rounded border font-mono tracking-wider ${getTagBadgeStyle(
                            tag
                          )}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stat Chips */}
                <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
                  <span className="flex items-center gap-1 text-[#c1c497] bg-[#0f1c17] px-2 py-1 rounded border border-[#26433a] shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-[#769382]" />
                    <span>{currentAbility.cooldownFormatted}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[#c1c497] bg-[#0f1c17] px-2 py-1 rounded border border-[#26433a] shadow-2xs">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    <span>{currentAbility.costFormatted}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[#c1c497] bg-[#0f1c17] px-2 py-1 rounded border border-[#26433a] shadow-2xs">
                    <Target className="w-3.5 h-3.5 text-[#d2689c]" />
                    <span>{currentAbility.rangeFormatted}</span>
                  </span>
                </div>
              </div>

              {/* What It Does */}
              <div className="space-y-1 font-sans text-xs sm:text-[13px]">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#2dd5b7] block font-['Barlow_Condensed']">
                  MECHANICS BREAKDOWN
                </span>
                <p className="text-[#c1c497] leading-relaxed bg-[#0f1c17] p-3 rounded-lg border border-[#26433a]">
                  <GlossaryText text={currentAbility.description} />
                </p>
              </div>

              {/* Combat Application */}
              <div className="p-3 rounded-lg bg-[#163026] border border-[#2dd5b7]/40 text-xs sm:text-[13px] font-sans flex items-start gap-2.5 shadow-2xs">
                <Zap className="w-4 h-4 text-[#2dd5b7] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2dd5b7] font-bold block mb-0.5 font-['Barlow_Condensed'] text-xs uppercase tracking-wider">
                    COMBAT APPLICATION:
                  </strong>
                  <span className="text-[#c1c497] leading-relaxed">
                    <GlossaryText text={currentAbility.combatApplication} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* MODE B: ALL ABILITIES DECK (DEADLOCK STACK CARDS)            */}
        {/* ------------------------------------------------------------ */}
        {viewMode === 'deck' && (
          <div className="space-y-2.5">
            {abilitiesData.map((ability) => (
              <div
                key={ability.key}
                onMouseEnter={(e) => {
                  if (isMobile || isTouch) return;
                  const mouseX = e.clientX;
                  const mouseY = e.clientY;
                  registerHover({
                    id: ability.key,
                    type: 'ability',
                    title: `[${ability.shortKey}] ${ability.name}`,
                    category: 'Champion Ability',
                    data: {
                      spell: { name: ability.name, image: { full: ability.iconUrl.split('/').pop() || '' } },
                      abilityTactics: {
                        tldr: ability.description,
                        plainEnglish: ability.description,
                        whenToUse: ability.combatApplication,
                      },
                      key: ability.key,
                      version,
                    },
                    getCoords: () => ({
                      x: Math.min(window.innerWidth - 360, Math.max(20, mouseX + 20)),
                      y: Math.min(window.innerHeight - 250, Math.max(40, mouseY - 40)),
                    }),
                  });
                }}
                onMouseLeave={() => {
                  if (isMobile || isTouch) return;
                  unregisterHover(ability.key);
                }}
                className="p-3 sm:p-3.5 rounded-xl bg-[#13221c] border border-[#26433a] hover:border-[#2dd5b7] hover:bg-[#162821] hover:shadow-lg hover:shadow-[#2dd5b7]/10 transition-all flex flex-col sm:flex-row gap-3 items-start relative group"
              >
                {!isMobile && !isTouch && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-0.5 rounded bg-slate-900 text-[#2dd5b7] font-bold border border-[#2dd5b7]/50 font-sans absolute top-2 right-2 shadow-xs">
                    [Tab] to Pin
                  </span>
                )}

                {/* Left: Embossed Key Badge & Icon Frame */}
                <div className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-shrink-0 w-full sm:w-28">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-[#2dd5b7]/80 overflow-hidden bg-slate-900 flex-shrink-0 shadow-sm">
                    <img
                      src={ability.iconUrl}
                      alt={ability.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Tactile Hotkey Stencil */}
                    <div className="absolute top-0 left-0 bg-slate-950/90 text-[#2dd5b7] font-mono font-black text-xs px-1.5 py-0.5 rounded-br border-r border-b border-[#2dd5b7]/50">
                      {ability.shortKey}
                    </div>
                  </div>

                  <div className="flex-1 sm:text-center">
                    <span className="font-mono text-[11px] font-black uppercase text-[#2dd5b7] bg-[#163026] border border-[#2dd5b7]/50 px-2 py-0.5 rounded block sm:inline-block">
                      [{ability.shortKey}]
                    </span>
                    {ability.maxPriorityBadge && (
                      <span className="text-[10.5px] font-black uppercase text-[#c1c497] bg-[#1a3128] border border-[#26433a] px-2 py-0.5 rounded block mt-1 font-sans">
                        {ability.priorityTier === '1st'
                          ? '1ST MAX'
                          : ability.priorityTier === '2nd'
                          ? '2ND MAX'
                          : ability.priorityTier === '3rd'
                          ? '3RD MAX'
                          : ability.shortKey === 'R'
                          ? 'ULTIMATE'
                          : 'PASSIVE'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Ability Information, Stats, and Tactical Guide */}
                <div className="flex-1 space-y-2 w-full text-xs sm:text-sm font-sans min-w-0">
                  {/* Name, Tags, & Metric Chips Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-1 pb-1.5 border-b border-[#26433a]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg sm:text-xl font-black uppercase text-[#e2e5b8] font-['Barlow_Condensed'] tracking-wide">
                        {ability.name}
                      </h4>
                      {/* Tags */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {ability.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border font-mono tracking-wider ${getTagBadgeStyle(
                              tag
                            )}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stat Metrics Bar */}
                    <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
                      {ability.cooldownFormatted !== 'Innate' && (
                        <span className="flex items-center gap-1 text-[#c1c497] bg-[#0f1c17] px-2 py-0.5 rounded border border-[#26433a] shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-[#769382]" />
                          <span>{ability.cooldownFormatted}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[#c1c497] bg-[#0f1c17] px-2 py-0.5 rounded border border-[#26433a] shadow-2xs">
                        <Droplets className="w-3.5 h-3.5 text-sky-400" />
                        <span>{ability.costFormatted}</span>
                      </span>
                      {ability.rangeFormatted !== 'Self' && (
                        <span className="flex items-center gap-1 text-[#c1c497] bg-[#0f1c17] px-2 py-0.5 rounded border border-[#26433a] shadow-2xs">
                          <Target className="w-3.5 h-3.5 text-[#d2689c]" />
                          <span>{ability.rangeFormatted}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* What it does (Authentic Riot Mechanics) */}
                  <p className="text-[#c1c497] leading-relaxed">
                    <strong className="text-[#2dd5b7] font-bold font-['Barlow_Condensed'] text-xs sm:text-sm uppercase tracking-wider">
                      What it does:{' '}
                    </strong>
                    <GlossaryText text={ability.description} />
                  </p>

                  {/* Combat Application (Tactical Trigger) */}
                  <div className="p-2.5 rounded-lg bg-[#163026] border border-[#2dd5b7]/40 text-[#c1c497] leading-relaxed flex items-start gap-2 shadow-2xs">
                    <Zap className="w-4 h-4 text-[#2dd5b7] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#2dd5b7] font-bold font-['Barlow_Condensed'] text-xs sm:text-sm uppercase tracking-wider">
                        Combat Application:{' '}
                      </strong>
                      <GlossaryText text={ability.combatApplication} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. BREAD & BUTTER COMBOS (AUTHENTIC SEQUENCES ONLY)          */}
      {/* ============================================================ */}
      {validCombos.length > 0 && (
        <div className="deadlock-frame retro-futuristic-card rounded-xl p-3 sm:p-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#26433a]">
            <span className="text-xs sm:text-sm font-black uppercase text-[#2dd5b7] tracking-wider flex items-center gap-1.5 font-['Barlow_Condensed']">
              <Swords className="w-4 h-4 text-[#2dd5b7]" />
              Tactical Combat Sequences:
            </span>
            <span className="text-[11px] text-[#769382] font-sans hidden sm:inline">
              Practice execution in Practice Tool or early skirmishes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {validCombos.map((combo, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#13221c] border border-[#26433a] text-xs sm:text-[13px] shadow-2xs"
              >
                <span className="font-black uppercase text-[#e2e5b8] block mb-1.5 font-['Barlow_Condensed'] text-sm sm:text-base">
                  {combo.name}:
                </span>

                {/* Step Badges with Directional Arrows */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2 font-['Barlow_Condensed']">
                  {combo.sequence.map((step, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span className="px-2 py-0.5 rounded bg-[#0f1c17] text-[#2dd5b7] font-black text-xs border border-[#26433a] shadow-2xs font-mono">
                        {step}
                      </span>
                      {sIdx < combo.sequence.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-[#2dd5b7] flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <p className="text-xs text-[#c1c497] font-sans leading-relaxed bg-[#0f1c17] p-2 rounded-lg border border-[#26433a]">
                  <strong className="text-[#e5c736] font-bold font-['Barlow_Condensed'] uppercase tracking-wide">
                    Execution Tip:
                  </strong>{' '}
                  {combo.tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
