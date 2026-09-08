import { getRuneIconUrl } from './runeIcons';

export interface RuneDefinition {
  id: number;
  name: string;
  fourWords: string; // Strictly <= 4 words describing what it is for
  details: string;   // 1-sentence mechanics description
  icon?: string;
}

export interface RuneSlot {
  slotIndex: number;
  runes: RuneDefinition[];
}

export interface RuneTree {
  id: number;
  key: string;
  name: string;
  color: string;
  accentColor: string;
  borderColor: string;
  glowColor: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  keystones: RuneDefinition[];
  slots: [RuneSlot, RuneSlot, RuneSlot]; // Tier 1, Tier 2, Tier 3
}

export interface StatShardOption {
  id: number;
  name: string;
  fourWords: string;
  type: 'offense' | 'flex' | 'defense';
  iconName: string;
}

export const RUNE_TREES: Record<string, RuneTree> = {
  Precision: {
    id: 8000,
    key: 'precision',
    name: 'Precision',
    color: '#c8aa6e',
    accentColor: '#f0e6d2',
    borderColor: 'border-amber-400',
    glowColor: 'rgba(200, 170, 110, 0.45)',
    badgeBg: 'bg-amber-100 border-amber-300',
    badgeText: 'text-amber-900',
    icon: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7201_Precision.png',
    keystones: [
      {
        id: 8005,
        name: 'Press the Attack',
        fourWords: 'Expose target for team',
        details: 'Hitting an enemy 3 times triggers bonus damage and exposes them to take more damage from all sources.'
      },
      {
        id: 8008,
        name: 'Lethal Tempo',
        fourWords: 'Stacking attack speed',
        details: 'Damaging champions stacks attack speed up to 6 times, granting on-hit damage at max stacks.'
      },
      {
        id: 8021,
        name: 'Fleet Footwork',
        fourWords: 'Sustain & move speed',
        details: 'Attacking and moving builds energy to unleash an attack that heals you and boosts movement speed.'
      },
      {
        id: 8010,
        name: 'Conqueror',
        fourWords: 'Sustained combat AD/AP ramp',
        details: 'Basic attacks and abilities grant ramping adaptive force for prolonged fights, healing at full stacks.'
      }
    ],
    slots: [
      {
        slotIndex: 0,
        runes: [
          {
            id: 9101,
            name: 'Absorb Life',
            fourWords: 'Heal on minion kills',
            details: 'Killing a target restores a portion of your maximum health.'
          },
          {
            id: 9111,
            name: 'Triumph',
            fourWords: 'Health restore on kill',
            details: 'Takedowns restore 5% missing health and grant an additional 20 gold.'
          },
          {
            id: 8009,
            name: 'Presence of Mind',
            fourWords: 'Mana restore on damage',
            details: 'Damaging an enemy restores mana or energy; takedowns restore 15% maximum resource.'
          }
        ]
      },
      {
        slotIndex: 1,
        runes: [
          {
            id: 9104,
            name: 'Legend: Alacrity',
            fourWords: 'Stacking attack speed',
            details: 'Permanently increases Attack Speed on champion, monster, and minion takedowns.'
          },
          {
            id: 9105,
            name: 'Legend: Haste',
            fourWords: 'Stacking ability haste',
            details: 'Permanently increases basic Ability Haste through Legend stacks on takedowns.'
          },
          {
            id: 9103,
            name: 'Legend: Bloodline',
            fourWords: 'Stacking lifesteal sustain',
            details: 'Permanently stacks Life Steal and bonus health upon reaching max stacks.'
          }
        ]
      },
      {
        slotIndex: 2,
        runes: [
          {
            id: 8014,
            name: 'Coup de Grace',
            fourWords: 'Finish low-health targets',
            details: 'Deal 8% increased damage to enemy champions below 40% health.'
          },
          {
            id: 8017,
            name: 'Cut Down',
            fourWords: 'Bonus damage vs tanks',
            details: 'Deal up to 11% more damage to champions with higher maximum health than you.'
          },
          {
            id: 8299,
            name: 'Last Stand',
            fourWords: 'More damage when low',
            details: 'Deal up to 11% increased damage to champions while your own health is below 60%.'
          }
        ]
      }
    ]
  },
  Domination: {
    id: 8100,
    key: 'domination',
    name: 'Domination',
    color: '#dc2626',
    accentColor: '#fca5a5',
    borderColor: 'border-rose-500',
    glowColor: 'rgba(220, 38, 38, 0.45)',
    badgeBg: 'bg-rose-100 border-rose-300',
    badgeText: 'text-rose-900',
    icon: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7200_Domination.png',
    keystones: [
      {
        id: 8112,
        name: 'Electrocute',
        fourWords: 'Burst combo damage',
        details: 'Hitting a champion with 3 separate attacks or spells within 3 seconds shocks them for lethal burst.'
      },
      {
        id: 8128,
        name: 'Dark Harvest',
        fourWords: 'Execute low-health targets',
        details: 'Damaging a champion below 50% health deals adaptive damage and reaps their soul, permanently stacking.'
      },
      {
        id: 9923,
        name: 'Hail of Blades',
        fourWords: 'Fast burst auto-attacks',
        details: 'Grants an extreme 110% attack speed buff for the first 3 basic attacks against champions.'
      }
    ],
    slots: [
      {
        slotIndex: 0,
        runes: [
          {
            id: 8126,
            name: 'Cheap Shot',
            fourWords: 'True damage to slowed',
            details: 'Damaging champions with impaired movement or actions deals bonus true damage.'
          },
          {
            id: 8139,
            name: 'Taste of Blood',
            fourWords: 'Healing on enemy hit',
            details: 'Heal when you damage an enemy champion with a brief 20-second cooldown.'
          },
          {
            id: 8143,
            name: 'Sudden Impact',
            fourWords: 'Lethality after dashes',
            details: 'Using a dash, leap, teleport, or leaving stealth grants bonus Lethality and Magic Penetration.'
          }
        ]
      },
      {
        slotIndex: 1,
        runes: [
          {
            id: 8136,
            name: 'Zombie Ward',
            fourWords: 'Bonus AD/AP from wards',
            details: 'Takedowns on enemy wards spawn a friendly Zombie Ward and grant permanent adaptive force.'
          },
          {
            id: 8120,
            name: 'Ghost Poro',
            fourWords: 'Vision & adaptive force',
            details: 'When your wards expire, they leave behind a Ghost Poro that grants vision and adaptive stats.'
          },
          {
            id: 8138,
            name: 'Eyeball Collection',
            fourWords: 'Stacking AD/AP on takedowns',
            details: 'Collect eyeballs on champion takedowns, permanently scaling your offensive damage stats.'
          }
        ]
      },
      {
        slotIndex: 2,
        runes: [
          {
            id: 8135,
            name: 'Treasure Hunter',
            fourWords: 'Bonus gold on takedowns',
            details: 'Gain additional gold the first time you get a takedown on each enemy champion.'
          },
          {
            id: 8105,
            name: 'Relentless Hunter',
            fourWords: 'Out-of-combat movement speed',
            details: 'Unique champion takedowns grant permanent out-of-combat movement speed to roam the map fast.'
          },
          {
            id: 8106,
            name: 'Ultimate Hunter',
            fourWords: 'Ultimate cooldown reduction',
            details: 'Your ultimate gains permanent ability haste per unique champion takedown.'
          }
        ]
      }
    ]
  },
  Sorcery: {
    id: 8200,
    key: 'sorcery',
    name: 'Sorcery',
    color: '#3b82f6',
    accentColor: '#93c5fd',
    borderColor: 'border-blue-500',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    badgeBg: 'bg-blue-100 border-blue-300',
    badgeText: 'text-blue-900',
    icon: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7202_Sorcery.png',
    keystones: [
      {
        id: 8214,
        name: 'Summon Aery',
        fourWords: 'Poke damage & shields',
        details: 'Your attacks and spells send Aery to damage enemies or shield allies.'
      },
      {
        id: 8229,
        name: 'Arcane Comet',
        fourWords: 'Long-range poke damage',
        details: 'Damaging a champion with an ability hurls a comet dealing adaptive damage to their position.'
      },
      {
        id: 8230,
        name: 'Phase Rush',
        fourWords: 'Burst movement speed escape',
        details: 'Hitting an enemy with 3 attacks or separate spells grants a massive surge of movement speed and slow resist.'
      }
    ],
    slots: [
      {
        slotIndex: 0,
        runes: [
          {
            id: 8224,
            name: 'Nullifying Orb',
            fourWords: 'Magic emergency shield',
            details: 'Gain a magic-damage absorbing shield when reduced below 30% health.'
          },
          {
            id: 8226,
            name: 'Manaflow Band',
            fourWords: 'Max mana & regen',
            details: 'Hitting an enemy champion with an ability permanently increases your max mana up to 250.'
          },
          {
            id: 8275,
            name: 'Nimbus Cloak',
            fourWords: 'Speed burst after summoners',
            details: 'Casting a summoner spell grants an instant burst of movement speed and ghosting for 2 seconds.'
          }
        ]
      },
      {
        slotIndex: 1,
        runes: [
          {
            id: 8210,
            name: 'Transcendence',
            fourWords: 'Ability haste & refunds',
            details: 'Gain bonus Ability Haste at levels 5 and 8; takedowns at level 11+ reduce remaining cooldowns.'
          },
          {
            id: 8234,
            name: 'Celerity',
            fourWords: 'Amplified movement speed',
            details: 'All movement speed bonuses are 7% more effective on you and grants flat move speed.'
          },
          {
            id: 8233,
            name: 'Absolute Focus',
            fourWords: 'Bonus stats when healthy',
            details: 'While above 70% health, gain bonus adaptive force (AD or AP).'
          }
        ]
      },
      {
        slotIndex: 2,
        runes: [
          {
            id: 8237,
            name: 'Scorch',
            fourWords: 'Early lane burn poke',
            details: 'Your next ability hit ignites champions, dealing bonus magic damage over 1 second.'
          },
          {
            id: 8232,
            name: 'Waterwalking',
            fourWords: 'River speed & damage',
            details: 'Gain bonus movement speed and adaptive force while in the river for dragon and baron fights.'
          },
          {
            id: 8236,
            name: 'Gathering Storm',
            fourWords: 'Endless late-game stat scaling',
            details: 'Gain escalating amounts of adaptive force every 10 minutes throughout the game.'
          }
        ]
      }
    ]
  },
  Resolve: {
    id: 8400,
    key: 'resolve',
    name: 'Resolve',
    color: '#10b981',
    accentColor: '#6ee7b7',
    borderColor: 'border-emerald-500',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    badgeBg: 'bg-emerald-100 border-emerald-300',
    badgeText: 'text-emerald-900',
    icon: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7204_Resolve.png',
    keystones: [
      {
        id: 8437,
        name: 'Grasp of the Undying',
        fourWords: 'Trading damage, max HP',
        details: 'Every 4s in combat, your next basic attack on a champion deals bonus damage, heals, and grants permanent max health.'
      },
      {
        id: 8439,
        name: 'Aftershock',
        fourWords: 'Massive resistances after CC',
        details: 'After immobilizing an enemy champion, gain huge temporary armor and magic resist, then detonate for AoE damage.'
      },
      {
        id: 8465,
        name: 'Guardian',
        fourWords: 'Protective ally dive shield',
        details: 'Guard allies near you. If either takes heavy damage, both gain a protective shield and move speed.'
      }
    ],
    slots: [
      {
        slotIndex: 0,
        runes: [
          {
            id: 8446,
            name: 'Demolish',
            fourWords: 'Massive turret plate damage',
            details: 'Charge a catastrophic strike against an enemy turret when standing within range to print plate gold.'
          },
          {
            id: 8463,
            name: 'Font of Life',
            fourWords: 'Allies heal off CC',
            details: 'Impairing enemy movement marks them; allies that damage marked enemies heal over time.'
          },
          {
            id: 8401,
            name: 'Shield Bash',
            fourWords: 'Bonus armor & attack',
            details: 'Whenever you gain a shield, gain bonus armor/MR and your next basic attack deals bonus damage.'
          }
        ]
      },
      {
        slotIndex: 1,
        runes: [
          {
            id: 8429,
            name: 'Conditioning',
            fourWords: 'Bonus mid-game resistances',
            details: 'After 12 minutes, permanently gain +8 Armor and +8 Magic Resist, plus 3% total Armor and MR.'
          },
          {
            id: 8444,
            name: 'Second Wind',
            fourWords: 'Regenerate health after poke',
            details: 'After taking damage from an enemy champion, heal back a percentage of your missing health over 10 seconds.'
          },
          {
            id: 8473,
            name: 'Bone Plating',
            fourWords: 'Block enemy burst trades',
            details: 'After taking damage from an enemy champion, the next 3 spells or attacks deal significantly less damage.'
          }
        ]
      },
      {
        slotIndex: 2,
        runes: [
          {
            id: 8451,
            name: 'Overgrowth',
            fourWords: 'Permanent max health scaling',
            details: 'Permanently gain max health for every 8 monsters or enemy minions that die near you.'
          },
          {
            id: 8453,
            name: 'Revitalize',
            fourWords: 'Stronger heals & shields',
            details: 'Heals and shields you cast or receive are 5% stronger, increasing to 10% on targets below 40% health.'
          },
          {
            id: 8242,
            name: 'Unflinching',
            fourWords: 'Tenacity & slow resist',
            details: 'Gain Tenacity and Slow Resistance to resist enemy crowd control.'
          }
        ]
      }
    ]
  },
  Inspiration: {
    id: 8300,
    key: 'inspiration',
    name: 'Inspiration',
    color: '#06b6d4',
    accentColor: '#67e8f9',
    borderColor: 'border-cyan-500',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    badgeBg: 'bg-cyan-100 border-cyan-300',
    badgeText: 'text-cyan-900',
    icon: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7203_Whimsy.png',
    keystones: [
      {
        id: 8351,
        name: 'Glacial Augment',
        fourWords: 'AoE teamfight slows',
        details: 'Immobilizing an enemy champion shoots 3 glacial rays creating severe slow zones that reduce enemy damage.'
      },
      {
        id: 8360,
        name: 'Unsealed Spellbook',
        fourWords: 'Swap summoner spells in-game',
        details: 'Swap one of your equipped Summoner Spells to a new, single-use one while out of combat.'
      },
      {
        id: 8369,
        name: 'First Strike',
        fourWords: 'Bonus gold & burst',
        details: 'Damaging an enemy champion first grants 5 gold and 8% bonus true damage for 3 seconds, granting extra gold.'
      }
    ],
    slots: [
      {
        slotIndex: 0,
        runes: [
          {
            id: 8306,
            name: 'Hextech Flashtraption',
            fourWords: 'Channel blink from bushes',
            details: 'While Flash is on cooldown, it is replaced by Hexflash, which lets you channel to blink over walls.'
          },
          {
            id: 8304,
            name: 'Magical Footwear',
            fourWords: 'Free boots with speed',
            details: 'Get free Slightly Magical Boots at 12 minutes (takedowns reduce time by 45s) with +10 extra move speed.'
          },
          {
            id: 8321,
            name: 'Cash Back',
            fourWords: 'Gold refund on items',
            details: 'Gain an instant 6% gold refund upon purchasing any Legendary item.'
          }
        ]
      },
      {
        slotIndex: 1,
        runes: [
          {
            id: 8313,
            name: 'Triple Tonic',
            fourWords: 'Free bonus stat elixirs',
            details: 'Receive 3 unique single-use elixirs at levels 3, 6, and 9 granting gold, adaptive force, and skill points.'
          },
          {
            id: 8352,
            name: 'Time Warp Tonic',
            fourWords: 'Instant potion health burst',
            details: 'Consuming a potion or biscuit instantly restores 40% of its health and grants bonus movement speed.'
          },
          {
            id: 8345,
            name: 'Biscuit Delivery',
            fourWords: 'Free lane sustain cookies',
            details: 'Delivers free biscuits every 2 minutes up to 6 minutes that restore missing health, mana, and max mana.'
          }
        ]
      },
      {
        slotIndex: 2,
        runes: [
          {
            id: 8347,
            name: 'Cosmic Insight',
            fourWords: 'Summoner & item haste',
            details: '+18 Summoner Spell Haste and +10 Item Haste to have Flash, Smite, and active items up faster.'
          },
          {
            id: 8410,
            name: 'Approach Velocity',
            fourWords: 'Run faster toward CC',
            details: 'Gain up to 15% bonus movement speed when moving toward nearby movement-impaired enemy champions.'
          },
          {
            id: 8316,
            name: 'Jack of All Trades',
            fourWords: 'Bonus stats per stat',
            details: 'Gain bonus Ability Haste and Adaptive Force for each distinct stat type gained from purchased items.'
          }
        ]
      }
    ]
  }
};

