export type ItemPassiveTag = 
  | 'Spellblade' 
  | 'Lifeline' 
  | 'ArmorPen' 
  | 'MagicPen' 
  | 'Lethality' 
  | 'Burn' 
  | 'AntiHeal' 
  | 'Stasis' 
  | 'OnHit' 
  | 'Omnivamp' 
  | 'Tenacity' 
  | 'TankAura'
  | 'ManaSurge'
  | 'ShieldAmp'
  | 'Execute'
  | 'MoveSpeed';

export interface ItemEssence {
  id: string;
  name: string;
  tags: ItemPassiveTag[];
  defaultWhy: string;
  roleOverrides?: Partial<Record<'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support', string>>;
  playstyleOverrides?: Partial<Record<string, string>>;
}

export const ITEM_ESSENCE_MAP: Record<string, ItemEssence> = {
  // === FIGHTER / BRUISER ===
  '3078': {
    id: '3078',
    name: 'Trinity Force',
    tags: ['Spellblade', 'OnHit', 'MoveSpeed'],
    defaultWhy: 'Spellblade proc turns frequent ability casts into heavy burst alongside ramping base attack damage in extended duels.',
    roleOverrides: {
      ADC: 'Empowers frequent spell-weaving with massive single-target burst on primary auto attacks.',
      Top: 'Dominates extended 1v1 splitpush duels with ramping attack damage and bonus move speed on hit.'
    }
  },
  '3071': {
    id: '3071',
    name: 'Black Cleaver',
    tags: ['ArmorPen', 'MoveSpeed'],
    defaultWhy: 'Carve shreds up to 28% enemy total armor across multi-hit abilities while granting speed to stick to targets.',
    playstyleOverrides: {
      'Lane Bully': 'Shreds opposing armor rushers and grants maximum ability haste for relentless trading.'
    }
  },
  '3053': {
    id: '3053',
    name: "Sterak's Gage",
    tags: ['Lifeline', 'Tenacity'],
    defaultWhy: 'Lifeline triggers a massive shield when taking lethal burst damage, providing unmatched clutch teamfight survivability.'
  },
  '6631': {
    id: '6631',
    name: 'Stridebreaker',
    tags: ['MoveSpeed'],
    defaultWhy: 'Halting Slash active slows nearby enemies in a circle, preventing targets from kiting outside your melee range.'
  },
  '6630': {
    id: '6630',
    name: 'Sundered Sky',
    tags: ['Lifeline'],
    defaultWhy: 'Lightshield Strike guarantees a massive critical strike and missing health heal on your first strike against each champion.'
  },
  '3074': {
    id: '3074',
    name: 'Ravenous Hydra',
    tags: ['Omnivamp'],
    defaultWhy: 'Full area-of-effect lifesteal cleave allowing instant minion wave wipes and sustained skirmish recovery.'
  },
  '6333': {
    id: '6333',
    name: "Death's Dance",
    tags: ['Lifeline'],
    defaultWhy: 'Stores 30% of incoming physical damage as bleed, cleansing the bleed upon scoring a takedown and restoring health.'
  },
  '3153': {
    id: '3153',
    name: 'Blade of the Ruined King',
    tags: ['OnHit', 'MoveSpeed'],
    defaultWhy: 'Mist\'s Edge strikes deal % current health physical damage on hit, turning tanky health stackers into quick prey.'
  },

  // === MARKSMAN / CRIT ===
  '6672': {
    id: '6672',
    name: 'Kraken Slayer',
    tags: ['OnHit'],
    defaultWhy: 'Bring It Down discharges ramping physical damage every 3rd basic attack, providing unrivaled sustained DPS.'
  },
  '3031': {
    id: '3031',
    name: 'Infinity Edge',
    tags: ['Execute'],
    defaultWhy: 'Perfection passive amplifies critical strike damage to 215%, transforming late-game auto-attacks into lethal strikes.'
  },
  '3036': {
    id: '3036',
    name: "Lord Dominik's Regards",
    tags: ['ArmorPen'],
    defaultWhy: 'Provides 35% Armor Penetration to puncture through high-armor frontliners and tanks in 5v5 teamfights.'
  },
  '3094': {
    id: '3094',
    name: 'Rapid Firecannon',
    tags: ['MoveSpeed'],
    defaultWhy: 'Sharpshooter charges an energised attack with +35% bonus attack range, enabling safe poke before fights begin.'
  },
  '3085': {
    id: '3085',
    name: "Runaan's Hurricane",
    tags: ['OnHit'],
    defaultWhy: 'Wind\'s Fury bolts split your basic attacks into 2 extra targets, applying full on-hit effects in teamfights.'
  },
  '3046': {
    id: '3046',
    name: 'Phantom Dancer',
    tags: ['MoveSpeed', 'OnHit'],
    defaultWhy: 'Spectral Waltz grants ghosting and stacking movement speed, giving hypercarries fluid kiting potential.'
  },
  '3072': {
    id: '3072',
    name: 'Bloodthirster',
    tags: ['Lifeline'],
    defaultWhy: 'Massive lifesteal with an overheal shield that protects squishy carries from being picked off before fights.'
  },

  // === MAGE / AP ===
  '6653': {
    id: '6653',
    name: "Liandry's Torment",
    tags: ['Burn'],
    defaultWhy: 'Torment burns enemies for % maximum health magic damage every second, shredding bruisers and high-HP tanks.'
  },
  '3089': {
    id: '3089',
    name: "Rabadon's Deathcap",
    tags: ['Execute'],
    defaultWhy: 'Magical Opus multiplies total Ability Power by 35%, elevating every spell ratio to its absolute maximum ceiling.'
  },
  '3157': {
    id: '3157',
    name: "Zhonya's Hourglass",
    tags: ['Stasis'],
    defaultWhy: '2.5s golden Stasis makes you completely invulnerable, stalling out lethal enemy assassin burst and dive combos.',
    playstyleOverrides: {
      'Burst Assassin': 'Allows diving into the backline to burst a target, then going invulnerable until mobility cools down.',
      'Control Mage': 'Guarantees self-peel when enemy divers flash onto you in teamfights.'
    }
  },
  '3135': {
    id: '3135',
    name: 'Void Staff',
    tags: ['MagicPen'],
    defaultWhy: '40% Magic Penetration cuts directly through enemy Magic Resist items like Kaenic Rookern and Force of Nature.'
  },
  '6655': {
    id: '6655',
    name: "Luden's Companion",
    tags: ['ManaSurge'],
    defaultWhy: 'Loads Shot charges to unleash high burst magic damage on ability cast, accelerating waveclear and squishy picks.'
  },
  '3003': {
    id: '3003',
    name: "Archangel's Staff",
    tags: ['ManaSurge', 'Lifeline'],
    defaultWhy: 'Converts maximum mana into ability power and transforms into Seraph\'s Embrace for a massive emergency Lifeline shield.'
  },
  '3116': {
    id: '3116',
    name: "Rylai's Crystal Scepter",
    tags: ['TankAura'],
    defaultWhy: 'Damaging abilities slow targets by 30% for 1 second, permanently controlling enemy positioning in extended fights.'
  },
  '3165': {
    id: '3165',
    name: 'Morellonomicon',
    tags: ['AntiHeal', 'MagicPen'],
    defaultWhy: 'Inflicts 40% Grievous Wounds on magic damage, neutralizing healing enchanters, sustain bruisers, and lifesteal.'
  },
  '4629': {
    id: '4629',
    name: 'Cosmic Drive',
    tags: ['MoveSpeed'],
    defaultWhy: 'Hitting spells grants surging movement speed and rapid ability haste to weave continuous ability rotations.'
  },

  // === ASSASSIN / LETHALITY ===
  '3142': {
    id: '3142',
    name: "Youmuu's Ghostblade",
    tags: ['Lethality', 'MoveSpeed'],
    defaultWhy: 'Haunt grants out-of-combat move speed and Wraith Step active gives sudden burst velocity for cross-map roams.'
  },
  '6694': {
    id: '6694',
    name: "Serylda's Grudge",
    tags: ['ArmorPen', 'Lethality'],
    defaultWhy: 'Combines heavy lethality with % Armor Penetration so assassin burst punches through both squishies and bruisers.'
  },
  '3814': {
    id: '3814',
    name: 'Edge of Night',
    tags: ['Lifeline'],
    defaultWhy: 'Spell shield blocks the first hostile enemy ability, preventing cc-locks from interrupting your dive assassination.'
  },
  '6695': {
    id: '6695',
    name: "Serpent's Fang",
    tags: ['AntiHeal'],
    defaultWhy: 'Shield Reaver cuts newly applied enemy shields by 50%, completely nullifying Sterak\'s, barrier, and enchanter shields.'
  },
  '6692': {
    id: '6692',
    name: 'Eclipse',
    tags: ['Lifeline'],
    defaultWhy: 'Hitting a champion with 2 separate attacks or spells within 1.5s grants an instant shield and % max HP burst damage.'
  },
  '6696': {
    id: '6696',
    name: 'Axiom Arc',
    tags: ['Lethality'],
    defaultWhy: 'Flux restores 20% of ultimate cooldown upon champion takedowns, allowing chained execute casts in teamfights.'
  },

  // === TANK ===
  '3068': {
    id: '3068',
    name: 'Sunfire Aegis',
    tags: ['TankAura', 'Burn'],
    defaultWhy: 'Immolate burns surrounding enemies and minions with stacking waveclear aura while stacking high Armor and HP.'
  },
  '2504': {
    id: '2504',
    name: 'Kaenic Rookern',
    tags: ['Lifeline'],
    defaultWhy: 'Magebane creates a regenerating magic damage shield equal to 18% max health, nullifying incoming AP burst.'
  },
  '3075': {
    id: '3075',
    name: 'Thornmail',
    tags: ['AntiHeal', 'TankAura'],
    defaultWhy: 'Inflicts 40% Grievous Wounds and reflects magic damage back whenever an enemy attacks you with auto-attacks.'
  },
  '3110': {
    id: '3110',
    name: 'Frozen Heart',
    tags: ['TankAura'],
    defaultWhy: 'Winter\'s Caress aura cripples enemy attack speed by 20%, shutting down on-hit carries and marksmen.'
  },
  '3065': {
    id: '3065',
    name: 'Spirit Visage',
    tags: ['Lifeline'],
    defaultWhy: 'Boundless Vitality amplifies all incoming heals and shields by 25%, turning innate sustain tanks unkillable.'
  },
  '3742': {
    id: '3742',
    name: "Dead Man's Plate",
    tags: ['MoveSpeed'],
    defaultWhy: 'Shipwrecker builds up movement speed to initiate ganks, then discharges into a heavy slowing melee strike.'
  },
  '3083': {
    id: '3083',
    name: 'Warmog\'s Armor',
    tags: ['TankAura'],
    defaultWhy: 'Warmog\'s Heart triggers massive out-of-combat health regeneration when above bonus health thresholds.'
  },

  // === SUPPORT / ENCHANTER ===
  '3107': {
    id: '3107',
    name: 'Redemption',
    tags: ['ShieldAmp'],
    defaultWhy: 'Intervention drops an orbital beam healing all allies for hundreds of health while damaging enemy teams in area.'
  },
  '3190': {
    id: '3190',
    name: 'Locket of the Iron Solari',
    tags: ['Lifeline', 'ShieldAmp'],
    defaultWhy: 'Active grants a decaying shield to all nearby allies to absorb lethal area-of-effect combo damage in teamfights.'
  },
  '3504': {
    id: '3504',
    name: 'Ardent Censer',
    tags: ['ShieldAmp'],
    defaultWhy: 'Healing or shielding allies grants them bonus attack speed and on-hit magic damage, hypercharging your ADC.'
  },
  '6617': {
    id: '6617',
    name: 'Moonstone Renewer',
    tags: ['ShieldAmp'],
    defaultWhy: 'Starlit Grace chains your heals and shields to the next nearby ally, doubling teamfight protective throughput.'
  },
  '3011': {
    id: '3011',
    name: 'Chemtech Putrifier',
    tags: ['AntiHeal'],
    defaultWhy: 'Empowers ally attacks and spells with Grievous Wounds, applying anti-heal across the entire enemy team.'
  },
  '3050': {
    id: '3050',
    name: "Zeke's Convergence",
    tags: ['TankAura'],
    defaultWhy: 'Casting your ultimate summons a frost storm around you, burning and slowing enemies for crowd-control follow up.'
  }
};

/**
 * Synthesizes an authentic, tactical "Why Buy" rationale for any champion and item combination,
 * avoiding repetitive generic boilerplate text.
 */
export function synthesizeItemRationale(
  itemId: string,
  itemName: string,
  role: 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support' = 'Mid',
  playstyle: string = 'Skirmisher',
  damageType: string = 'Physical Heavy',
  order: number = 1
): string {
  const essence = ITEM_ESSENCE_MAP[itemId];
  if (essence) {
    if (essence.roleOverrides?.[role]) {
      return essence.roleOverrides[role]!;
    }
    if (essence.playstyleOverrides?.[playstyle]) {
      return essence.playstyleOverrides[playstyle]!;
    }
    return essence.defaultWhy;
  }

  // Smart algorithmic synthesis when item is not in dictionary
  if (order === 1) {
    return `Foundational first-item power spike providing lane control, waveclear tempo, and core stat baseline.`;
  }
  if (order === 2) {
    return `Critical mid-game power amplifier synergizing with your ${damageType.toLowerCase()} trading cadence.`;
  }
  return `High-value late-game finisher providing situational teamfight presence and late scaling resilience.`;
}
