import React, { useState, useRef, useMemo } from 'react';
import { TacticalGuide, ItemData } from '../../types';
import { getItemIconUrl } from '../../services/ddragon';
import { GlossaryText } from '../Glossary/BG3Tooltip';
import { PivotSwapGuide } from './PivotSwapGuide';
import { X } from 'lucide-react';
import { usePinnedCards } from '../../context/PinnedCardContext';

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
    buyOrderBadge: 'I',
    isActive: core1.name === 'Stridebreaker' || core1.name === "Zhonya's Hourglass" || core1.name === 'Locket of the Iron Solari',
    whatItDoes: core1.why || 'Primary 1-item spike establishing trading & waveclear.',
    whenToBuy: 'Rush as 1st complete legendary item.',
    timing: '1st Full Item'
  }), [core1, isSupport, isMage, isTank]);

  const core2Card: TacticalCard = useMemo(() => ({
    id: core2.itemId,
    name: core2.name,
    category: isSupport ? 'vitality' : isMage ? 'spirit' : isTank ? 'vitality' : 'weapon',
    isCore: true,
    coreOrder: 2,
    buyOrderBadge: 'II',
    isActive: core2.name === "Zhonya's Hourglass",
    whatItDoes: core2.why || 'Core 2-item power spike.',
    whenToBuy: 'Complete 2nd item after boots.',
    timing: 'Core #2'
  }), [core2, isSupport, isMage, isTank]);

  const core3Card: TacticalCard = useMemo(() => ({
    id: core3.itemId,
    name: core3.name,
    category: isSupport ? 'vitality' : isMage ? 'spirit' : isTank ? 'vitality' : 'weapon',
    isCore: true,
    coreOrder: 3,
    buyOrderBadge: 'III',
    whatItDoes: core3.why || 'Capstone spike completing main combat engine.',
    whenToBuy: 'Complete 3rd item.',
    timing: 'Core #3'
  }), [core3, isSupport, isMage, isTank]);

  const altCoreCard: TacticalCard = useMemo(() => ({
    id: isSupport ? '3001' : isADC ? '3087' : isMage ? '4628' : isBruiser ? '6692' : '3084',
    name: isSupport ? 'Trailblazer' : isADC ? 'Statikk Shiv' : isMage ? 'Horizon Focus' : isBruiser ? 'Eclipse' : 'Heartsteel',
    category: isSupport ? 'vitality' : isMage ? 'spirit' : isTank ? 'vitality' : 'weapon',
    buyOrderBadge: 'ALT',
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

    // Check collision with Core #3 (e.g. Darius with Death's Dance 3rd)
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
      buyOrderBadge: 'ALT',
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
    buyOrderBadge: '0:00',
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
    buyOrderBadge: '1ST BACK',
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
    buyOrderBadge: 'BOOTS',
    whatItDoes: '+25 Flat Movement Speed.',
    whenToBuy: 'Pick up on 1st or 2nd back (300g) to dodge skillshots and contest objectives.',
    timing: 'Early Recall (~5:00)'
  }), []);

  // Stage 5 Situational Counter Pods (Realistic Meta Targets: 1st Back, Core #2, Core #3)
  const antiHeal800g: TacticalCard = useMemo(() => ({
    id: isSupport ? (tactics?.damageType === 'Magic Heavy' ? '3916' : '3076') : isMage ? '3916' : isTank ? '3076' : '3123',
    name: isSupport ? (tactics?.damageType === 'Magic Heavy' ? 'Oblivion Orb' : 'Bramble Vest') : isMage ? 'Oblivion Orb' : isTank ? 'Bramble Vest' : "Executioner's Calling",
    category: isMage ? 'spirit' : isTank ? 'vitality' : isSupport ? 'vitality' : 'weapon',
    buyOrderBadge: 'TECH',
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
    buyOrderBadge: 'TECH',
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

  // Group into 5 Chronological Stages
  const chronoStages: ChronoStage[] = useMemo(() => [
    {
      id: 'stage_1',
      stageNumber: 1,
      title: '0:00 Start & Recall',
      subtitle: 'Laning Foundation',
      accentBorder: 'border-emerald-200',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      cards: [starterCard, potionCard, firstBackCard, tier1BootsCard]
    },
    {
      id: 'stage_2',
      stageNumber: 2,
      title: 'Rush #1 & Boots',
      subtitle: 'Primary Spike Engine',
      accentBorder: 'border-sky-200',
      badgeBg: 'bg-sky-50 text-sky-800 border-sky-300',
      cards: [core1Card, defaultBootsCard, altBootsCard]
    },
    {
      id: 'stage_3',
      stageNumber: 3,
      title: 'Mid-Game Core #2',
      subtitle: 'Skirmish Multiplier',
      accentBorder: 'border-amber-200',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
      cards: [core2Card, altCoreCard]
    },
    {
      id: 'stage_4',
      stageNumber: 4,
      title: 'Capstone Core #3',
      subtitle: 'Peak Scaling Spike',
      accentBorder: 'border-rose-200',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-300',
      cards: [core3Card, altCapstoneCard]
    }
  ], [
    starterCard, potionCard, firstBackCard, tier1BootsCard,
    core1Card, defaultBootsCard, altBootsCard,
    core2Card, altCoreCard,
    core3Card, altCapstoneCard
  ]);

  // Stage 5 Situational Counter Pods
  const situationalPods = useMemo(() => [
    {
      title: 'Anti-Heal',
      color: 'border-rose-200 text-rose-800',
      cards: [antiHeal800g, antiHealFull]
    },
    {
      title: 'Anti-Burst & Defense',
      color: 'border-amber-200 text-amber-800',
      cards: [antiBurst1, antiBurst2, antiBurst3]
    },
    {
      title: 'Resist Shred & Pen',
      color: 'border-purple-200 text-purple-800',
      cards: [shred1, shred2]
    },
    {
      title: 'Cleanse & Tenacity',
      color: 'border-emerald-200 text-emerald-800',
      cards: [antiCC1, antiCC2, antiCC3]
    },
    {
      title: 'Tactical Flex',
      color: 'border-sky-200 text-sky-800',
      cards: [flex1, flex2, flex3]
    }
  ], [
    antiHeal800g, antiHealFull,
    antiBurst1, antiBurst2, antiBurst3,
    shred1, shred2,
    antiCC1, antiCC2, antiCC3,
    flex1, flex2, flex3
  ]);

  // Full-Frame Category Colors (Green/White Light Theme)
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
          tagText: 'text-orange-600'
        };
      case 'spirit':
        return {
          border: 'border-purple-500',
          ring: 'ring-purple-500',
          bg: 'bg-white',
          glow: 'shadow-[0_1px_3px_rgba(168,85,247,0.18)]',
          glowStrong: '0_4px_14px_rgba(168,85,247,0.35)',
          badgeBg: 'bg-purple-600 text-white font-black',
          tagText: 'text-purple-600'
        };
      case 'vitality':
        return {
          border: 'border-emerald-600',
          ring: 'ring-emerald-500',
          bg: 'bg-white',
          glow: 'shadow-[0_1px_3px_rgba(16,185,129,0.18)]',
          glowStrong: '0_4px_14px_rgba(16,185,129,0.35)',
          badgeBg: 'bg-emerald-600 text-white font-black',
          tagText: 'text-emerald-700'
        };
      case 'utility':
        return {
          border: 'border-sky-500',
          ring: 'ring-sky-500',
          bg: 'bg-white',
          glow: 'shadow-[0_1px_3px_rgba(14,165,233,0.18)]',
          glowStrong: '0_4px_14px_rgba(14,165,233,0.35)',
          badgeBg: 'bg-sky-600 text-white font-black',
          tagText: 'text-sky-700'
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
      if (hovered.replacesSlot === '1st Back' && (targetCard.buyOrderBadge === '1ST BACK' || targetCard.name === firstBackCard.name)) return true;
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
    if ((hovered.buyOrderBadge === '1ST BACK' || hovered.name === firstBackCard.name) && candidateCard.replacesSlot === '1st Back') {
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

  // Check if a card participates in any swap pairings
  const cardHasSwapConnection = (card: TacticalCard): boolean => {
    if (card.replacesSlot || card.replacesItemName) return true;
    if (card.id === defaultBootsCard.id || card.id === altBootsCard.id) return true;
    if (card.buyOrderBadge === '1ST BACK') return true;
    if (card.isCore && (card.coreOrder === 1 || card.coreOrder === 2 || card.coreOrder === 3)) return true;
    return false;
  };

  // Render a Single Ultra-Compact Tactical Item Tile with Zero Arrows and Crisp Hover Swaps
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
          setShowInspector(true);
        }}
        onMouseEnter={(e) => {
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
          setHoveredCard(null);
          unregisterHover(card.id);
        }}
        className={`group relative w-[56px] sm:w-[64px] md:w-[70px] lg:w-[76px] xl:w-[80px] h-[60px] sm:h-[68px] md:h-[74px] lg:h-[80px] xl:h-[86px] rounded-md flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-all duration-150 border-2 ${frame.border} ${frame.bg} ${
          isTarget
            ? 'scale-105 sm:scale-110 -translate-y-1 ring-3 sm:ring-4 ring-rose-500 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] z-30 animate-pulse'
            : isCandidate
            ? 'scale-105 sm:scale-110 -translate-y-1 ring-3 sm:ring-4 ring-sky-500 border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.4)] z-30 animate-pulse'
            : isHovered
            ? `scale-105 sm:scale-110 -translate-y-1 shadow-[0_4px_16px_rgba(0,0,0,0.15),${frame.glowStrong}] z-25 ring-2 sm:ring-3 ${frame.ring}`
            : isSelected
            ? 'shadow-[0_0_10px_rgba(16,185,129,0.4)] ring-2 ring-emerald-500'
            : isDimmed
            ? 'opacity-30 grayscale-[50%] transition-opacity duration-200'
            : `${frame.glow} hover:-translate-y-0.5 hover:shadow-md`
        }`}
      >
        {/* Full-Bleed Artwork: Edge-to-Edge Icon Viewport */}
        <div className="relative w-full flex-1 overflow-hidden bg-slate-100 flex items-center justify-center">
          <img
            src={getItemIconUrl(version, card.id)}
            alt={card.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
            loading="lazy"
          />

          {/* Micro Corner Pill: Gold (Top-Left) */}
          {gold ? (
            <div className="absolute top-0.5 left-0.5 pointer-events-none z-10">
              <span className="text-[7px] sm:text-[8px] md:text-[9px] font-mono font-black text-amber-950 bg-amber-100/95 backdrop-blur-xs px-0.5 py-0 rounded border border-amber-400 shadow-2xs leading-none">
                {gold >= 1000 ? `${(gold / 1000).toFixed(1)}k` : `${gold}g`}
              </span>
            </div>
          ) : null}

          {/* Micro Corner Pill: Milestone / Active (Top-Right) */}
          <div className="absolute top-0.5 right-0.5 flex items-center gap-0.5 pointer-events-none z-10">
            {card.isActive && (
              <span className="text-[6px] sm:text-[7px] md:text-[7.5px] font-black text-white bg-slate-900 border border-slate-700 px-0.5 py-0 rounded shadow-2xs leading-none">
                ACT
              </span>
            )}
            {card.isCore && card.coreOrder ? (
              <span className="text-[7px] sm:text-[8px] md:text-[8.5px] font-black text-white bg-emerald-600 px-1 py-0 rounded shadow-2xs border border-emerald-700 leading-none">
                {card.coreOrder === 1 ? 'I' : card.coreOrder === 2 ? 'II' : 'III'}
              </span>
            ) : card.buyOrderBadge ? (
              <span className="text-[6px] sm:text-[7px] md:text-[7.5px] font-black uppercase text-slate-800 bg-white/95 px-0.5 py-0 rounded border border-slate-300 leading-none shadow-2xs">
                {card.buyOrderBadge}
              </span>
            ) : null}
          </div>

          {/* Micro Bottom Glass Label or High-Contrast Swap Badge */}
          {isTarget ? (
            <div className="absolute bottom-0 inset-x-0 bg-rose-600/95 py-0.5 px-0.5 flex items-center justify-center text-center z-20 pointer-events-none shadow-md">
              <span className="text-[7px] sm:text-[8px] md:text-[8.5px] font-black uppercase tracking-wider text-white leading-none">
                SWAP OUT
              </span>
            </div>
          ) : isCandidate ? (
            <div className="absolute bottom-0 inset-x-0 bg-sky-600/95 py-0.5 px-0.5 flex items-center justify-center text-center z-20 pointer-events-none shadow-md">
              <span className="text-[7px] sm:text-[8px] md:text-[8.5px] font-black uppercase tracking-wider text-white leading-none">
                SWAP IN
              </span>
            </div>
          ) : (
            <div className="absolute bottom-0 inset-x-0 h-[15px] sm:h-[17px] bg-slate-950/85 backdrop-blur-xs px-0.5 flex items-center justify-center text-center z-10 pointer-events-none">
              <span className="text-[7.5px] sm:text-[8px] md:text-[8.5px] font-black uppercase text-white line-clamp-1 tracking-tight font-['Barlow_Condensed'] leading-tight">
                {card.name}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-auto min-h-0 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-2 sm:p-2.5 lg:p-3 shadow-xs overflow-hidden font-['Barlow_Condensed'] select-none"
      style={{
        backgroundImage: 'radial-gradient(#e2e8f0 1.25px, transparent 1.25px)',
        backgroundSize: '16px 16px'
      }}
    >
      {/* Utility Control Bar */}
      <div className="relative z-20 flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex items-center bg-slate-100 rounded p-0.5 border border-slate-200">
            <button
              onClick={() => setSubView('canvas')}
              className={`px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                subView === 'canvas'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Canvas
            </button>
            <button
              onClick={() => setSubView('matrix')}
              className={`px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                subView === 'matrix'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matrix
            </button>
          </div>
        </div>

        {/* Inspector Toggle */}
        <button
          onClick={() => setShowInspector(!showInspector)}
          className={`px-2 py-0.5 rounded border text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
            showInspector
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
              : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
          }`}
        >
          {showInspector ? 'Inspector: On' : 'Inspector: Off'}
        </button>
      </div>

      {/* Main View Area */}
      {subView === 'canvas' ? (
        <div className="relative flex-col justify-between space-y-1.5">

          {/* TIER 1: CHRONOLOGICAL PROGRESSION (STAGES 1 - 4) */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {chronoStages.map((stage) => (
              <div
                key={stage.id}
                className={`rounded-lg bg-white border ${stage.accentBorder} flex flex-col justify-between overflow-hidden shadow-2xs`}
              >
                <div className="px-2 py-0.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider border ${stage.badgeBg}`}>
                      {stage.stageNumber}
                    </span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      {stage.title}
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                    {stage.stageNumber === 1 ? 'EARLY' : stage.stageNumber === 2 ? 'CORE 1-2' : stage.stageNumber === 3 ? 'SPIKE' : 'CAPSTONE'}
                  </span>
                </div>

                <div className="p-1.5 sm:p-2 flex flex-wrap items-center gap-1.5 sm:gap-2 justify-start bg-slate-50/40">
                  {stage.cards.map(renderCardNode)}
                </div>
              </div>
            ))}
          </div>

          {/* DYNAMIC TACTICAL SWAP STATUS BAR */}
          <div className="relative z-10 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs select-none shadow-2xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              {hoveredCard && hoveredCard.replacesSlot ? (
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-900 font-black uppercase tracking-wide">
                    {hoveredCard.name}
                  </span>
                  <span className="text-slate-400">➔</span>
                  <span className="text-rose-600 font-bold uppercase tracking-wide">
                    Replaces {hoveredCard.replacesSlot} ({hoveredCard.replacesItemName})
                  </span>
                  {hoveredCard.swapReason && (
                    <span className="text-slate-500 hidden md:inline truncate">
                      — {hoveredCard.swapReason}
                    </span>
                  )}
                </div>
              ) : hoveredCard && cardHasSwapConnection(hoveredCard) ? (
                <div className="flex items-center gap-2 truncate">
                  <span className="text-emerald-700 font-black uppercase tracking-wide">
                    {hoveredCard.name}
                  </span>
                  <span className="text-slate-400">➔</span>
                  <span className="text-slate-600 font-medium">
                    Situational swap alternatives highlighted below
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 uppercase tracking-wider text-[10.5px] font-bold">
                  Tactical Item Deck • Hover items to highlight swap options
                </span>
              )}
            </div>
            <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider hidden sm:inline flex-shrink-0">
              Zero-Scroll HUD
            </span>
          </div>

          {/* TIER 2: SITUATIONAL COUNTERS & PIVOTS */}
          <div className="relative z-10 rounded-lg bg-white border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
            <div className="px-2 py-0.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                Situational Counters & Pivots
              </span>
              <span className="text-[9px] text-slate-500 font-sans hidden sm:inline">
                Optional items to swap into build based on enemy team
              </span>
            </div>

            <div className="p-1.5 sm:p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1.5 lg:gap-2 bg-slate-50/40">
              {situationalPods.map((pod, idx) => (
                <div
                  key={idx}
                  className="rounded bg-white border border-slate-200 p-1.5 flex flex-col justify-between shadow-2xs"
                >
                  <div className="pb-0.5 mb-1 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                      {pod.title}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 justify-start">
                    {pod.cards.map(renderCardNode)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DOCKED INSPECTOR */}
          {showInspector && activeInspectorCard && (
            <div className="relative z-20 mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 shadow-xs font-sans animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded border-2 border-emerald-500 overflow-hidden bg-white flex-shrink-0 shadow-xs">
                    <img
                      src={getItemIconUrl(version, activeInspectorCard.id)}
                      alt={activeInspectorCard.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 leading-none uppercase tracking-wide font-['Barlow_Condensed']">
                        {activeInspectorCard.name}
                      </h4>
                      {activeInspectorCard.isCore ? (
                        <span className="deadlock-badge px-1.5 py-0 text-[9px] text-emerald-700">
                          <span>CORE #{activeInspectorCard.coreOrder || '1'}</span>
                        </span>
                      ) : activeInspectorCard.replacesSlot ? (
                        <span className="deadlock-badge px-1.5 py-0 text-[9px] text-rose-700 border-rose-300">
                          <span>REPLACES {activeInspectorCard.replacesSlot}</span>
                        </span>
                      ) : (
                        <span className="deadlock-badge px-1.5 py-0 text-[9px] text-slate-700">
                          <span>{activeInspectorCard.tag || 'SITUATIONAL'}</span>
                        </span>
                      )}
                      {activeInspectorCard.isActive && (
                        <span className="deadlock-active-tag text-[7px] py-0 px-1">
                          ACTIVE
                        </span>
                      )}
                      {inspectedGold && (
                        <span className="text-amber-800 font-bold text-xs">
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
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-0.5 font-['Barlow_Condensed']">
                    Kit Synergy & Function
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11.5px]">
                    <GlossaryText text={activeInspectorCard.whatItDoes} />
                  </p>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block mb-0.5 font-['Barlow_Condensed']">
                    Tactical Purchase Trigger
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11.5px]">
                    <GlossaryText text={activeInspectorCard.whenToBuy} />
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
    </div>
  );
};
