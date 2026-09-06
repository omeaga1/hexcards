import { PivotRule } from '../types';

export const PIVOT_RULES: PivotRule[] = [
  {
    id: 'anti_heal',
    category: 'healing',
    title: 'Anti-Heal (Grievous Wounds)',
    icon: 'Droplet',
    severity: 'CRITICAL',
    triggerPrompt: 'Enemy has champions with continuous kit healing, lifesteal, or enchanter healers.',
    triggerChampions: [
      'Aatrox', 'Warwick', 'Vladimir', 'Briar', 'Soraka', 'Yuumi', 'Sylas', 
      'Swain', 'Kayn', 'DrMundo', 'Olaf', 'Volibear', 'Illaoi', 'Irelia', 'Fiora'
    ],
    generalAdvice: 'Do NOT wait for late game. Buy the 800g component (Executioner\'s / Oblivion Orb / Bramble) right after your 1st item. Finish the full item 3rd or 4th.',
    solutions: [
      {
        archetype: 'ad_carry',
        itemId: '3033',
        itemName: 'Mortal Reminder',
        componentId: '3123',
        componentName: "Executioner's Calling",
        why: 'Combines 35% Armor Pen, 25% Crit, and 40% Grievous Wounds into one slot.',
        timing: 'Buy Executioner\'s (800g) early, finish Mortal 3rd or 4th.'
      },
      {
        archetype: 'ad_fighter',
        itemId: '6609',
        itemName: 'Chempunk Chainsword',
        componentId: '3123',
        componentName: "Executioner's Calling",
        why: 'Cost-efficient AD, Health, Ability Haste, and reliable anti-heal on any physical damage.',
        timing: 'Sit on Executioner\'s; finish Chempunk 3rd.'
      },
      {
        archetype: 'ad_assassin',
        itemId: '6609',
        itemName: 'Chempunk Chainsword',
        componentId: '3123',
        componentName: "Executioner's Calling",
        why: 'Applies Grievous Wounds with abilities to prevent targets surviving your burst.',
        timing: 'Buy component if dueling heavy healers.'
      },
      {
        archetype: 'ap_mage',
        itemId: '3165',
        itemName: 'Morellonomicon',
        componentId: '3916',
        componentName: 'Oblivion Orb',
        why: 'Super cheap (2200g) AP and Magic Pen with instant AoE healing reduction on spells.',
        timing: 'Buy Oblivion Orb (800g) on second back, upgrade to Morello 3rd or 4th.'
      },
      {
        archetype: 'tank',
        itemId: '3075',
        itemName: 'Thornmail',
        componentId: '3076',
        componentName: 'Bramble Vest',
        why: 'Reflects magic damage and applies Grievous Wounds whenever enemies basic attack you.',
        timing: 'Rush Bramble Vest (800g) during laning phase vs Aatrox/Irelia/Warwick.'
      },
      {
        archetype: 'enchanter',
        itemId: '3165',
        itemName: 'Morellonomicon',
        componentId: '3916',
        componentName: 'Oblivion Orb',
        why: 'Applies Grievous Wounds easily via poke spells without ruining your gold budget.',
        timing: 'Pick up Oblivion Orb after your 1st support item.'
      }
    ]
  },
  {
    id: 'anti_tank',
    category: 'armor',
    title: 'Armor Shred & Anti-Tank (% Penetration)',
    icon: 'ShieldAlert',
    severity: 'HIGH',
    triggerPrompt: 'Enemy team has 2+ tanks or bruisers stacking Armor & Health.',
    triggerChampions: [
      'Malphite', 'Rammus', 'KSante', 'Ornn', 'Sion', 'Sejuani', 'Leona', 
      'Nautilus', 'Zac', 'ChoGath', 'Shen', 'Poppy', 'TahmKench'
    ],
    generalAdvice: 'Flat Lethality fails against armor stackers. You MUST build % Penetration by 3rd item or you will deal single-digit damage in mid-game teamfights.',
    solutions: [
      {
        archetype: 'ad_carry',
        itemId: '3036',
        itemName: "Lord Dominik's Regards",
        why: 'Grants massive 35% Armor Penetration plus crit chance. Shreds frontline tanks.',
        timing: 'Mandatory 3rd item if facing 2+ tanks.'
      },
      {
        archetype: 'ad_fighter',
        itemId: '3071',
        itemName: 'Black Cleaver',
        why: 'Carves up to 30% of target\'s total armor on repeated hits for your entire team, plus movespeed.',
        timing: 'Build as 2nd or 3rd item.'
      },
      {
        archetype: 'ad_assassin',
        itemId: '6694',
        itemName: "Serylda's Grudge",
        why: 'Converts your Lethality into Armor Penetration to pierce through defensive items.',
        timing: 'Build 3rd or 4th item.'
      },
      {
        archetype: 'ap_mage',
        itemId: '3135',
        itemName: 'Void Staff',
        why: 'Strips 40% of enemy Magic Resistance. Absolute requirement if enemies build Kaenic Rookern.',
        timing: '3rd item if enemy stacks Magic Resist.'
      }
    ]
  },
  {
    id: 'anti_burst_ap',
    category: 'burst_ap',
    title: 'Anti-Magic Burst (Fed AP Assassin / Mage)',
    icon: 'ZapOff',
    severity: 'HIGH',
    triggerPrompt: 'Enemy has a fed AP burst threat that can 100-to-0 you in a single spell combo.',
    triggerChampions: [
      'Syndra', 'Leblanc', 'Akali', 'Evelynn', 'Katarina', 'Veigar', 'Fizz', 
      'Vex', 'Viktor', 'Annie', 'Zoe', 'Diana'
    ],
    generalAdvice: 'Don\'t be greedy for pure damage if you die before casting a spell. One defensive magic shield item turns a guaranteed death into a winning fight.',
    solutions: [
      {
        archetype: 'ad_carry',
        itemId: '3156',
        itemName: 'Maw of Malmortius',
        componentId: '3155',
        componentName: 'Hexdrinker',
        why: 'Grants a massive Lifeline magic shield that activates on lethal AP damage + 10% lifesteal.',
        timing: 'Sit on Hexdrinker (1300g) after 1st/2nd core item.'
      },
      {
        archetype: 'ad_fighter',
        itemId: '3156',
        itemName: 'Maw of Malmortius',
        why: 'High AD, Ability Haste, Magic Resist, and huge magic shield to survive dive combos.',
        timing: '3rd item against AP heavy teams.'
      },
      {
        archetype: 'tank',
        itemId: '2504',
        itemName: 'Kaenic Rookern',
        why: 'The ultimate anti-mage item: gives an automatic 400–800 HP magic shield that refreshes every 12s.',
        timing: 'Build 2nd or 3rd item vs AP threats.'
      },
      {
        archetype: 'ap_mage',
        itemId: '3102',
        itemName: "Banshee's Veil",
        componentId: '4632',
        componentName: 'Verdant Barrier',
        why: 'Gives 120 AP plus an automatic Spell Shield to block the enemy opener (e.g. Fizz R or Veigar E).',
        timing: '3rd or 4th item.'
      }
    ]
  },
  {
    id: 'anti_burst_ad',
    category: 'burst_ad',
    title: 'Anti-Physical Assassin (Fed AD Diver / Assassin)',
    icon: 'Sword',
    severity: 'HIGH',
    triggerPrompt: 'Enemy has a fed AD assassin or diver diving the backline.',
    triggerChampions: [
      'Zed', 'Talon', 'Rengar', 'Khazix', 'Qiyana', 'Naafiri', 'Nocturne', 
      'Kayn', 'MasterYi', 'Draven', 'Samira'
    ],
    generalAdvice: 'Swap offensive boots to Plated Steelcaps early! Steelcaps alone reduces incoming basic attack damage by 12%.',
    solutions: [
      {
        archetype: 'ap_mage',
        itemId: '3157',
        itemName: "Zhonya's Hourglass",
        componentId: '3191',
        componentName: "Seeker's Armguard",
        why: '2.5 seconds of golden invulnerability completely wastes Zed ult, Talon burst, or Rengar leap.',
        timing: 'Build 2nd or 3rd item; sit on Seeker\'s Armguard for early armor.'
      },
      {
        archetype: 'ad_carry',
        itemId: '3026',
        itemName: 'Guardian Angel',
        why: 'Armor plus a full revive on lethal damage. Makes enemy assassins hesitate to dive you.',
        timing: 'Build as 4th or 5th item.'
      },
      {
        archetype: 'ad_fighter',
        itemId: '6333',
        itemName: "Death's Dance",
        why: 'Converts 30% of all incoming physical burst into a non-lethal bleed over 3 seconds, cleansed on takedown.',
        timing: 'Build 2nd or 3rd item.'
      },
      {
        archetype: 'tank',
        itemId: '3110',
        itemName: 'Frozen Heart',
        componentId: '3082',
        componentName: "Warden's Mail",
        why: 'Aura reduces nearby enemies\' attack speed by 20% and flatly reduces damage per hit.',
        timing: 'Cheap 2nd item vs heavy AD.'
      }
    ]
  },
  {
    id: 'anti_suppression',
    category: 'hard_cc',
    title: 'Anti-Suppression & Chain CC (QSS / Cleanses)',
    icon: 'Lock',
    severity: 'CRITICAL',
    triggerPrompt: 'Enemy has un-cleansable Suppression or game-ending lockdown CC.',
    triggerChampions: [
      'Malzahar', 'Warwick', 'Skarner', 'Mordekaiser', 'Morgana', 'Ashe', 
      'Lissandra', 'Amumu', 'Leona'
    ],
    generalAdvice: 'Summoner Cleanse DOES NOT work against Suppression (Malzahar R, Warwick R, Skarner R) or Mordekaiser Death Realm. Only Quicksilver Sash (QSS) works.',
    solutions: [
      {
        archetype: 'ad_carry',
        itemId: '3139',
        itemName: 'Mercurial Scimitar',
        componentId: '3140',
        componentName: 'Quicksilver Sash (QSS)',
        why: 'Active instantly breaks any CC including Suppression, granting 50% movespeed for 1.5s.',
        timing: 'Buy QSS component (1300g) right after 2nd item! Do not wait.'
      },
      {
        archetype: 'ad_fighter',
        itemId: '3140',
        itemName: 'Quicksilver Sash',
        why: 'Prevents you being pinned down and focus-fired during your engagement.',
        timing: 'Buy component around 20-minute baron fights.'
      },
      {
        archetype: 'tank',
        itemId: '3111',
        itemName: "Mercury's Treads",
        why: 'Provides 30% Tenacity to shrug off chain stuns and roots.',
        timing: 'Upgrade boots as early as level 6-8.'
      }
    ]
  },
  {
    id: 'anti_shield',
    category: 'shields',
    title: 'Anti-Shield (Shield Reave)',
    icon: 'ShieldOff',
    severity: 'SITUATIONAL',
    triggerPrompt: 'Enemy team relies on massive defensive shields (support shields, Sterak\'s, Tahm grey health).',
    triggerChampions: [
      'Sett', 'TahmKench', 'Karma', 'Lulu', 'Shen', 'Janna', 'Sion', 
      'Ivern', 'Sona', 'Riven'
    ],
    generalAdvice: 'If Sett W or Tahm Kench keeps surviving with a 1,500 HP shield, one AD champion with Serpent\'s Fang halves that shield instantly.',
    solutions: [
      {
        archetype: 'ad_assassin',
        itemId: '6695',
        itemName: "Serpent's Fang",
        why: 'Reduces shields gained by 50% and instantly breaks existing shields on physical damage.',
        timing: 'Build 2nd or 3rd item vs shield-heavy comps.'
      },
      {
        archetype: 'ad_carry',
        itemId: '6695',
        itemName: "Serpent's Fang",
        why: 'Extremely cheap (2500g) answer when Sett or Lulu shields are making targets unkillable.',
        timing: 'Situational 4th item.'
      },
      {
        archetype: 'ad_fighter',
        itemId: '6695',
        itemName: "Serpent's Fang",
        why: 'Allows you to execute bruisers through their Sterak\'s Gage shield.',
        timing: '3rd or 4th item.'
      }
    ]
  }
];

