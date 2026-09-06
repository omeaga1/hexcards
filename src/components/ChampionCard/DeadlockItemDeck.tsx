import React, { useState, useRef, useMemo } from 'react';
import { TacticalGuide, ItemData } from '../../types';
import { getItemIconUrl } from '../../services/ddragon';
import { GlossaryText } from '../Glossary/BG3Tooltip';
import { PivotSwapGuide } from './PivotSwapGuide';
import { X, ArrowRight, ArrowLeftRight, Sparkles, Shield, Zap } from 'lucide-react';
import { usePinnedCards } from '../../context/PinnedCardContext';
import { useDevice } from '../../hooks/useDevice';

interface DeadlockItemDeckProps {
  version: string;
  tactics: TacticalGuide;
  allItems: Record<string, ItemData>;
}

export type ItemCategory = 'weapon' | 'spirit' | 'vitality' | 'utility';

export interface TacticalCard {
  id: string;
  name: string;
  category: ItemCategory;
  tag?: string;
  isActive?: boolean;
  isCore?: boolean;
  coreOrder?: number;
  buyOrderBadge?: string;
  replacesSlot?: '1st Back' | 'Core #1' | 'Core #2' | 'Core #3' | 'Boots';
  replacesItemName?: string;
  swapReason?: string;
  whatItDoes: string;
  whenToBuy: string;
  timing?: string;
}

export interface ChronoStage {
  id: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  accentBorder: string;
  badgeBg: string;
  cards: TacticalCard[];
}

