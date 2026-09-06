import React, { useState, useRef, useMemo } from 'react';
import { TacticalGuide, ItemData } from '../../types';
import { getItemIconUrl } from '../../services/ddragon';
import { GlossaryText } from '../Glossary/BG3Tooltip';
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
    id: isSupport ? '3109' : isMage ? '3102' : isTank ? '4401' : '3156',
    name: isSupport ? "Knight's Vow" : isMage ? "Banshee's Veil" : isTank ? 'Force of Nature' : 'Maw of Malmortius',
    category: isSupport ? 'vitality' : isMage ? 'spirit' : isTank ? 'vitality' : 'weapon',
    replacesSlot: 'Core #2',
    replacesItemName: core2Card.name,
    swapReason: isSupport
      ? 'Redirect 12% ally carry damage onto yourself'
      : isMage
      ? 'Spell shield & MR against enemy burst mages'
      : isTank
      ? 'Max movement speed & magic damage reduction vs DPS mages'
      : 'Rush Maw 2nd vs fed AP assassins to prevent one-shots',
    whatItDoes: isSupport
      ? 'Designate carry: redirect 12% damage onto yourself and heal from their damage.'
      : isMage
      ? 'Grants a spell shield blocking the next enemy ability + 50 MR.'
      : isTank
      ? 'Builds up to 70 bonus MR and 6% move speed when taking magic damage.'
      : 'Triggers a massive Lifeline magic shield on taking lethal AP burst + 10% lifesteal.',
    whenToBuy: 'Against fed AP threats or magic burst.',
    timing: '2nd or 3rd item slot vs heavy AP'
  }), [isSupport, isMage, isTank, core2Card.name]);

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
    id: isSupport ? '3107' : isMage ? '4645' : '6695',
    name: isSupport ? 'Redemption' : isMage ? 'Shadowflame' : "Serpent's Fang",
    category: isSupport ? 'utility' : isMage ? 'spirit' : 'weapon',
    replacesSlot: 'Core #2',
    replacesItemName: core2Card.name,
    swapReason: isSupport
      ? 'Choke point teamfight heal & true damage'
      : isMage
      ? 'Critical magic damage and bonus penetration against shielded / low health targets'
      : 'Rush 2nd vs heavy shield stackers (Sett, Tahm Kench, Karma, Lulu, Shen, Steraks).',
    isActive: isSupport,
    whatItDoes: isSupport
      ? 'Active: Heals all allies in a 5500-range circle and burns enemies.'
      : isMage
      ? 'Passes true AP crits and extra damage against shielded and low-health targets.'
      : 'Reduces enemy shields gained by 50% and instantly carves existing shields.',
    whenToBuy: isSupport ? 'Teamfight choke point utility.' : 'Enemy team stacks shields or high health.',
    timing: '2nd or 3rd situational purchase'
  }), [isSupport, isMage, core2Card.name]);

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

  // Situational Pods organized by Mobalytics Threat Scenarios (Balanced 2-card presentation)
  const situationalPods = useMemo(() => [
    {
      title: 'Anti-Heal (Grievous)',
      subtitle: 'vs Sustain & Drain Healers',
      accent: 'border-rose-400 bg-rose-50/20 text-rose-800',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: '🩸',
      cards: [antiHeal800g, antiHealFull]
    },
    {
      title: 'Anti-Physical & Armor',
      subtitle: 'vs AD Burst & Assassins',
      accent: 'border-amber-400 bg-amber-50/20 text-amber-800',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: '🛡️',
      cards: [antiBurst3, flex2]
    },
    {
      title: 'Magic Resist & Shields',
      subtitle: 'vs Fed AP Mages & Poke',
      accent: 'border-purple-400 bg-purple-50/20 text-purple-800',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: '🔮',
      cards: [antiBurst1, antiBurst2]
    },
    {
      title: 'Armor / MR Penetration',
      subtitle: 'vs Tanks & Resistances',
      accent: 'border-sky-400 bg-sky-50/20 text-sky-800',
      badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: '⚔️',
      cards: [shred1, shred2]
    },
    {
      title: 'Cleanse & Shield Reaver',
      subtitle: 'vs Hard CC & Shield Stacks',
      accent: 'border-emerald-400 bg-emerald-50/20 text-emerald-800',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: '⚡',
      cards: [antiCC1, flex1]
    }
  ], [
    antiHeal800g, antiHealFull,
    antiBurst3, flex2,
    antiBurst1, antiBurst2,
    shred1, shred2,
    antiCC1, flex1
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

  // Render an Authentic Deadlock-Style Item Tile (Light or Dark Theme)
  const renderCardNode = (card: TacticalCard, isDarkTier = false) => {
    const itemData = allItems ? allItems[card.id] : null;
    const gold = itemData?.gold?.total;
    const isHovered = hoveredCard?.id === card.id;
    const isSelected = selectedCard ? selectedCard.id === card.id : (!hoveredCard && card.isCore && card.coreOrder === 1);

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
        className={`group relative w-[82px] sm:w-[90px] md:w-[96px] rounded-md overflow-hidden flex flex-col justify-between cursor-pointer select-none transition-all duration-150 border shadow-2xs ${
          isDarkTier
            ? 'bg-[#15201a] border-[#2a3c30]'
            : 'bg-[#faf9f4] border-[#c4ccbe]'
        } ${
          isTarget
            ? 'scale-105 -translate-y-1 ring-4 ring-rose-500 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)] z-30 animate-pulse'
            : isCandidate
            ? 'scale-105 -translate-y-1 ring-4 ring-sky-500 border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.5)] z-30 animate-pulse'
            : isHovered
            ? isDarkTier
              ? 'scale-105 -translate-y-1 border-[#34d399] shadow-[0_0_14px_rgba(52,211,153,0.4)] z-25 ring-2 ring-[#34d399]'
              : 'scale-105 -translate-y-1 shadow-md z-25 ring-2 ring-emerald-600 border-emerald-600'
            : isSelected
            ? 'ring-2 ring-emerald-500 shadow-sm'
            : isDimmed
            ? 'opacity-30 grayscale-[50%] transition-opacity duration-200'
            : 'hover:-translate-y-0.5 hover:shadow-xs'
        }`}
      >
        {/* Top Artwork Area */}
        <div className="relative p-1.5 flex flex-col items-center justify-center min-h-[66px]">
          {/* Blue Star for Core / Key Items */}
          {card.isCore && (
            <span className="absolute top-1 left-1.5 text-[11px] text-sky-500 leading-none drop-shadow-xs font-black">
              ★
            </span>
          )}

          {/* Item Icon */}
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded overflow-hidden bg-black/10 border border-black/10 flex-shrink-0 shadow-2xs">
            <img
              src={getItemIconUrl(version, card.id)}
              alt={card.name}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Deadlock Black Capsule Active Badge */}
          {card.isActive && (
            <div className="mt-1 flex items-center gap-1 bg-[#101712] text-[#86efac] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border border-[#233527] leading-none shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
              <span>ACTIVE</span>
            </div>
          )}

          {/* High-Contrast Swap Badge over icon on hover connection */}
          {isTarget && (
            <div className="absolute inset-0 bg-rose-600/90 flex items-center justify-center p-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-white text-center leading-tight">
                SWAP OUT
              </span>
            </div>
          )}
          {isCandidate && (
            <div className="absolute inset-0 bg-sky-600/90 flex items-center justify-center p-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-white text-center leading-tight">
                SWAP IN
              </span>
            </div>
          )}
        </div>

        {/* Bottom Shaded Name Plate */}
        <div
          className={`px-1 py-1 text-center min-h-[28px] flex items-center justify-center border-t transition-colors ${
            isDarkTier
              ? 'bg-[#101814] border-[#1f2d24] text-[#d6ede1]'
              : 'bg-[#eae8de] border-[#dad9cd] text-[#222920]'
          }`}
        >
          <span className="text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 font-sans tracking-tight">
            {card.name}
          </span>
        </div>
      </div>
    );
  };

  // Render a Hero-Sized Featured Core Item Node (Deadlock Catalog Spec)
  const renderFeaturedCoreNode = (card: TacticalCard, orderLabel: string, roleSubtitle: string) => {
    const itemData = allItems ? allItems[card.id] : null;
    const gold = itemData?.gold?.total;
    const isHovered = hoveredCard?.id === card.id;
    const isSelected = selectedCard ? selectedCard.id === card.id : (!hoveredCard && card.isCore && card.coreOrder === 1);

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
        className={`group relative flex-1 min-w-[130px] max-w-[220px] rounded-md overflow-hidden flex flex-col justify-between border border-[#c4ccbe] bg-[#faf9f4] transition-all duration-150 cursor-pointer shadow-2xs ${
          isTarget
            ? 'scale-105 ring-4 ring-rose-500 border-rose-500 shadow-[0_0_22px_rgba(244,63,94,0.45)] z-30 animate-pulse'
            : isCandidate
            ? 'scale-105 ring-4 ring-sky-500 border-sky-500 shadow-[0_0_22px_rgba(14,165,233,0.45)] z-30 animate-pulse'
            : isHovered
            ? 'scale-105 shadow-md z-25 ring-2 ring-emerald-600 border-emerald-600'
            : isSelected
            ? 'ring-2 ring-emerald-500 shadow-sm'
            : isDimmed
            ? 'opacity-30 grayscale-[50%]'
            : 'hover:-translate-y-0.5 hover:shadow-xs'
        }`}
      >
        {/* Top Order Strip with Blue Star */}
        <div className="flex items-center justify-between px-2 py-1 bg-[#eae8de] border-b border-[#dad9cd]">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#1e271d] font-mono flex items-center gap-1">
            <span className="text-sky-600 text-xs">★</span> {orderLabel}
          </span>
          {card.isActive && (
            <span className="bg-[#101712] text-[#86efac] text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full border border-[#233527] leading-none">
              ACT
            </span>
          )}
        </div>

        {/* Center Artwork & Details */}
        <div className="p-2.5 flex items-center gap-2.5 my-0.5">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded overflow-hidden bg-black/10 border border-[#c5cdbf] flex-shrink-0 shadow-2xs">
            <img
              src={getItemIconUrl(version, card.id)}
              alt={card.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-black uppercase text-[#1d261c] tracking-wide leading-tight truncate font-['Barlow_Condensed']">
              {card.name}
            </h4>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#576854] uppercase block truncate font-sans mt-0.5">
              {roleSubtitle}
            </span>
          </div>
        </div>

        {/* Swap Signal overlay if targeted during hover */}
        {isTarget && (
          <div className="w-full bg-rose-600 py-1 px-2 text-center shadow-xs">
            <span className="text-xs font-black uppercase tracking-wider text-white block">
              REPLACE WITH PIVOT
            </span>
          </div>
        )}
      </div>
  );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-auto min-h-0 flex flex-col justify-between rounded-2xl border-2 border-[#323d30] bg-[#dbe2d6] p-3 sm:p-4 lg:p-5 shadow-xl overflow-hidden font-['Barlow_Condensed'] select-none"
      style={{
        backgroundImage: 'radial-gradient(#b4c1ae 1.5px, transparent 1.5px)',
        backgroundSize: '18px 18px'
      }}
    >
      {/* Printed Corner Registration Marks */}
      <span className="absolute top-2 left-2 text-xs font-mono text-[#7a8874] select-none pointer-events-none">⌜</span>
      <span className="absolute top-2 right-2 text-xs font-mono text-[#7a8874] select-none pointer-events-none">⌝</span>
      <span className="absolute bottom-2 left-2 text-xs font-mono text-[#7a8874] select-none pointer-events-none">⌞</span>
      <span className="absolute bottom-2 right-2 text-xs font-mono text-[#7a8874] select-none pointer-events-none">⌟</span>

      {/* DEADLOCK HEADER BAR: Binder Tabs & Mystic Requisitions Stamp */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pb-2.5 mb-3 border-b-2 border-[#bcc7b6]">
        <div className="flex items-center gap-3">
          {/* Deadlock Iconic Spine Tabs */}
          <div className="hidden sm:flex items-center gap-1 bg-[#c8d4c2] p-1 rounded-md border border-[#a4b49c] shadow-2xs">
            <span className="w-6 h-6 rounded bg-[#4f9dbf] text-white flex items-center justify-center text-xs font-black shadow-2xs select-none" title="Core Spikes">★</span>
            <span className="w-6 h-6 rounded bg-[#df8634] text-white flex items-center justify-center text-xs font-black shadow-2xs select-none" title="Weapon / AD Damage">⌖</span>
            <span className="w-6 h-6 rounded bg-[#7cb342] text-white flex items-center justify-center text-xs font-black shadow-2xs select-none" title="Vitality / Armor">✚</span>
            <span className="w-6 h-6 rounded bg-[#9c6bb5] text-white flex items-center justify-center text-xs font-black shadow-2xs select-none" title="Spirit / Magic">⬡</span>
          </div>

          {/* Mystic Requisitions Stamped Brand Box */}
          <div className="flex items-center gap-2.5 bg-[#cbd7c5] border border-[#a4b49c] rounded-md px-3 py-1.5 shadow-2xs">
            <div className="flex items-center justify-center w-7 h-7 rounded bg-[#2e3b2c] text-[#7de39b] font-black text-sm tracking-tighter">
              ⬡
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-[#263124] leading-tight font-['Barlow_Condensed']">
                MPS • MYSTIC COMBAT REQUISITIONS
              </span>
              <span className="text-[10px] font-bold text-[#4e5e4b] italic leading-tight">
                VOTED #1 PHARMACY & ARMORY FOR CHAMPIONS
              </span>
            </div>
          </div>
        </div>

        {/* Slanted Version Tag */}
        <div className="flex items-center gap-2">
          <span className="inline-block -rotate-1 bg-[#182319] text-[#7de39b] font-mono font-black text-[11px] px-2.5 py-1 rounded shadow-2xs border border-[#2a3c2c]">
            PATCH 15.x COMPLIANT
          </span>
        </div>
      </div>

      {/* Mobile Stage Filter Tabs */}
      {isMobile && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-2.5 border-b border-[#bcc7b6]">
          {[
            { id: 'all', label: 'All Build Steps' },
            { id: 'early', label: '1: Early & Back' },
            { id: 'core', label: '2: Core Highway' },
            { id: 'boots', label: '3: Boots' },
            { id: 'counters', label: '4: Swappable Pivots' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileStageFilter(tab.id as any)}
              className={`px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all touch-manipulation ${
                mobileStageFilter === tab.id
                  ? 'bg-[#182319] text-[#7de39b] border border-[#2e4030] shadow-xs'
                  : 'bg-[#cbd7c5] text-[#2c372a] hover:bg-white border border-[#a4b49c]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* MAIN BUILD BLUEPRINT & SWAPPABLE PIVOTS */}
      <div className="relative flex-col justify-between space-y-3.5">
        
        {/* ============================================================ */}
        {/* SECTION 1: THE RECOMMENDED BUILD PATH (CHRONOLOGICAL FLOW)   */}
        {/* ============================================================ */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">

          {/* SUB-STAGE A: EARLY GAME & 1ST RECALL (3 COLS) */}
          {(!isMobile || mobileStageFilter === 'all' || mobileStageFilter === 'early') && (
            <div className="lg:col-span-3 rounded-xl bg-[#edf2e8] border-2 border-[#b5c2af] p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between relative">
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#c8d4c2]">
                <div className="flex items-center gap-2">
                  <span className="inline-block -rotate-2 bg-[#182319] text-[#7de39b] font-mono font-black text-xs px-2 py-0.5 rounded shadow-xs border border-[#2a3c2c]">
                    0:00 - 5:00
                  </span>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-[#1f281d]">
                    Early Game & Back
                  </h3>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="space-y-2.5 my-1">
                {/* Starters Sub-Group */}
                <div className="bg-[#e4ebde] p-2 rounded-lg border border-[#c4d0be]">
                  <span className="text-[11px] font-bold text-[#4d5d4a] uppercase block mb-1.5 font-sans">
                    0:00 Initial Spawn
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    {renderCardNode(starterCard)}
                    {renderCardNode(potionCard)}
                  </div>
                </div>

                {/* 1st Recall Sub-Group */}
                <div className="bg-[#e4ebde] p-2 rounded-lg border border-[#c4d0be]">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1.5 font-sans">
                    ~4:30 1st Recall Spike
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    {renderCardNode(firstBackCard)}
                    {renderCardNode(tier1BootsCard)}
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-[#c8d4c2] text-center">
                <span className="text-[11px] text-[#556652] font-sans font-medium">
                  Establish lane wave-control and recall immediately at 1100–1300g
                </span>
              </div>
            </div>
          )}

          {/* SUB-STAGE B: THE CORE BUILD HIGHWAY (6 COLS - RUSH 1 -> 2 -> 3) */}
          {(!isMobile || mobileStageFilter === 'all' || mobileStageFilter === 'core') && (
            <div className="lg:col-span-6 rounded-xl bg-[#edf2e8] border-2 border-[#b5c2af] p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between relative overflow-hidden">
              {/* Radar Circles Watermark */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, transparent 20%, #b8c7b2 21%, transparent 22%, transparent 40%, #b8c7b2 41%, transparent 42%, transparent 60%, #b8c7b2 61%, transparent 62%)',
                  backgroundPosition: 'center center'
                }}
              />

              <div className="relative z-10 flex items-center justify-between pb-2 mb-2.5 border-b border-[#c8d4c2]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-[#1f281d]">
                    The Core Build Highway
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase text-[#1a231b] bg-[#c8d8c2] px-2 py-0.5 rounded border border-[#a8be9e]">
                  RECOMMENDED RUSH
                </span>
              </div>

              {/* The 3 Core Items with Chevrons */}
              <div className="relative z-10 flex items-center justify-between gap-1.5 sm:gap-2 my-1 overflow-x-auto no-scrollbar">
                {renderFeaturedCoreNode(core1Card, '#1 RUSH', 'Primary Spike')}
                <ArrowRight className="w-5 h-5 text-[#2f3d2d] flex-shrink-0 animate-pulse" />
                {renderFeaturedCoreNode(core2Card, '#2 SPIKE', 'Kit Synergy')}
                <ArrowRight className="w-5 h-5 text-[#2f3d2d] flex-shrink-0 animate-pulse" />
                {renderFeaturedCoreNode(core3Card, '#3 PEAK', 'Capstone Spike')}
              </div>

              {/* Flex Alternatives Pill Bar */}
              <div className="relative z-10 mt-2.5 pt-2 border-t border-[#c8d4c2] flex flex-wrap items-center justify-between gap-1 text-[11px] text-[#4d5d4a] font-sans">
                <span className="font-bold uppercase text-[#4d5d4a] font-['Barlow_Condensed'] text-xs">
                  Tempo Alternatives:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold uppercase text-[#293527] bg-[#dae4d4] px-2 py-0.5 rounded border border-[#b8c6b2]">
                    Flex 2nd: <strong className="text-emerald-900 font-black">{altCoreCard.name}</strong>
                  </span>
                  <span className="font-bold uppercase text-[#293527] bg-[#dae4d4] px-2 py-0.5 rounded border border-[#b8c6b2]">
                    Flex 3rd: <strong className="text-emerald-900 font-black">{altCapstoneCard.name}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SUB-STAGE C: BOOTS ENGINE (3 COLS) */}
          {(!isMobile || mobileStageFilter === 'all' || mobileStageFilter === 'boots') && (
            <div className="lg:col-span-3 rounded-xl bg-[#edf2e8] border-2 border-[#b5c2af] p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between relative">
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#c8d4c2]">
                <div className="flex items-center gap-2">
                  <span className="inline-block -rotate-2 bg-[#182319] text-[#7de39b] font-mono font-black text-xs px-2 py-0.5 rounded shadow-xs border border-[#2a3c2c]">
                    T2 BOOTS
                  </span>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-[#1f281d]">
                    Boots Engine
                  </h3>
                </div>
              </div>

              {/* Default vs Situational Boots */}
              <div className="flex items-center justify-around gap-2 my-1">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase text-emerald-800 mb-1">Standard</span>
                  {renderCardNode(defaultBootsCard)}
                </div>

                <div className="flex flex-col items-center">
                  <ArrowLeftRight className="w-4 h-4 text-[#3a4938] animate-pulse my-1" />
                  <span className="text-[9px] font-black uppercase text-[#5a6c56]">SWAP</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase text-sky-800 mb-1">Alternative</span>
                  {renderCardNode(altBootsCard)}
                </div>
              </div>

              <div className="p-2 rounded-lg bg-[#e4ebde] border border-[#c4d0be] text-xs text-[#4d5d4a] leading-snug mt-1 text-center font-sans">
                {bootsRec.alternative}
              </div>
            </div>
          )}

        </div>

        {/* ============================================================ */}
        {/* SECTION 2: SWAPPABLE SITUATIONAL PIVOTS (THREAT ARSENAL)     */}
        {/* ============================================================ */}
        {(!isMobile || mobileStageFilter === 'all' || mobileStageFilter === 'counters') && (
          <div className="relative z-10 rounded-xl bg-[#edf2e8] border-2 border-[#b5c2af] p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#c8d4c2]">
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-[#1f281d]">
                  Swappable Situational Pivots
                </h3>
                <span className="text-xs font-bold text-[#576854] font-sans hidden sm:inline">
                  — Substitute into Core #2, Core #3, or Early Recall when facing specific enemy threats
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#1f281d] uppercase bg-[#dae4d4] px-2 py-0.5 rounded border border-[#b8c6b2]">
                5 Threat Profiles
              </span>
            </div>

            {/* 5 Balanced Threat Pods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {situationalPods.map((pod, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border-2 ${pod.accent} p-3 flex flex-col justify-between shadow-2xs bg-white hover:shadow-md transition-shadow`}
                >
                  {/* Category Header */}
                  <div className="pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base flex-shrink-0">{pod.icon}</span>
                      <span className="text-xs sm:text-[13px] font-black uppercase tracking-wide text-slate-900 truncate">
                        {pod.title}
                      </span>
                    </div>
                  </div>

                  {/* Centered Symmetrical 2-Card Row */}
                  <div className="flex items-center justify-center gap-2 py-1">
                    {pod.cards.map((card) => renderCardNode(card, false))}
                  </div>

                  {/* Threat Subtitle Footer */}
                  <div className="mt-2 pt-2 border-t border-slate-100 text-center">
                    <span className="text-[11px] text-slate-500 font-sans leading-tight block font-semibold truncate">
                      {pod.subtitle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

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
