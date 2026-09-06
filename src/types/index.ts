export interface ChampionSummary {
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  image: {
    full: string;
    sprite: string;
    group: string;
  };
  tags: string[];
  partype: string;
}

export interface SpellDetail {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  cooldownBurn: string;
  costBurn: string;
  image: {
    full: string;
  };
}

export interface PassiveDetail {
  name: string;
  description: string;
  image: {
    full: string;
  };
}

export interface ChampionDetail extends ChampionSummary {
  lore: string;
  spells: SpellDetail[];
  passive: PassiveDetail;
  stats: Record<string, number>;
}

export interface ItemData {
  id: string;
  name: string;
  description: string;
  plaintext: string;
  gold: {
    base: number;
    total: number;
    sell: number;
    purchasable: boolean;
  };
  tags: string[];
  stats: Record<string, number>;
  image: {
    full: string;
  };
  from?: string[];
  into?: string[];
  maps?: Record<string, boolean>;
}

export interface TacticalCombo {
  name: string;
  sequence: string[];
  tip: string;
}

export interface PlainAbility {
  tldr: string;
  whenToUse: string;
  keyType?: 'Passive' | 'Q' | 'W' | 'E' | 'R';
  tags?: string[];
}

export interface CoreItemRecommendation {
  itemId: string;
  name: string;
  why: string;
  order: number;
}

export interface RuneEntry {
  name: string;
  slot?: string;
  effect: string;
  why?: string;
}

export interface RuneKitGuide {
  primaryTree: 'Precision' | 'Domination' | 'Sorcery' | 'Resolve' | 'Inspiration';
  keystone: {
    name: string;
    tldr: string;
    why: string;
  };
  primaryMinors: RuneEntry[];
  secondaryTree: 'Precision' | 'Domination' | 'Sorcery' | 'Resolve' | 'Inspiration';
  secondaryMinors: RuneEntry[];
  swapRule: {
    trigger: string;
    take: string;
    insteadOf: string;
    why: string;
  };
  statShards: string;
}

export interface TacticalGuide {
  championId: string;
  role: 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support';
  secondaryRole?: 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support';
  damageType: 'Physical Heavy' | 'Magic Heavy' | 'True / Hybrid';
  playstyle: 'Lane Bully' | 'Hypercarry' | 'Skirmisher' | 'Burst Assassin' | 'Teamfight Tank' | 'Artillery / Poke' | 'Utility Enchanter' | 'Diver';
  identity: string;
  winCondition: string;
  powerSpikes: string[];
  skillMaxOrder: string;
  skillMaxReason: string;
  combos: TacticalCombo[];
  plainAbilities: {
    passive: PlainAbility;
    q: PlainAbility;
    w: PlainAbility;
    e: PlainAbility;
    r: PlainAbility;
  };
  coreBuild: {
    starter: string;
    firstItem: CoreItemRecommendation;
    secondItem: CoreItemRecommendation;
    thirdItem: CoreItemRecommendation;
    bootsRecommendation: {
      defaultId: string;
      defaultName: string;
      why: string;
      alternative: string;
    };
  };
  runeKit: RuneKitGuide;
}

export type ThreatCategory = 
  | 'healing'
  | 'armor'
  | 'magic_resist'
  | 'burst_ap'
  | 'burst_ad'
  | 'hard_cc'
  | 'shields'
  | 'poke_range';

export interface PivotSolution {
  archetype: 'ad_carry' | 'ad_fighter' | 'ad_assassin' | 'ap_mage' | 'ap_assassin' | 'tank' | 'enchanter';
  itemId: string;
  itemName: string;
  componentId?: string;
  componentName?: string;
  why: string;
  timing: string;
}

export interface PivotRule {
  id: string;
  category: ThreatCategory;
  title: string;
  icon: string;
  severity: 'CRITICAL' | 'HIGH' | 'SITUATIONAL';
  triggerPrompt: string;
  triggerChampions: string[];
  solutions: PivotSolution[];
  generalAdvice: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  shortDef: string;
  fullExplanation: string;
  whyItMatters: string;
  category: 'Combat Mechanics' | 'Stats & Ratios' | 'Crowd Control' | 'Item Concepts';
  exampleItemOrChamp?: string;
}