export const DeadlockItemDeck: React.FC<DeadlockItemDeckProps> = ({
  version,
  tactics,
  allItems
}) => {
  const [subView, setSubView] = useState<'canvas' | 'matrix'>('canvas');
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [hoveredCard, setHoveredCard] = useState<TacticalCard | null>(null);
  const [selectedCard, setSelectedCard] = useState<TacticalCard | null>(null);
  const { isMobile, isTouch } = useDevice();
  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);
  const [mobileStageFilter, setMobileStageFilter] = useState<'all' | 'early' | 'core' | 'boots' | 'counters'>('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const { registerHover, unregisterHover } = usePinnedCards();

  const isSupport = tactics?.role === 'Support';
  const isJungle = tactics?.role === 'Jungle';
  const isADC = tactics?.role === 'ADC';
  const isMage = !isSupport && tactics?.damageType === 'Magic Heavy';
  const isTank = tactics?.playstyle === 'Teamfight Tank' || (isSupport && tactics?.damageType !== 'Magic Heavy');
  const isBruiser = !isADC && !isMage && !isTank && !isSupport;

  const core1 = tactics?.coreBuild?.firstItem || { itemId: '3078', name: 'Trinity Force', why: 'Core Spike', order: 1 };
  const core2 = tactics?.coreBuild?.secondItem || { itemId: '3053', name: "Sterak's Gage", why: 'Kit Synergy', order: 2 };
  const core3 = tactics?.coreBuild?.thirdItem || { itemId: '3026', name: 'Guardian Angel', why: 'Peak Scaling', order: 3 };
  const bootsRec = tactics?.coreBuild?.bootsRecommendation || {
    defaultId: '3047',
    defaultName: 'Plated Steelcaps',
    why: 'Armor & Basic Attack Defense',
    alternative: "Mercury's Treads if facing heavy CC / AP"
  };

  const altBootsId = bootsRec.defaultId === '3047' ? '3111' : '3047';
  const altBootsName = bootsRec.defaultId === '3047' ? "Mercury's Treads" : 'Plated Steelcaps';

  // 1. Core Rush & Spikes
  const core1Card: TacticalCard = useMemo(() => ({
    id: core1.itemId,
    name: core1.name,
    category: isSupport ? 'utility' : isMage ? 'spirit' : isTank ? 'vitality' : 'weapon',
    isCore: true,
    coreOrder: 1,
    buyOrderBadge: 'RUSH',
    isActive: core1.name === 'Stridebreaker' || core1.name === "Zhonya's Hourglass" || core1.name === 'Locket of the Iron Solari',
    whatItDoes: core1.why || 'Primary 1-item spike establishing trading & waveclear.',
    whenToBuy: 'Rush as 1st complete legendary item.',
    timing: '1st Full Item Spike'
  }), [core1, isSupport, isMage, isTank]);

  const core2Card: TacticalCard = useMemo(() => ({
    id: core2.itemId,
    name: core2.name,
    category: isSupport ? 'vitality' : isMage ? 'spirit' : isTank ? 'vitality' : 'weapon',
    isCore: true,
    coreOrder: 2,
    buyOrderBadge: 'SPIKE',
    isActive: core2.name === "Zhonya's Hourglass",
    whatItDoes: core2.why || 'Core 2-item power spike.',
    whenToBuy: 'Complete 2nd item after boots.',
    timing: 'Core #2 Synergy'
  }), [core2, isSupport, isMage, isTank]);

  const core3Card: TacticalCard = useMemo(() => ({
    id: core3.itemId,
    name: core3.name,
    category: isSupport ? 'vitality' : isMage ? 'spirit' : isTank ? 'vitality' : 'weapon',
    isCore: true,
    coreOrder: 3,
    buyOrderBadge: 'PEAK',
    whatItDoes: core3.why || 'Capstone spike completing main combat engine.',
    whenToBuy: 'Complete 3rd item.',
    timing: 'Core #3 Capstone'
  }), [core3, isSupport, isMage, isTank]);

  const altCoreCard: TacticalCard = useMemo(() => ({
    id: isSupport ? '3001' : isADC ? '3087' : isMage ? '4628' : isBruiser ? '6692' : '3084',
    name: isSupport ? 'Trailblazer' : isADC ? 'Statikk Shiv' : isMage ? 'Horizon Focus' : isBruiser ? 'Eclipse' : 'Heartsteel',
    category: isSupport ? 'vitality' : isMage ? 'spirit' : isTank ? 'vitality' : 'weapon',
    buyOrderBadge: 'FLEX',
    whatItDoes: isSupport
      ? 'Movement speed trail granting allies +15% move speed.'
      : isADC
      ? 'Chain lightning for rapid waveclear.'
      : isMage
      ? 'Amplifies damage on long-range spell hits by 10%.'
      : isBruiser
      ? '2-hit burst grants rapid shield and deals 6% max HP damage.'
      : 'Stacks permanent bonus health on champion hits.',
    whenToBuy: 'Alternative 2nd spike depending on game tempo.',
    timing: 'Flex Alternative'
  }), [isSupport, isADC, isMage, isBruiser]);

  const altCapstoneCard: TacticalCard = useMemo(() => {
    let altId = isSupport ? '3222' : isADC ? '3072' : isMage ? '3089' : isTank ? '6664' : '6333';
    let altName = isSupport ? "Mikael's Blessing" : isADC ? 'Bloodthirster' : isMage ? "Rabadon's Deathcap" : isTank ? 'Kaenic Rookern' : "Death's Dance";
    let whatItDoes = isSupport
      ? 'Active cleanses all crowd control from an ally and heals them.'
      : isADC
      ? 'High Attack Damage, 18% Lifesteal, and an overshield up to 400 HP.'
      : isMage
      ? 'Increases total Ability Power by 35%.'
      : isTank
      ? 'Grants a massive magic damage shield that regenerates out of combat.'
      : 'Stores 30% of incoming damage to bleed over 3 seconds.';

    if (altId === core3.itemId || altName.toLowerCase() === core3.name.toLowerCase()) {
      if (isBruiser) {
        altId = '3026';
        altName = 'Guardian Angel';
        whatItDoes = 'Revives champion upon taking lethal damage with 50% base HP and 30% mana.';
      } else if (isADC) {
        altId = '3026';
        altName = 'Guardian Angel';
        whatItDoes = 'Revives champion upon taking lethal damage with 50% base HP and 30% mana.';
      } else if (isMage) {
        altId = '3135';
        altName = 'Void Staff';
        whatItDoes = 'Ignores 40% of enemy Magic Resistance. Mandatory when enemies build Negatron.';
      } else if (isTank) {
        altId = '3075';
        altName = 'Thornmail';
        whatItDoes = 'Reflects magic damage back to attackers and inflicts 40% Grievous Wounds.';
      } else {
        altId = '3107';
        altName = 'Redemption';
        whatItDoes = 'Calls down a beam of light to heal allies and damage enemies in a target area.';
      }
    }

    return {
      id: altId,
      name: altName,
      category: isSupport ? 'utility' : isMage ? 'spirit' : isTank ? 'vitality' : 'weapon',
      buyOrderBadge: 'FLEX',
      whatItDoes,
      whenToBuy: 'Capstone situational flex item.',
      timing: 'Capstone flex'
    };
  }, [isSupport, isADC, isMage, isTank, isBruiser, core3.itemId, core3.name]);

  // Boots
  const defaultBootsCard: TacticalCard = useMemo(() => ({
    id: bootsRec.defaultId,
    name: bootsRec.defaultName,
    category: 'utility',
    isCore: true,
    buyOrderBadge: 'BOOTS',
    whatItDoes: '+45 Movement Speed with champion-specific defense or offense.',
    whenToBuy: bootsRec.why,
    timing: 'T2 Boots'
  }), [bootsRec]);

  const altBootsCard: TacticalCard = useMemo(() => ({
    id: altBootsId,
    name: altBootsName,
    category: 'utility',
    buyOrderBadge: 'ALT',
    replacesSlot: 'Boots',
    replacesItemName: bootsRec.defaultName,
    swapReason: bootsRec.alternative || 'High enemy CC or lethal AD damage',
    whatItDoes: bootsRec.defaultId === '3047'
      ? '+25 Magic Resist and 30% Tenacity to reduce incoming crowd control.'
      : 'Reduces basic attack damage by 12% + grants 20 Armor.',
    whenToBuy: bootsRec.alternative,
    timing: 'Defensive alternative to recommended boots'
  }), [altBootsId, altBootsName, bootsRec]);

  // Early Laning Items
  const starterCard: TacticalCard = useMemo(() => ({
    id: isSupport ? '3865' : isJungle ? '3563' : isMage ? '1056' : isTank ? '1054' : '1055',
    name: isSupport ? "World Atlas" : isJungle ? "Scorchclaw Pup" : isMage ? "Doran's Ring" : isTank ? "Doran's Shield" : "Doran's Blade",
    category: isSupport ? 'utility' : isJungle ? 'weapon' : isMage ? 'spirit' : isTank ? 'vitality' : 'weapon',
    buyOrderBadge: 'START',
    whatItDoes: isSupport
      ? 'Support quest item executing minions to share gold.'
      : isJungle
      ? 'Companion pet damaging monsters and burning enemies.'
      : 'Essential starter item providing early health, sustain, and combat stats.',
    whenToBuy: 'Purchase immediately at 0:00 spawn.',
    timing: 'Match Start (0:00)'
  }), [isSupport, isJungle, isMage, isTank]);

  const potionCard: TacticalCard = useMemo(() => ({
    id: '2003',
    name: 'Health Potion',
    category: 'vitality',
    buyOrderBadge: '0:00',
    whatItDoes: 'Restores 120 health over 15 seconds.',
    whenToBuy: 'Standard lane sustain for early trading.',
    timing: 'Match Start (0:00)'
  }), []);

  const firstBackCard: TacticalCard = useMemo(() => ({
    id: isSupport ? '3067' : isADC ? '6670' : isMage ? '3802' : isTank ? '6660' : '3134',
    name: isSupport ? 'Kindlegem' : isADC ? 'Noonquiver' : isMage ? 'Lost Chapter' : isTank ? "Bami's Cinder" : 'Serrated Dirk',
    category: isSupport ? 'vitality' : isMage ? 'spirit' : isTank ? 'vitality' : 'weapon',
    buyOrderBadge: 'RECALL',
    whatItDoes: isSupport
      ? '+200 Health and +10 Ability Haste.'
      : isMage
      ? 'Restores 20% max mana upon level-up and grants AP + Haste.'
      : isTank
      ? 'Immolate aura deals continuous magic damage around you.'
      : 'Early Attack Damage and minion execute / Lethality.',
    whenToBuy: 'Recall at 800–1300 gold to secure lane advantage.',
    timing: '1st Recall (~4:00 - 6:00)'
  }), [isSupport, isADC, isMage, isTank]);

  const tier1BootsCard: TacticalCard = useMemo(() => ({
    id: '1001',
    name: 'Boots',
    category: 'utility',
    buyOrderBadge: 'T1',
    whatItDoes: '+25 Flat Movement Speed.',
    whenToBuy: 'Pick up on 1st or 2nd back (300g) to dodge skillshots and contest objectives.',
    timing: 'Early Recall (~5:00)'
  }), []);

  // Situational Counter Pods (Realistic Meta Targets: 1st Back, Core #2, Core #3)
  const antiHeal800g: TacticalCard = useMemo(() => ({
    id: isSupport ? (tactics?.damageType === 'Magic Heavy' ? '3916' : '3076') : isMage ? '3916' : isTank ? '3076' : '3123',
    name: isSupport ? (tactics?.damageType === 'Magic Heavy' ? 'Oblivion Orb' : 'Bramble Vest') : isMage ? 'Oblivion Orb' : isTank ? 'Bramble Vest' : "Executioner's Calling",
    category: isMage ? 'spirit' : isTank ? 'vitality' : isSupport ? 'vitality' : 'weapon',
    buyOrderBadge: '800G',
    replacesSlot: '1st Back',
    replacesItemName: firstBackCard.name,
    swapReason: 'Sit on this 800g component on 1st back against high sustain / healing laners (Aatrox, Warwick, Vlad, Soraka).',
    whatItDoes: 'Applies 40% Grievous Wounds on hit or spell damage to cut enemy healing.',
    whenToBuy: 'Crucial vs heavy healing picks. Buy on 1st recall and sit on it in inventory.',
    timing: 'CRITICAL: Sit on this 800g component early! Do not rush full upgrade.'
  }), [isSupport, tactics?.damageType, isMage, isTank, firstBackCard.name]);

  const antiHealFull: TacticalCard = useMemo(() => ({
    id: isSupport ? (tactics?.damageType === 'Magic Heavy' ? '3165' : '3075') : isMage ? '3165' : isTank ? '3075' : isADC ? '3033' : '6609',
    name: isSupport ? (tactics?.damageType === 'Magic Heavy' ? 'Morellonomicon' : 'Thornmail') : isMage ? 'Morellonomicon' : isTank ? 'Thornmail' : isADC ? 'Mortal Reminder' : 'Chempunk Chainsword',
    category: isMage ? 'spirit' : isTank ? 'vitality' : isSupport ? 'vitality' : 'weapon',
    replacesSlot: 'Core #3',
    replacesItemName: core3Card.name,
    swapReason: 'Finish 800g component into full legendary item when enemy healing dominates teamfights.',
    whatItDoes: 'Permanent 40% Grievous Wounds with high combat stats and penetration.',
    whenToBuy: 'Complete as 3rd or 4th item after core damage engine is online.',
    timing: 'Complete after 2nd Core'
  }), [isSupport, tactics?.damageType, isMage, isTank, isADC, core3Card.name]);

  const antiBurst1: TacticalCard = useMemo(() => ({
    id: isSupport ? '3222' : '2504',
    name: isSupport ? "Mikael's Blessing" : 'Kaenic Rookern',
    category: isSupport ? 'utility' : 'vitality',
    replacesSlot: isSupport ? 'Core #2' : 'Core #3',
    replacesItemName: isSupport ? core2Card.name : core3Card.name,
    swapReason: isSupport ? 'Cleanse high CC picks targeting your carry' : 'Enemy team has fed AP burst mages one-shotting you',
    isActive: isSupport,
    whatItDoes: isSupport
      ? 'Active: Instantly cleanses stuns/roots from an ally carry and heals them.'
      : 'Grants an automatic 18% max HP magic damage shield refreshing out of combat.',
    whenToBuy: 'When enemy magic burst or CC threatens instant elimination.',
    timing: 'Build 2nd (Support) or 3rd/4th (Bruiser)'
  }), [isSupport, core2Card.name, core3Card.name]);

  const antiBurst2: TacticalCard = useMemo(() => ({
    id: isSupport ? '3109' : '3156',
    name: isSupport ? "Knight's Vow" : 'Maw of Malmortius',
    category: isSupport ? 'vitality' : 'weapon',
    replacesSlot: 'Core #2',
    replacesItemName: core2Card.name,
    swapReason: isSupport ? 'Assassins diving your carry' : 'Rush Maw 2nd vs fed AP assassins to prevent one-shots',
    whatItDoes: isSupport
      ? 'Designate carry: redirect 12% damage onto yourself and heal from their damage.'
      : 'Triggers a massive Lifeline magic shield on taking lethal AP burst + 10% lifesteal.',
    whenToBuy: 'Against fed assassins diving priority champions. Delay 2nd offensive item for survival.',
    timing: 'Rush 2nd item slot vs fed AP threat'
  }), [isSupport, core2Card.name]);

  const antiBurst3: TacticalCard = useMemo(() => ({
    id: isMage ? '3157' : isSupport ? '3190' : '3026',
    name: isMage ? "Zhonya's Hourglass" : isSupport ? 'Locket of the Iron Solari' : 'Guardian Angel',
    category: isMage ? 'spirit' : isSupport ? 'utility' : 'weapon',
    replacesSlot: isMage || isSupport ? 'Core #2' : 'Core #3',
    replacesItemName: isMage || isSupport ? core2Card.name : core3Card.name,
    swapReason: isMage ? 'Rush Zhonya 2nd vs AD assassins for Golden Stasis' : 'Insurance revive / shield against lethal burst',
    isActive: isMage || isSupport,
    whatItDoes: isMage
      ? 'Active: Completely invulnerable and untargetable for 2.5 seconds in golden Stasis.'
      : isSupport
      ? 'Active: Grants instant 200–360 shield to all 5 allies simultaneously.'
      : 'Upon death, revive with 50% base HP and 30% max mana.',
    whenToBuy: 'Enemy team has heavy burst elimination threats.',
    timing: isMage ? 'Rush 2nd item' : 'Insurance item 3rd/4th'
  }), [isMage, isSupport, core2Card.name, core3Card.name]);

  const shred1: TacticalCard = useMemo(() => ({
    id: isSupport ? '8020' : isMage ? '3135' : isADC ? '3036' : isBruiser ? '3071' : '6665',
    name: isSupport ? 'Abyssal Mask' : isMage ? 'Void Staff' : isADC ? "Lord Dominik's Regards" : isBruiser ? 'Black Cleaver' : "Jak'Sho",
    category: isSupport ? 'vitality' : isMage ? 'spirit' : isTank ? 'vitality' : 'weapon',
    replacesSlot: 'Core #3',
    replacesItemName: core3Card.name,
    swapReason: 'Mandatory 3rd slot when enemy frontline stacks armor or magic resistance.',
    whatItDoes: isMage
      ? 'Ignores 40% enemy Magic Resistance.'
      : isBruiser
      ? 'Shreds up to 30% total enemy armor for entire team.'
      : isSupport
      ? 'Aura shreds nearby enemy MR by up to 25.'
      : 'Ignores 35% total enemy armor.',
    whenToBuy: 'Mandatory when enemy tanks build resistances.',
    timing: '3rd or 4th slot vs tanks'
  }), [isSupport, isMage, isADC, isBruiser, isTank, core3Card.name]);

  const shred2: TacticalCard = useMemo(() => ({
    id: isMage ? '3137' : '3072',
    name: isMage ? 'Cryptbloom' : 'Bloodthirster',
    category: isMage ? 'spirit' : 'weapon',
    replacesSlot: 'Core #3',
    replacesItemName: core3Card.name,
    swapReason: 'Alternative % penetration with teamfight healing or sustain.',
    whatItDoes: isMage
      ? '30% Magic Pen + releases healing nova for allies on champion takedowns.'
      : 'High AD, 18% Lifesteal, and an overshield up to 400 HP.',
    whenToBuy: 'Alternative % pen or sustained fighting multiplier.',
    timing: '4th or 5th slot'
  }), [isMage, core3Card.name]);

  const antiCC1: TacticalCard = useMemo(() => ({
    id: '3140',
    name: 'Quicksilver Sash',
    category: 'weapon',
    buyOrderBadge: 'QSS',
    replacesSlot: '1st Back',
    replacesItemName: firstBackCard.name,
    swapReason: 'Buy 1300g QSS on early recall vs suppression (Malzahar, Warwick, Skarner). Sit on it.',
    isActive: true,
    whatItDoes: 'Active cleanses all crowd control (including Suppression) immediately.',
    whenToBuy: 'Enemy has point-and-click Suppression (Malzahar, Warwick, Skarner).',
    timing: 'Buy 1300g component early, sit on it!'
  }), [firstBackCard.name]);

  const antiCC2: TacticalCard = useMemo(() => ({
    id: '3139',
    name: 'Mercurial Scimitar',
    category: 'weapon',
    replacesSlot: 'Core #3',
    replacesItemName: core3Card.name,
    swapReason: 'Finish QSS into full item to retain CC cleanse while gaining offensive stats.',
    isActive: true,
    whatItDoes: 'Active cleanses all CC and grants +50% move speed for 1.5 seconds.',
    whenToBuy: 'Complete after your core damage is built.',
    timing: '4th or 5th completed item'
  }), [core3Card.name]);

  const antiCC3: TacticalCard = useMemo(() => ({
    id: isMage ? '3102' : '3814',
    name: isMage ? "Banshee's Veil" : 'Edge of Night',
    category: isMage ? 'spirit' : 'weapon',
    replacesSlot: 'Core #2',
    replacesItemName: core2Card.name,
    swapReason: 'Spell shield blocks critical engagement spells (Blitz hook, Malphite R) before fights start.',
    whatItDoes: 'Spell shield that blocks the next hostile enemy ability.',
    whenToBuy: 'Against lethal engagement picks seeking pick-offs.',
    timing: 'Build 2nd or 3rd defensive slot'
  }), [isMage, core2Card.name]);

  const flex1: TacticalCard = useMemo(() => ({
    id: '6695',
    name: "Serpent's Fang",
    category: 'weapon',
    replacesSlot: 'Core #2',
    replacesItemName: core2Card.name,
    swapReason: 'Rush 2nd vs heavy shield stackers (Sett, Tahm Kench, Karma, Lulu, Shen, Steraks).',
    whatItDoes: 'Reduces enemy shields gained by 50% and instantly carves existing shields.',
    whenToBuy: 'Enemy team stacks shields.',
    timing: 'Cheap 2nd or 3rd situational purchase'
  }), [core2Card.name]);

  const flex2: TacticalCard = useMemo(() => ({
    id: '3110',
    name: 'Frozen Heart',
    category: 'vitality',
    replacesSlot: 'Core #2',
    replacesItemName: core2Card.name,
    swapReason: 'Multiple enemy basic attack carries (Jinx, Master Yi, Yasuo, Yone).',
    whatItDoes: 'Aura reduces nearby enemy attack speed by 20% and reduces incoming basic attack damage.',
    whenToBuy: 'Multiple heavy auto-attackers.',
    timing: 'Cheap 2nd or 3rd slot armor'
  }), [core2Card.name]);

  const flex3: TacticalCard = useMemo(() => ({
    id: isSupport ? '3107' : '3083',
    name: isSupport ? 'Redemption' : "Warmog's Armor",
    category: isSupport ? 'utility' : 'vitality',
    replacesSlot: 'Core #3',
    replacesItemName: core3Card.name,
    swapReason: isSupport ? 'Teamfight choke point healing' : 'Endless frontline siege and poke recovery',
    isActive: isSupport,
    whatItDoes: isSupport
      ? 'Active: Heals all allies in a massive 5500-range circle and burns enemies.'
      : 'Rapidly regenerates 5% max health per second out of combat.',
    whenToBuy: isSupport ? 'Dragon/Baron river choke teamfights.' : 'For endless frontline siege pressure.',
    timing: 'Late game utility'
  }), [isSupport, core3Card.name]);

  // Situational Pods organized by Mobalytics Threat Scenarios
  const situationalPods = useMemo(() => [
    {
      title: 'Anti-Heal (Grievous)',
      subtitle: 'vs Sustain & Healers',
      accent: 'border-rose-400 bg-rose-50/20 text-rose-800',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: '🩸',
      cards: [antiHeal800g, antiHealFull]
    },
    {
      title: 'Anti-Burst & Armor',
      subtitle: 'vs AD Assassins & Lethality',
      accent: 'border-amber-400 bg-amber-50/20 text-amber-800',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: '🛡️',
      cards: [antiBurst1, antiBurst2, antiBurst3]
    },
    {
      title: 'Magic Resist & Shields',
      subtitle: 'vs Fed AP Mages & Poke',
      accent: 'border-purple-400 bg-purple-50/20 text-purple-800',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: '🔮',
      cards: [antiCC3, antiBurst1]
    },
    {
      title: 'Armor / MR Penetration',
      subtitle: 'vs Tanks & High Resistance',
      accent: 'border-sky-400 bg-sky-50/20 text-sky-800',
      badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: '⚔️',
      cards: [shred1, shred2]
    },
    {
      title: 'Utility & Cleanses',
      subtitle: 'vs Hard CC & Shields',
      accent: 'border-emerald-400 bg-emerald-50/20 text-emerald-800',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: '⚡',
      cards: [antiCC1, antiCC2, flex1, flex2, flex3]
    }
  ], [
    antiHeal800g, antiHealFull,
    antiBurst1, antiBurst2, antiBurst3,
    antiCC3,
    shred1, shred2,
    antiCC1, antiCC2, flex1, flex2, flex3
  ]);

  // Deadlock Category Frame Colors
  const getCategoryFrame = (category: ItemCategory) => {
    switch (category) {
      case 'weapon':
        return {
          border: 'border-orange-500',
          ring: 'ring-orange-500',
          bg: 'bg-white',
          glow: 'shadow-[0_1px_3px_rgba(249,115,22,0.18)]',
          glowStrong: '0_4px_14px_rgba(249,115,22,0.35)',
          badgeBg: 'bg-orange-500 text-white font-black',
          tagText: 'text-orange-600',
          chipBg: 'bg-orange-50 border-orange-200 text-orange-800'
        };
      case 'spirit':
        return {
          border: 'border-purple-500',
          ring: 'ring-purple-500',
          bg: 'bg-white',
          glow: 'shadow-[0_1px_3px_rgba(168,85,247,0.18)]',
          glowStrong: '0_4px_14px_rgba(168,85,247,0.35)',
          badgeBg: 'bg-purple-600 text-white font-black',
          tagText: 'text-purple-600',
          chipBg: 'bg-purple-50 border-purple-200 text-purple-800'
        };
      case 'vitality':
        return {
          border: 'border-emerald-600',
          ring: 'ring-emerald-500',
          bg: 'bg-white',
          glow: 'shadow-[0_1px_3px_rgba(16,185,129,0.18)]',
          glowStrong: '0_4px_14px_rgba(16,185,129,0.35)',
          badgeBg: 'bg-emerald-600 text-white font-black',
          tagText: 'text-emerald-700',
          chipBg: 'bg-emerald-50 border-emerald-200 text-emerald-800'
        };
      case 'utility':
        return {
          border: 'border-sky-500',
          ring: 'ring-sky-500',
          bg: 'bg-white',
          glow: 'shadow-[0_1px_3px_rgba(14,165,233,0.18)]',
          glowStrong: '0_4px_14px_rgba(14,165,233,0.35)',
          badgeBg: 'bg-sky-600 text-white font-black',
          tagText: 'text-sky-700',
          chipBg: 'bg-sky-50 border-sky-200 text-sky-800'
        };
    }
  };

  const defaultCard = core1Card;
  const activeInspectorCard = hoveredCard || selectedCard || defaultCard;
  const inspectedItemData = activeInspectorCard && allItems ? allItems[activeInspectorCard.id] : null;
  const inspectedGold = inspectedItemData?.gold?.total;

  // Swap relationship check: Is this targetCard replaced by the currently hovered situational item?
  const isCardReplacementTarget = (targetCard: TacticalCard, hovered: TacticalCard | null): boolean => {
    if (!hovered) return false;
    if (hovered.id === targetCard.id) return false;

    if (hovered.replacesSlot) {
      if (hovered.replacesSlot === 'Core #1' && targetCard.coreOrder === 1) return true;
      if (hovered.replacesSlot === 'Core #2' && targetCard.coreOrder === 2) return true;
      if (hovered.replacesSlot === 'Core #3' && targetCard.coreOrder === 3) return true;
      if (hovered.replacesSlot === '1st Back' && (targetCard.buyOrderBadge === 'RECALL' || targetCard.buyOrderBadge === '1ST BACK' || targetCard.name === firstBackCard.name)) return true;
      if (hovered.replacesSlot === 'Boots' && targetCard.isCore && (targetCard.buyOrderBadge === 'BOOTS' || targetCard.id === defaultBootsCard.id)) return true;
    }
    if (hovered.replacesItemName && targetCard.name.toLowerCase() === hovered.replacesItemName.toLowerCase()) {
      return true;
    }
    if (hovered.id === altBootsCard.id && targetCard.id === defaultBootsCard.id) {
      return true;
    }
    return false;
  };

  // Swap relationship check: Is this candidateCard a situational swap candidate for the currently hovered build item?
  const isCardSwapCandidate = (candidateCard: TacticalCard, hovered: TacticalCard | null): boolean => {
    if (!hovered) return false;
    if (hovered.id === candidateCard.id) return false;

    if ((hovered.buyOrderBadge === 'BOOTS' || hovered.id === defaultBootsCard.id) && candidateCard.id === altBootsCard.id) {
      return true;
    }
    if ((hovered.buyOrderBadge === 'RECALL' || hovered.buyOrderBadge === '1ST BACK' || hovered.name === firstBackCard.name) && candidateCard.replacesSlot === '1st Back') {
      return true;
    }
    if (hovered.isCore && hovered.coreOrder === 1 && candidateCard.replacesSlot === 'Core #1') {
      return true;
    }
    if (hovered.isCore && hovered.coreOrder === 2 && candidateCard.replacesSlot === 'Core #2') {
      return true;
    }
    if (hovered.isCore && hovered.coreOrder === 3 && candidateCard.replacesSlot === 'Core #3') {
      return true;
    }
    if (candidateCard.replacesItemName && hovered.name.toLowerCase() === candidateCard.replacesItemName.toLowerCase()) {
      return true;
    }
    return false;
  };

  const cardHasSwapConnection = (card: TacticalCard): boolean => {
    if (card.replacesSlot || card.replacesItemName) return true;
    if (card.id === defaultBootsCard.id || card.id === altBootsCard.id) return true;
    if (card.buyOrderBadge === 'RECALL' || card.buyOrderBadge === '1ST BACK') return true;
    if (card.isCore && (card.coreOrder === 1 || card.coreOrder === 2 || card.coreOrder === 3)) return true;
    return false;
  };

  // Render a Single Deadlock Item Tile
  const renderCardNode = (card: TacticalCard) => {
    const itemData = allItems ? allItems[card.id] : null;
    const gold = itemData?.gold?.total;
    const isHovered = hoveredCard?.id === card.id;
    const isSelected = selectedCard ? selectedCard.id === card.id : (!hoveredCard && card.isCore && card.coreOrder === 1);
    const frame = getCategoryFrame(card.category);

    const isTarget = isCardReplacementTarget(card, hoveredCard);
    const isCandidate = isCardSwapCandidate(card, hoveredCard);
    const isConnected = isHovered || isTarget || isCandidate;
    const isDimmed = Boolean(hoveredCard && cardHasSwapConnection(hoveredCard) && !isConnected);

    return (
      <div
        key={card.id}
        data-card-id={card.id}
        onClick={() => {
          setSelectedCard(card);
          setHoveredCard(card);
          if (isMobile) {
            setShowMobileDrawer(true);
          } else {
            setShowInspector(true);
          }
        }}
        onMouseEnter={(e) => {
          if (isMobile || isTouch) return;
          setHoveredCard(card);
          const currentTarget = e.currentTarget;
          const rect = currentTarget.getBoundingClientRect();
          const components = itemData?.from?.map(compId => ({
            id: compId,
            name: allItems[compId]?.name || compId,
            gold: allItems[compId]?.gold?.total
          })).filter(Boolean) || [];

          registerHover({
            id: card.id,
            type: 'item',
            title: card.name,
            category: card.category,
            data: { card: { ...card, components }, version, gold, components },
            getCoords: () => {
              const width = 340;
              const height = 360;
              const margin = 16;
              let x = rect.right + 12;
              if (x + width > window.innerWidth - margin) {
                x = Math.max(margin, rect.left - width - 12);
              }
              let y = rect.top - 10;
              if (y + height > window.innerHeight - margin) {
                y = Math.max(margin, window.innerHeight - height - margin);
              }
              if (y < margin) y = margin;
              return { x, y };
            },
            onFreeze: () => {
              setHoveredCard(null);
            }
          });
        }}
        onMouseLeave={() => {
          if (isMobile || isTouch) return;
          setHoveredCard(null);
          unregisterHover(card.id);
        }}
        className={`group relative w-[80px] sm:w-[88px] md:w-[94px] p-2 rounded-xl flex flex-col items-center justify-between cursor-pointer select-none transition-all duration-150 border-2 ${frame.border} bg-white shadow-2xs ${
          isTarget
            ? 'scale-105 sm:scale-110 -translate-y-1 ring-3 sm:ring-4 ring-rose-500 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.45)] z-30 animate-pulse'
            : isCandidate
            ? 'scale-105 sm:scale-110 -translate-y-1 ring-3 sm:ring-4 ring-sky-500 border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.45)] z-30 animate-pulse'
            : isHovered
            ? `scale-105 sm:scale-110 -translate-y-1 shadow-lg z-25 ring-2 sm:ring-3 ${frame.ring}`
            : isSelected
            ? 'shadow-md ring-2 ring-emerald-500'
            : isDimmed
            ? 'opacity-30 grayscale-[50%] transition-opacity duration-200'
            : 'hover:-translate-y-0.5 hover:shadow-md'
        }`}
      >
        {/* Clean, Unobstructed Item Artwork */}
        <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group-hover:border-emerald-500 flex-shrink-0 shadow-2xs">
          <img
            src={getItemIconUrl(version, card.id)}
            alt={card.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />

          {/* Active Ability Indicator */}
          {card.isActive && (
            <span className="absolute top-0.5 right-0.5 text-[9px] font-black text-white bg-slate-900/90 px-1 py-0.5 rounded border border-slate-700 leading-none">
              ACT
            </span>
          )}

          {/* High-Contrast Swap Badge over icon on hover connection */}
          {isTarget && (
            <div className="absolute inset-0 bg-rose-600/85 flex items-center justify-center p-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-white text-center leading-tight">
                SWAP OUT
              </span>
            </div>
          )}
          {isCandidate && (
            <div className="absolute inset-0 bg-sky-600/85 flex items-center justify-center p-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-white text-center leading-tight">
                SWAP IN
              </span>
            </div>
          )}
        </div>

        {/* Clear, Legible Item Name Underneath Icon */}
        <div className="w-full mt-1.5 flex items-center justify-center min-h-[30px]">
          <span className="text-xs sm:text-[13px] font-bold text-slate-800 group-hover:text-emerald-700 line-clamp-2 text-center leading-snug tracking-tight font-sans">
            {card.name}
          </span>
        </div>
      </div>
    );
  };

  // Render a Hero-Sized Featured Core Item Node (Mobalytics style with Deadlock tech HUD)
  const renderFeaturedCoreNode = (card: TacticalCard, orderLabel: string, roleSubtitle: string) => {
    const itemData = allItems ? allItems[card.id] : null;
    const gold = itemData?.gold?.total;
    const isHovered = hoveredCard?.id === card.id;
    const isSelected = selectedCard ? selectedCard.id === card.id : (!hoveredCard && card.isCore && card.coreOrder === 1);
    const frame = getCategoryFrame(card.category);

    const isTarget = isCardReplacementTarget(card, hoveredCard);
    const isCandidate = isCardSwapCandidate(card, hoveredCard);
    const isConnected = isHovered || isTarget || isCandidate;
    const isDimmed = Boolean(hoveredCard && cardHasSwapConnection(hoveredCard) && !isConnected);

    return (
      <div
        key={card.id}
        data-card-id={card.id}
        onClick={() => {
          setSelectedCard(card);
          setHoveredCard(card);
          if (isMobile) {
            setShowMobileDrawer(true);
          } else {
            setShowInspector(true);
          }
        }}
        onMouseEnter={(e) => {
          if (isMobile || isTouch) return;
          setHoveredCard(card);
          const currentTarget = e.currentTarget;
          const rect = currentTarget.getBoundingClientRect();
          const components = itemData?.from?.map(compId => ({
            id: compId,
            name: allItems[compId]?.name || compId,
            gold: allItems[compId]?.gold?.total
          })).filter(Boolean) || [];

          registerHover({
            id: card.id,
            type: 'item',
            title: card.name,
            category: card.category,
            data: { card: { ...card, components }, version, gold, components },
            getCoords: () => {
              const width = 340;
              const height = 360;
              const margin = 16;
              let x = rect.right + 12;
              if (x + width > window.innerWidth - margin) {
                x = Math.max(margin, rect.left - width - 12);
              }
              let y = rect.top - 10;
              if (y + height > window.innerHeight - margin) {
                y = Math.max(margin, window.innerHeight - height - margin);
              }
              if (y < margin) y = margin;
              return { x, y };
            },
            onFreeze: () => {
              setHoveredCard(null);
            }
          });
        }}
        onMouseLeave={() => {
          if (isMobile || isTouch) return;
          setHoveredCard(null);
          unregisterHover(card.id);
        }}
        className={`group relative flex-1 min-w-[140px] max-w-[240px] p-2.5 sm:p-3 rounded-xl flex flex-col justify-between border-2 ${frame.border} bg-white transition-all duration-150 cursor-pointer shadow-xs ${
          isTarget
            ? 'scale-105 ring-4 ring-rose-500 border-rose-500 shadow-[0_0_22px_rgba(244,63,94,0.45)] z-30 animate-pulse'
            : isCandidate
            ? 'scale-105 ring-4 ring-sky-500 border-sky-500 shadow-[0_0_22px_rgba(14,165,233,0.45)] z-30 animate-pulse'
            : isHovered
            ? `scale-105 shadow-lg z-25 ring-3 ${frame.ring}`
            : isSelected
            ? 'ring-2 ring-emerald-500 shadow-md'
            : isDimmed
            ? 'opacity-30 grayscale-[50%]'
            : 'hover:-translate-y-0.5 hover:shadow-md'
        }`}
      >
        {/* Top Header Row: Order Badge (No static gold) */}
        <div className="flex items-center justify-between gap-1 pb-1.5 mb-1.5 border-b border-slate-100">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
            {orderLabel}
          </span>
        </div>

        {/* Center Artwork & Name */}
        <div className="flex items-center gap-3 my-1.5">
          <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-2xs">
            <img
              src={getItemIconUrl(version, card.id)}
              alt={card.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-wide leading-tight truncate font-['Barlow_Condensed']">
              {card.name}
            </h4>
            <span className="text-xs font-bold text-slate-500 uppercase block truncate font-sans mt-0.5">
              {roleSubtitle}
            </span>
          </div>
        </div>

        {/* Bottom Tag / Swap Signal - Complete Readable Explanation */}
        {isTarget ? (
          <div className="w-full bg-rose-600 py-1.5 px-2 rounded text-center shadow-xs mt-1">
            <span className="text-xs font-black uppercase tracking-wider text-white block">
              REPLACE WITH PIVOT
            </span>
          </div>
        ) : (
          <div className="w-full bg-slate-50 py-1.5 px-2 rounded border border-slate-200 mt-1 min-h-[36px] flex items-center justify-center">
            <span className="text-xs font-medium text-slate-700 line-clamp-2 leading-tight font-sans text-center">
              {card.whatItDoes}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-auto min-h-0 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 sm:p-4 lg:p-5 shadow-xs overflow-hidden font-['Barlow_Condensed'] select-none"
      style={{
        backgroundImage: 'radial-gradient(#e2e8f0 1.25px, transparent 1.25px)',
        backgroundSize: '16px 16px'
      }}
    >
      {/* Control Bar */}
      <div className="relative z-20 flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          {/* View Toggles */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shadow-2xs">
            <button
              onClick={() => setSubView('canvas')}
              className={`px-3 py-1 rounded text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${
                subView === 'canvas'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tactical Deck
            </button>
            <button
              onClick={() => setSubView('matrix')}
              className={`px-3 py-1 rounded text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${
                subView === 'matrix'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pivot Matrix
            </button>
          </div>

          <span className="hidden sm:inline text-xs font-bold text-slate-500 uppercase tracking-wide">
            Mobalytics Flow • Deadlock HUD
          </span>
        </div>

        {/* Inspector Toggle */}
        <button
          onClick={() => setShowInspector(!showInspector)}
          className={`px-3 py-1 rounded-lg border text-xs sm:text-sm font-black uppercase tracking-wider transition-colors cursor-pointer ${
            showInspector
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
              : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
          }`}
        >
          {showInspector ? 'Inspector: Open' : 'Inspector: Closed'}
        </button>
      </div>

      {/* Mobile Category Filter Tabs */}
      {isMobile && subView === 'canvas' && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-2 border-b border-slate-100">
          {[
            { id: 'all', label: 'All Build Steps' },
            { id: 'early', label: '1: Early & Back' },
            { id: 'core', label: '2: Core Build ➔' },
            { id: 'boots', label: '3: Boots' },
            { id: 'counters', label: '4: Counters' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileStageFilter(tab.id as any)}
              className={`px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all touch-manipulation ${
                mobileStageFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Main View Area */}
      {subView === 'canvas' ? (
        <div className="relative flex-col justify-between space-y-3">

          {/* SECTION 1: MOBALYTICS CHRONOLOGICAL HIGHWAY (EARLY -> CORE -> BOOTS) */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            
            {/* SUB-POD A: STARTING ITEMS & 1ST RECALL (3 COLS) */}
            {(!isMobile || mobileStageFilter === 'all' || mobileStageFilter === 'early') && (
              <div className="lg:col-span-3 rounded-xl bg-white border border-slate-200 p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                      0:00 - 5:00
                    </span>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
                      Early Game & Back
                    </h3>
                  </div>
                </div>

                {/* Starters & 1st Recall Cards */}
                <div className="space-y-2.5">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1 font-sans">
                      Starter Bundle (0:00)
                    </span>
                    <div className="flex items-center gap-2">
                      {renderCardNode(starterCard)}
                      {renderCardNode(potionCard)}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase block mb-1 font-sans">
                      1st Recall Spike (~4:30)
                    </span>
                    <div className="flex items-center gap-2">
                      {renderCardNode(firstBackCard)}
                      {renderCardNode(tier1BootsCard)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-POD B: THE CORE BUILD HIGHWAY (6 COLS - MOBALYTICS ARROW FLOW) */}
            {(!isMobile || mobileStageFilter === 'all' || mobileStageFilter === 'core') && (
              <div className="lg:col-span-6 rounded-xl bg-gradient-to-r from-emerald-50/30 via-white to-sky-50/30 border-2 border-emerald-400 p-3 sm:p-3.5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
                      The Core Build Highway
                    </h3>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                    RECOMMENDED RUSH
                  </span>
                </div>

                {/* 3 Core Items Connected with Chevrons */}
                <div className="flex items-center justify-between gap-2 sm:gap-3 my-1.5 overflow-x-auto no-scrollbar">
                  {renderFeaturedCoreNode(core1Card, '1ST RUSH', 'Primary Spike')}
                  <ArrowRight className="w-6 h-6 text-emerald-600 flex-shrink-0 animate-pulse" />
                  {renderFeaturedCoreNode(core2Card, '2ND CORE', 'Kit Synergy')}
                  <ArrowRight className="w-6 h-6 text-emerald-600 flex-shrink-0 animate-pulse" />
                  {renderFeaturedCoreNode(core3Card, '3RD CORE', 'Peak Capstone')}
                </div>

                {/* Flex Alternatives Pill Bar */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-600 font-sans">
                  <span className="font-bold uppercase text-slate-500 font-['Barlow_Condensed'] text-xs">
                    Tempo Alternatives:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Flex 2nd: <strong className="text-emerald-800 font-black">{altCoreCard.name}</strong>
                    </span>
                    <span className="font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Flex 3rd: <strong className="text-emerald-800 font-black">{altCapstoneCard.name}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-POD C: BOOTS ENGINE (3 COLS) */}
            {(!isMobile || mobileStageFilter === 'all' || mobileStageFilter === 'boots') && (
              <div className="lg:col-span-3 rounded-xl bg-white border border-slate-200 p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
                      T2 BOOTS
                    </span>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
                      Boots Engine
                    </h3>
                  </div>
                </div>

                {/* Default vs Situational Boots */}
                <div className="flex items-center justify-around gap-2 my-1.5">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase text-emerald-700 mb-1">Standard</span>
                    {renderCardNode(defaultBootsCard)}
                  </div>

                  <div className="flex flex-col items-center">
                    <ArrowLeftRight className="w-5 h-5 text-sky-600 animate-pulse my-1" />
                    <span className="text-[9px] font-black uppercase text-slate-400">SWAP</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase text-sky-700 mb-1">Alternative</span>
                    {renderCardNode(altBootsCard)}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-snug mt-1 text-center font-sans">
                  {bootsRec.alternative}
                </div>
              </div>
            )}

          </div>

          {/* SECTION 2: DYNAMIC TACTICAL SWAP STATUS BAR */}
          <div className="relative z-10 px-3.5 py-2 rounded-lg bg-slate-900 text-white flex items-center justify-between text-xs select-none shadow-sm">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              {hoveredCard && hoveredCard.replacesSlot ? (
                <div className="flex items-center gap-2 truncate text-xs sm:text-sm">
                  <span className="text-white font-black uppercase tracking-wide">
                    {hoveredCard.name}
                  </span>
                  <span className="text-amber-400">➔</span>
                  <span className="text-emerald-400 font-bold font-sans">
                    {hoveredCard.swapReason || `Substitute for ${hoveredCard.replacesItemName || hoveredCard.replacesSlot}`}
                  </span>
                </div>
              ) : hoveredCard && cardHasSwapConnection(hoveredCard) ? (
                <div className="flex items-center gap-2 truncate text-xs sm:text-sm">
                  <span className="text-emerald-400 font-black uppercase tracking-wide">
                    {hoveredCard.name}
                  </span>
                  <span className="text-slate-400">➔</span>
                  <span className="text-slate-200 font-medium font-sans">
                    Situational counter alternatives highlighted below
                  </span>
                </div>
              ) : (
                <span className="text-slate-300 uppercase tracking-wider text-xs sm:text-sm font-bold">
                  {isMobile ? 'Tactical Deck • Tap items to view situational swap replacements' : 'Tactical Deck • Hover any item to reveal matchup swap connections'}
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider hidden sm:inline flex-shrink-0 font-bold">
              ZERO-SCROLL TELEMETRY
            </span>
          </div>

          {/* SECTION 3: SITUATIONAL COUNTERS & MATCHUP PIVOTS (MOBALYTICS THREAT PODS) */}
          {(!isMobile || mobileStageFilter === 'all' || mobileStageFilter === 'counters') && (
            <div className="relative z-10 rounded-xl bg-white border border-slate-200 p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
                    Situational Counters & Matchup Pivots
                  </h3>
                  <span className="text-xs font-bold text-slate-500 font-sans hidden sm:inline">
                    — Swap these into your build when facing specific enemy threats
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  5 Threat Categories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {situationalPods.map((pod, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border-2 ${pod.accent} p-2.5 flex flex-col justify-between shadow-2xs bg-white`}
                  >
                    <div className="pb-1.5 mb-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{pod.icon}</span>
                        <span className="text-xs sm:text-[13px] font-black uppercase tracking-wide text-slate-900 truncate">
                          {pod.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-start py-1">
                      {pod.cards.map(renderCardNode)}
                    </div>

                    <span className="text-[10px] text-slate-500 font-sans leading-tight mt-1.5 pt-1.5 border-t border-slate-100 truncate block font-medium">
                      {pod.subtitle}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DOCKED INSPECTOR */}
          {showInspector && activeInspectorCard && (
            <div className="relative z-20 mt-2 p-3 rounded-xl bg-slate-50 border-2 border-slate-200 shadow-sm font-sans animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border-2 border-emerald-500 overflow-hidden bg-white flex-shrink-0 shadow-xs">
                    <img
                      src={getItemIconUrl(version, activeInspectorCard.id)}
                      alt={activeInspectorCard.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-black text-slate-900 leading-none uppercase tracking-wide font-['Barlow_Condensed']">
                        {activeInspectorCard.name}
                      </h4>
                      {activeInspectorCard.isCore ? (
                        <span className="deadlock-badge px-2 py-0 text-[10px] text-emerald-700 bg-emerald-50 border-emerald-300">
                          <span>CORE #{activeInspectorCard.coreOrder || '1'}</span>
                        </span>
                      ) : activeInspectorCard.replacesSlot ? (
                        <span className="deadlock-badge px-2 py-0 text-[10px] text-rose-700 border-rose-300 bg-rose-50">
                          <span>REPLACES {activeInspectorCard.replacesSlot}</span>
                        </span>
                      ) : (
                        <span className="deadlock-badge px-2 py-0 text-[10px] text-slate-700">
                          <span>{activeInspectorCard.tag || 'SITUATIONAL'}</span>
                        </span>
                      )}
                      {activeInspectorCard.isActive && (
                        <span className="deadlock-active-tag text-[8px] py-0 px-1.5">
                          ACTIVE
                        </span>
                      )}
                      {inspectedGold && (
                        <span className="text-amber-900 font-mono font-bold text-xs bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                          {inspectedGold}g
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {activeInspectorCard.timing && (
                    <span className="text-slate-500 text-[11px] font-medium italic">
                      {activeInspectorCard.timing}
                    </span>
                  )}
                  <button
                    onClick={() => setShowInspector(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="p-3 rounded-lg bg-white border border-slate-200">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block mb-1 font-['Barlow_Condensed']">
                    Kit Synergy & Combat Function
                  </span>
                  <p className="text-slate-800 leading-relaxed text-xs sm:text-[13px] font-sans">
                    <GlossaryText text={activeInspectorCard.whatItDoes} />
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900 font-['Barlow_Condensed']">
                      Tactical Purchase Trigger
                    </span>
                    {activeInspectorCard.replacesItemName && (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 font-sans">
                        Sub for {activeInspectorCard.replacesItemName}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-800 leading-relaxed text-xs sm:text-[13px] font-sans">
                    <GlossaryText text={activeInspectorCard.swapReason || activeInspectorCard.whenToBuy} />
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        <PivotSwapGuide
          version={version}
          tactics={tactics}
          allItems={allItems}
        />
      )}

      {/* MOBILE BOTTOM SHEET ITEM INSPECTOR */}
      {isMobile && showMobileDrawer && activeInspectorCard && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 animate-in fade-in duration-150"
          onClick={() => setShowMobileDrawer(false)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-t-2xl p-4 shadow-2xl border-t-2 border-emerald-500 max-h-[85vh] overflow-y-auto font-sans animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

            {/* Header with Item Icon, Name, Category & Gold */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-lg border-2 border-emerald-500 overflow-hidden bg-white flex-shrink-0 shadow-sm">
                  <img
                    src={getItemIconUrl(version, activeInspectorCard.id)}
                    alt={activeInspectorCard.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-base font-black text-slate-900 leading-none uppercase tracking-wide font-['Barlow_Condensed']">
                      {activeInspectorCard.name}
                    </h3>
                    {inspectedGold && (
                      <span className="text-amber-800 font-bold text-xs bg-amber-50 px-1.5 py-0.2 rounded border border-amber-300 font-mono">
                        {inspectedGold}g
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-1 flex-wrap font-['Barlow_Condensed']">
                    {activeInspectorCard.isCore ? (
                      <span className="deadlock-badge px-1.5 py-0 text-[9.5px] text-emerald-700 bg-emerald-50 border-emerald-300">
                        <span>CORE #{activeInspectorCard.coreOrder || '1'}</span>
                      </span>
                    ) : activeInspectorCard.replacesSlot ? (
                      <span className="deadlock-badge px-1.5 py-0 text-[9.5px] text-rose-700 border-rose-300 bg-rose-50">
                        <span>REPLACES {activeInspectorCard.replacesSlot}</span>
                      </span>
                    ) : (
                      <span className="deadlock-badge px-1.5 py-0 text-[9.5px] text-slate-700">
                        <span>{activeInspectorCard.tag || 'SITUATIONAL'}</span>
                      </span>
                    )}
                    {activeInspectorCard.isActive && (
                      <span className="deadlock-active-tag text-[7.5px] py-0 px-1">
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowMobileDrawer(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tactical Content */}
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block mb-1 font-['Barlow_Condensed']">
                  Kit Synergy & Combat Role
                </span>
                <p className="text-slate-800 leading-relaxed text-xs sm:text-[13px] font-sans">
                  <GlossaryText text={activeInspectorCard.whatItDoes} />
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 font-['Barlow_Condensed']">
                    When to Purchase / Swap Trigger
                  </span>
                  {activeInspectorCard.replacesItemName && (
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 font-sans">
                      Sub for {activeInspectorCard.replacesItemName}
                    </span>
                  )}
                </div>
                <p className="text-slate-800 leading-relaxed text-xs sm:text-[13px] font-sans">
                  <GlossaryText text={activeInspectorCard.swapReason || activeInspectorCard.whenToBuy} />
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