export const BOOTS_GUIDE = [
  {
    id: '3047',
    name: 'Plated Steelcaps',
    cost: 1100,
    tags: ['Armor', 'Basic Attack Damage Reduction'],
    whenToBuy: 'Enemy has 3+ AD champions, or the enemy ADC / Yasuo / Yone / Master Yi / Tryndamere is fed. Reduces all basic attack damage taken by 12%!'
  },
  {
    id: '3111',
    name: "Mercury's Treads",
    cost: 1100,
    tags: ['Magic Resist', 'Tenacity'],
    whenToBuy: 'Enemy has dangerous chain crowd control (Morgana root, Lux Q, Leona stuns, Veigar cage) AND significant magic damage. Does NOT reduce knockups!'
  },
  {
    id: '3009',
    name: 'Boots of Swiftness',
    cost: 900,
    tags: ['Move Speed', 'Slow Resist'],
    whenToBuy: 'Enemy has continuous slowing fields (Ashe, Nasus Wither, Singed, Rylai mages) and you need high base movement speed to reposition.'
  },
  {
    id: '3158',
    name: 'Ionian Boots of Lucidity',
    cost: 900,
    tags: ['Ability Haste', 'Summoner Spell Haste'],
    whenToBuy: 'Cheap early spike (900g). Gives Ability Haste and lowers Flash / Teleport / Ignite cooldowns by 12%. Ideal for spell-weaving casters and supports.'
  },
  {
    id: '3006',
    name: "Berserker's Greaves",
    cost: 1100,
    tags: ['Attack Speed'],
    whenToBuy: 'Standard aggressive marksman boots for maximum sustained DPS when not under heavy threat of being one-shot.'
  },
  {
    id: '3020',
    name: "Sorcerer's Shoes",
    cost: 1100,
    tags: ['Magic Penetration'],
    whenToBuy: 'Flat 18 Magic Penetration. Essential for burst mages to maximize damage against squishy champions with low base Magic Resist.'
  }
];
