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
    defaultWhy: 'Carve shreds up to 30% enemy total armor across multi-hit abilities while granting speed to stick to targets.',
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
    tags: ['Execute', 'OnHit'],
    defaultWhy: 'Lightshield Strike guarantees a massive critical strike and missing health heal on your first strike against each champion.'
  },
  '3074': {
    id: '3074',
    name: 'Ravenous Hydra',
    tags: ['Omnivamp'],
    defaultWhy: 'Full area-of-effect lifesteal cleave allowing instant minion wave wipes and sustained skirmish recovery.'
  },
  '3748': {
    id: '3748',
    name: 'Titanic Hydra',
    tags: ['Execute', 'OnHit'],
    defaultWhy: 'Cleaves nearby enemies based on max health and provides an active basic attack reset for heavy burst damage.'
  },
  '6333': {
    id: '6333',
    name: "Death's Dance",
    tags: ['Omnivamp'],
    defaultWhy: 'Stores 30% of incoming physical damage as bleed, cleansing the bleed upon scoring a takedown and restoring health.'
  },
  '3156': {
    id: '3156',
    name: 'Maw of Malmortius',
    tags: ['Lifeline'],
    defaultWhy: 'Lifeline triggers an immense magic damage absorption shield and lifesteal when burst below 30% health by AP champions.'
  },
  '6609': {
    id: '6609',
    name: 'Chempunk Chainsword',
    tags: ['AntiHeal'],
    defaultWhy: 'Inflicts 40% Grievous Wounds on physical damage, neutralizing enemy lifesteal carries and drain-tank bruisers.'
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
    tags: ['Omnivamp'],
    defaultWhy: 'Massive lifesteal with escalating Attack Damage while healthy, giving hypercarries sustained duel survivability.'
  },
  '3033': {
    id: '3033',
    name: 'Mortal Reminder',
    tags: ['ArmorPen', 'AntiHeal'],
    defaultWhy: 'Combines 35% Armor Penetration, 25% Crit Chance, and 40% Grievous Wounds to eliminate armor stackers and healers simultaneously.'
  },
  '3124': {
    id: '3124',
    name: "Guinsoo's Rageblade",
    tags: ['OnHit'],
    defaultWhy: 'Phantom Hit triggers all on-hit effects twice every 3rd attack while ramping high attack speed and dual penetration.'
  },
  '3115': {
    id: '3115',
    name: "Nashor's Tooth",
    tags: ['OnHit'],
    defaultWhy: 'Icathian Bite infuses basic attacks with high scaling on-hit magic damage, enabling hybrid and AP marksmen to melt targets.'
  },
  '3302': {
    id: '3302',
    name: 'Terminus',
    tags: ['ArmorPen', 'MagicPen', 'OnHit'],
    defaultWhy: 'Alternates attacks between stacking up to 30% dual Armor/Magic Penetration and stacking up to 25 bonus Armor and MR.'
  },
  '3026': {
    id: '3026',
    name: 'Guardian Angel',
    tags: ['Execute'],
    defaultWhy: 'Grants bonus Armor, Attack Damage, and a full revive on lethal damage, forcing enemy assassins to waste their dive cooldowns.'
  },
  '3139': {
    id: '3139',
    name: 'Mercurial Scimitar',
    tags: ['MoveSpeed'],
    defaultWhy: 'Quicksilver active cleanses all crowd control including Suppression and gives a 50% burst of movement speed.'
  },
  '3004': {
    id: '3004',
    name: 'Manamune',
    tags: ['ManaSurge'],
    defaultWhy: 'Grants bonus AD scaling with maximum mana and transforms into Muramana for bonus on-hit physical damage on attacks and abilities.'
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
  '4645': {
    id: '4645',
    name: 'Shadowflame',
    tags: ['MagicPen', 'Execute'],
    defaultWhy: 'Cinderbloom inflicts bonus critical magic damage on targets below 35% health, converting picks and combos into guaranteed executions.'
  },
  '4628': {
    id: '4628',
    name: 'Horizon Focus',
    tags: ['Execute'],
    defaultWhy: 'Hypershot reveals enemies and amplifies all damage dealt to them by 10% when hitting abilities from long range.'
  },
  '3118': {
    id: '3118',
    name: 'Malignance',
    tags: ['ManaSurge', 'Burn'],
    defaultWhy: 'Hatefog scorches the ground beneath ultimate targets, shredding their Magic Resist and refunding ultimate ability haste.'
  },
  '4646': {
    id: '4646',
    name: 'Stormsurge',
    tags: ['MoveSpeed', 'Execute'],
    defaultWhy: 'Dealing 35% of a champion\'s health within 2.5 seconds unleashes Squall lightning damage and grants surging movement speed.'
  },
  '3100': {
    id: '3100',
    name: 'Lich Bane',
    tags: ['Spellblade', 'MoveSpeed'],
    defaultWhy: 'Spellblade empowers the next attack after casting a spell with heavy bonus AP scaling burst damage.'
  },
  '3102': {
    id: '3102',
    name: "Banshee's Veil",
    tags: ['MagicPen'],
    defaultWhy: 'Annul spell shield blocks the next incoming hostile ability, preventing enemy engagement combos from stopping you.'
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
    tags: ['MoveSpeed'],
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
    tags: ['Lethality'],
    defaultWhy: 'Spell shield blocks the first hostile enemy ability, preventing cc-locks from interrupting your dive assassination.'
  },
  '6695': {
    id: '6695',
    name: "Serpent's Fang",
    tags: ['Lethality'],
    defaultWhy: 'Shield Reaver cuts newly applied enemy shields by 50%, completely nullifying Sterak\'s, barrier, and enchanter shields.'
  },
  '6692': {
    id: '6692',
    name: 'Eclipse',
    tags: ['Execute'],
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
    tags: ['TankAura'],
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
    tags: ['ShieldAmp'],
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
  '6665': {
    id: '6665',
    name: "Jak'Sho, The Protean",
    tags: ['TankAura'],
    defaultWhy: 'Voidborn Resilience grants stacking resistances each second in champion combat, increasing bonus Armor and MR by 30% at max stacks.'
  },
  '8020': {
    id: '8020',
    name: 'Abyssal Mask',
    tags: ['TankAura', 'MagicPen'],
    defaultWhy: 'Unmake aura drains surrounding enemies of Magic Resistance and grants bonus Magic Resist for each nearby opponent.'
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
    tags: ['ShieldAmp'],
    defaultWhy: 'Active grants a decaying shield to all nearby allies to absorb lethal area-of-effect combo damage in teamfights.'
  },
  '3109': {
    id: '3109',
    name: "Knight's Vow",
    tags: ['TankAura'],
    defaultWhy: 'Sacrifice designates a Worthy Ally, redirecting 12% of damage they take onto you while healing you for 10% of the damage they deal.'
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
  '3222': {
    id: '3222',
    name: "Mikael's Blessing",
    tags: ['ShieldAmp'],
    defaultWhy: 'Purify active removes all crowd control debuffs (except Knockups/Suppression) from an allied carry and heals them for 100-180 health.'
  },
  '2065': {
    id: '2065',
    name: "Shurelya's Battlesong",
    tags: ['MoveSpeed'],
    defaultWhy: 'Motivate active grants all nearby allies a surging 30% movement speed burst to engage teamfights or disengage from danger.'
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