export const STAT_SHARD_ROWS: StatShardOption[][] = [
  // Slot 1: Offense
  [
    { id: 5008, name: 'Adaptive Force', fourWords: '+9 AP or 5.4 AD', type: 'offense', iconName: 'adaptive' },
    { id: 5005, name: 'Attack Speed', fourWords: '+10% Attack Speed', type: 'offense', iconName: 'attack_speed' },
    { id: 5007, name: 'Ability Haste', fourWords: '+8 Ability Haste', type: 'offense', iconName: 'ability_haste' }
  ],
  // Slot 2: Flex
  [
    { id: 5008, name: 'Adaptive Force', fourWords: '+9 AP or 5.4 AD', type: 'flex', iconName: 'adaptive' },
    { id: 5010, name: 'Movement Speed', fourWords: '+2% Movement Speed', type: 'flex', iconName: 'move_speed' },
    { id: 5001, name: 'Scaling Health', fourWords: '+10-180 HP per level', type: 'flex', iconName: 'health_scaling' }
  ],
  // Slot 3: Defense
  [
    { id: 5011, name: 'Flat Health', fourWords: '+65 Bonus Health', type: 'defense', iconName: 'health_flat' },
    { id: 5013, name: 'Tenacity', fourWords: '+10% Tenacity & Slows', type: 'defense', iconName: 'tenacity' },
    { id: 5001, name: 'Scaling Health', fourWords: '+10-180 HP per level', type: 'defense', iconName: 'health_scaling' }
  ]
];

