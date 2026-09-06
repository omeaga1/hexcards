import { TacticalGuide } from '../types';

export interface PivotSwapRule {
  threatId: string;
  threatLabel: string;
  threatIcon?: string;
  threatColor: string;
  triggerChamps: string;
  standardItem: {
    name: string;
    id?: string;
    slot: string;
  };
  replacementItem: {
    name: string;
    id: string;
    cost: number;
  };
  earlyComponent?: {
    name: string;
    id: string;
    cost: number;
    buyWindow: string;
  };
  bootsSwap?: {
    from: string;
    to: string;
    why: string;
  };
  swapRationale: string;
}

export function getPivotSwapsForChampion(tactics: TacticalGuide): PivotSwapRule[] {
  const isSupport = tactics.role === 'Support';
  const isADC = tactics.role === 'ADC';
  const isMage = !isSupport && tactics.damageType === 'Magic Heavy';
  const isTank = tactics.playstyle === 'Teamfight Tank';
  const isBruiser = !isADC && !isMage && !isTank && !isSupport;

  if (isSupport) {
    const alreadyHasLocket = tactics.coreBuild.firstItem.itemId === '3190' || tactics.coreBuild.secondItem.itemId === '3190';
    const alreadyHasVow = tactics.coreBuild.secondItem.itemId === '3109' || tactics.coreBuild.thirdItem.itemId === '3109';

    return [
      {
        threatId: 'healing',
        threatLabel: 'Heavy Healing Threat',
        threatColor: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
        triggerChamps: 'Aatrox, Warwick, Vlad, Soraka, Briar, Yuumi',
        standardItem: {
          name: '2nd/3rd Aura Item (Redemption / Zeke\'s)',
          id: '3107',
          slot: 'Slot 2 or 3'
        },
        replacementItem: {
          name: 'Thornmail / Morellonomicon',
          id: tactics.damageType === 'Magic Heavy' ? '3165' : '3075',
          cost: tactics.damageType === 'Magic Heavy' ? 2200 : 2700
        },
        earlyComponent: {
          name: tactics.damageType === 'Magic Heavy' ? 'Oblivion Orb' : 'Bramble Vest',
          id: tactics.damageType === 'Magic Heavy' ? '3916' : '3076',
          cost: 800,
          buyWindow: 'Buy on 1st or 2nd back (800g), sit on it for the whole laning phase!'
        },
        swapRationale: 'Grievous Wounds cuts 40% enemy healing. Sitting on the 800g component early neutralizes enemy sustain supports and lifesteal carries.'
      },
      {
        threatId: 'hard_cc',
        threatLabel: 'Chain Crowd Control on Carry',
        threatColor: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
        triggerChamps: 'Ashe, Leona, Nautilus, Morgana, Sejuani, Amumu',
        standardItem: {
          name: '2nd Core Item (Zeke\'s Convergence)',
          id: '3050',
          slot: 'Slot 2'
        },
        replacementItem: {
          name: "Mikael's Blessing",
          id: '3222',
          cost: 2300
        },
        earlyComponent: {
          name: 'Chalice of Blessing',
          id: '3012',
          cost: 900,
          buyWindow: 'Rush after Boots when facing point-and-click stun picks'
        },
        bootsSwap: {
          from: tactics.coreBuild.bootsRecommendation.defaultName,
          to: "Mercury's Treads",
          why: 'Tenacity keeps you mobile so you can reactively cleanse your carry.'
        },
        swapRationale: 'Active cleanses all crowd control (stuns, roots, silences) from an ally carry and heals them for 100–180 HP, saving them from pickoffs.'
      },
      {
        threatId: 'burst_ad',
        threatLabel: 'Fed AD Assassin Diving Your Carry',
        threatColor: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
        triggerChamps: 'Zed, Talon, Rengar, Kha\'Zix, Nocturne',
        standardItem: alreadyHasVow ? {
          name: "2nd Core Item (Zeke's Convergence)",
          id: '3050',
          slot: 'Slot 2'
        } : {
          name: 'Offensive Support Slot (Shurelya\'s)',
          id: '2065',
          slot: 'Slot 2 or 3'
        },
        replacementItem: alreadyHasVow ? {
          name: 'Frozen Heart',
          id: '3110',
          cost: 2500
        } : {
          name: "Knight's Vow",
          id: '3109',
          cost: 2200
        },
        earlyComponent: {
          name: alreadyHasVow ? "Warden's Mail" : 'Chain Vest',
          id: alreadyHasVow ? '3082' : '1031',
          cost: alreadyHasVow ? 1000 : 800,
          buyWindow: 'Buy early armor before dragon fights'
        },
        bootsSwap: {
          from: tactics.coreBuild.bootsRecommendation.defaultName,
          to: 'Plated Steelcaps',
          why: 'Steelcaps flatly reduces 12% of incoming basic attacks.'
        },
        swapRationale: alreadyHasVow
          ? 'You already build Knight\'s Vow! Replace Zeke\'s with Frozen Heart to cripple assassin and diver attack speed and survive physical burst.'
          : 'Designate your carry as Worthy Ally: you absorb 12% of damage dealt to them and heal from their damage, neutralizing assassin burst.'
      },
      {
        threatId: 'burst_ap',
        threatLabel: 'Fed AP Burst / AoE Magic Threat',
        threatColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
        triggerChamps: 'Karthus, Brand, Syndra, Evelynn, Kennen',
        standardItem: alreadyHasLocket ? {
          name: "3rd Item Slot (Knight's Vow)",
          id: '3109',
          slot: 'Slot 3'
        } : {
          name: 'Late Support Slot (Redemption)',
          id: '3107',
          slot: 'Slot 3 or 4'
        },
        replacementItem: alreadyHasLocket ? {
          name: 'Kaenic Rookern',
          id: '2504',
          cost: 2900
        } : {
          name: 'Locket of the Iron Solari / Kaenic Rookern',
          id: '3190',
          cost: 2200
        },
        earlyComponent: {
          name: 'Negatron Cloak',
          id: '1057',
          cost: 900,
          buyWindow: 'Sit on early magic resistance'
        },
        swapRationale: alreadyHasLocket
          ? 'You already rush Locket 1st! Against fed AP threats, replace Knight\'s Vow with Kaenic Rookern for an automatic regenerating magic shield.'
          : 'Locket provides an instant 200–360 team-wide shield against AoE burst spells like Karthus R, Kennen R, or Brand R.'
      }
    ];
  }

  if (isADC) {
    return [
      {
        threatId: 'healing',
        threatLabel: 'Heavy Healing Threat',
        threatColor: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
        triggerChamps: 'Aatrox, Warwick, Vlad, Soraka, Briar, Yuumi',
        standardItem: {
          name: "Lord Dominik's Regards",
          id: '3036',
          slot: 'Slot 4 (Anti-Tank Item)'
        },
        replacementItem: {
          name: 'Mortal Reminder',
          id: '3033',
          cost: 3000
        },
        earlyComponent: {
          name: "Executioner's Calling",
          id: '3123',
          cost: 800,
          buyWindow: 'Buy after 1st Core (Kraken/Yun Tal), sit on it in inventory!'
        },
        swapRationale: 'Both items provide 35% Armor Penetration. By choosing Mortal Reminder instead of Lord Dom\'s, you lose 0 anti-tank shred while adding 40% Grievous Wounds to delete their healing.'
      },
      {
        threatId: 'burst_ap',
        threatLabel: 'Fed AP Assassin / Burst Mage',
        threatColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
        triggerChamps: 'Syndra, Akali, LeBlanc, Evelynn, Katarina',
        standardItem: {
          name: 'Offensive Slot (Bloodthirster)',
          id: '3072',
          slot: 'Slot 4 or 5'
        },
        replacementItem: {
          name: 'Maw of Malmortius',
          id: '3156',
          cost: 3100
        },
        earlyComponent: {
          name: 'Hexdrinker',
          id: '3155',
          cost: 1300,
          buyWindow: 'Buy after 2nd Core if AP assassin is 3+ kills ahead'
        },
        bootsSwap: {
          from: "Berserker's Greaves",
          to: "Mercury's Treads",
          why: 'Swap to Merc Treads if enemy team has 2+ AP threats and dangerous magic roots/stuns.'
        },
        swapRationale: 'Grants an automatic 400–800 magic damage shield on lethal burst. Turns a guaranteed one-shot combo into a survivable fight.'
      },
      {
        threatId: 'burst_ad',
        threatLabel: 'Fed AD Assassin / Dive',
        threatColor: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
        triggerChamps: 'Zed, Talon, Rengar, Kha\'Zix, Nocturne',
        standardItem: {
          name: 'Late Damage Item (Rapid Firecannon)',
          id: '3094',
          slot: 'Slot 4 or 5'
        },
        replacementItem: {
          name: 'Guardian Angel',
          id: '3026',
          cost: 3200
        },
        bootsSwap: {
          from: "Berserker's Greaves",
          to: 'Plated Steelcaps',
          why: 'Steelcaps flatly reduces 12% of all incoming basic attack damage!'
        },
        swapRationale: 'Gives 40 Armor plus a full revive. Enemy assassins waste their entire ultimate cooldown on you, leaving them vulnerable to your team.'
      },
      {
        threatId: 'hard_cc',
        threatLabel: 'Suppression & Chain Lockdown',
        threatColor: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
        triggerChamps: 'Malzahar, Warwick, Skarner, Mordekaiser',
        standardItem: {
          name: '5th Item Slot (Bloodthirster)',
          id: '3072',
          slot: 'Slot 5'
        },
        replacementItem: {
          name: 'Mercurial Scimitar',
          id: '3139',
          cost: 3200
        },
        earlyComponent: {
          name: 'Quicksilver Sash (QSS)',
          id: '3140',
          cost: 1300,
          buyWindow: 'Buy immediately when Malzahar / Warwick hits level 6-9'
        },
        swapRationale: 'Summoner Cleanse DOES NOT work on Suppression! Only QSS lets you break Malzahar R or Warwick R.'
      }
    ];
  }

  if (isMage) {
    return [
      {
        threatId: 'burst_ad',
        threatLabel: 'Fed AD Assassin / Dive',
        threatColor: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
        triggerChamps: 'Zed, Talon, Yasuo, Yone, Naafiri',
        standardItem: {
          name: '2nd Offensive Item (Shadowflame)',
          id: '4645',
          slot: 'Slot 2'
        },
        replacementItem: {
          name: "Zhonya's Hourglass",
          id: '3157',
          cost: 3250
        },
        earlyComponent: {
          name: "Seeker's Armguard",
          id: '3191',
          cost: 1600,
          buyWindow: 'Rush on first or second back (gives early armor + stasis)'
        },
        bootsSwap: {
          from: "Sorcerer's Shoes",
          to: 'Plated Steelcaps',
          why: 'If enemy is full AD team comp'
        },
        swapRationale: 'Do not wait for 3rd item! Rush Seeker\'s / Zhonya\'s 2nd. The 2.5s Golden Stasis completely nullifies Zed ult or Talon burst.'
      },
      {
        threatId: 'healing',
        threatLabel: 'Heavy Healing Threat',
        threatColor: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
        triggerChamps: 'Aatrox, Vlad, Soraka, Sylas, Swain',
        standardItem: {
          name: 'Late AP Item (Stormsurge)',
          id: '4646',
          slot: 'Slot 3 or 4'
        },
        replacementItem: {
          name: 'Morellonomicon',
          id: '3165',
          cost: 2200
        },
        earlyComponent: {
          name: 'Oblivion Orb',
          id: '3916',
          cost: 800,
          buyWindow: 'Buy for 800g right after your 1st mana item'
        },
        swapRationale: 'Oblivion Orb gives early 40% anti-heal on any AoE spell for only 800g. Upgrade to Morello later for Magic Pen.'
      },
      {
        threatId: 'magic_resist',
        threatLabel: 'Enemies Stacking Magic Resist',
        threatColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
        triggerChamps: 'Kaenic Rookern, Force of Nature, Galio',
        standardItem: {
          name: 'Flat Pen Item (Shadowflame)',
          id: '4645',
          slot: 'Slot 3'
        },
        replacementItem: {
          name: 'Void Staff / Cryptbloom',
          id: '3135',
          cost: 3000
        },
        swapRationale: 'Flat Magic Pen (Sorcs/Shadowflame) is useless against 150+ MR. You MUST replace your 3rd item with Void Staff (40% % Pen) or deal zero damage.'
      }
    ];
  }

  // Default: Bruisers / Fighters (Darius, Garen, Warwick, Sett, etc.)
  return [
    {
      threatId: 'burst_ap',
      threatLabel: 'Fed AP Magic Threat',
      threatColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
      triggerChamps: 'Syndra, Akali, Evelynn, Gwen, Mordekaiser',
      standardItem: {
        name: "Death's Dance (Armor Item)",
        id: '6333',
        slot: 'Slot 3'
      },
      replacementItem: {
        name: 'Kaenic Rookern / Maw',
        id: '2504',
        cost: 2900
      },
      bootsSwap: {
        from: 'Plated Steelcaps',
        to: "Mercury's Treads",
        why: 'Mandatory swap for +25 Magic Resist and 30% Tenacity vs AP cc'
      },
      swapRationale: 'If enemy AP is fed, Death\'s Dance armor is wasted. Swap Death\'s Dance for Kaenic Rookern (magic shield) or Maw of Malmortius.'
    },
    {
      threatId: 'healing',
      threatLabel: 'Heavy Healing Duels',
      threatColor: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
      triggerChamps: 'Aatrox, Warwick, Vlad, Briar, Fiora, Irelia',
      standardItem: {
        name: 'Dead Man\'s Plate (Armor Slot)',
        id: '3742',
        slot: 'Slot 4'
      },
      replacementItem: {
        name: 'Chempunk Chainsword / Thornmail',
        id: '6609',
        cost: 3000
      },
      earlyComponent: {
        name: "Executioner's (or Bramble Vest)",
        id: '3123',
        cost: 800,
        buyWindow: 'Buy 800g component on first recall vs Aatrox/Warwick!'
      },
      swapRationale: 'Rush the 800g component in laning phase. Replace your 4th item with Chempunk Chainsword (AD) or Thornmail (Armor) so they cannot out-sustain you.'
    },
    {
      threatId: 'armor',
      threatLabel: '2+ Armor Stacking Tanks',
      threatColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
      triggerChamps: 'Malphite, Ornn, Rammus, K\'Sante, Sion',
      standardItem: {
        name: 'Sterak\'s Gage (HP/AD Slot)',
        id: '3053',
        slot: 'Slot 2 or 3'
      },
      replacementItem: {
        name: 'Black Cleaver',
        id: '3071',
        cost: 3000
      },
      swapRationale: 'Black Cleaver carves 30% of total enemy armor on repeated hits for your entire team. Essential when enemy frontliners stack 250+ armor.'
    }
  ];
}