/**
 * Looks up any rune by name across all trees.
 */
export function getRuneByName(name: string): RuneDefinition | null {
  if (!name) return null;
  const clean = name.toLowerCase().trim();

  for (const tree of Object.values(RUNE_TREES)) {
    for (const keystone of tree.keystones) {
      if (keystone.name.toLowerCase() === clean) {
        return { ...keystone, icon: getRuneIconUrl(keystone.name) || undefined };
      }
    }
    for (const slot of tree.slots) {
      for (const rune of slot.runes) {
        if (rune.name.toLowerCase() === clean) {
          return { ...rune, icon: getRuneIconUrl(rune.name) || undefined };
        }
      }
    }
  }

  // Fallback fuzzy search
  for (const tree of Object.values(RUNE_TREES)) {
    for (const keystone of tree.keystones) {
      if (keystone.name.toLowerCase().includes(clean) || clean.includes(keystone.name.toLowerCase())) {
        return { ...keystone, icon: getRuneIconUrl(keystone.name) || undefined };
      }
    }
    for (const slot of tree.slots) {
      for (const rune of slot.runes) {
        if (rune.name.toLowerCase().includes(clean) || clean.includes(rune.name.toLowerCase())) {
          return { ...rune, icon: getRuneIconUrl(rune.name) || undefined };
        }
      }
    }
  }

  return null;
}

/**
 * Returns a strictly <= 4 words description for what any rune is for.
 */
export function getRuneFourWords(name: string): string {
  const found = getRuneByName(name);
  if (found && found.fourWords) return found.fourWords;

  // Fallback heuristic if unknown
  const lower = (name || '').toLowerCase();
  if (lower.includes('speed')) return 'Bonus movement speed';
  if (lower.includes('health') || lower.includes('hp')) return 'Bonus survivability';
  if (lower.includes('mana')) return 'Bonus resource sustain';
  if (lower.includes('haste')) return 'Faster ability cooldowns';
  if (lower.includes('armor') || lower.includes('shield')) return 'Defensive damage mitigation';
  return 'Tactical combat bonus';
}
