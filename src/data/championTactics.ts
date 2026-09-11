import { TacticalGuide, RuneKitGuide } from '../types';
import { getMetaBuildForChampion } from '../services/metaBuildService';
import { synthesizeItemRationale } from './itemEssence';
import { getRuneByName, getRuneFourWords } from './runeTrees';

export const CHAMPION_TACTICS: Record<string, TacticalGuide> = {
  // === TOP LANERS ===
  Darius: {
    championId: 'Darius',
    role: 'Top',
    damageType: 'Physical Heavy',
    playstyle: 'Lane Bully',
    identity: 'Terrifying lane juggernaut who dominates extended melee brawls, builds up 5 bleed stacks, and resets his true-damage execute.',
    winCondition: 'Crush your lane opponent, force rift herald fights, and look for an early Noxian Might reset in teamfights to dunk the entire enemy squad.',
    powerSpikes: ['Level 1 Cheese (W or Q brawl)', 'Level 3 All-in with Ghost', 'Level 6 Dunk Spike', '1-Item Trinity Force / Stridebreaker'],
    skillMaxOrder: 'Q > E > W',
    skillMaxReason: 'Max Q first for waveclear, damage, and fat missing-health healing on blade hits. Max E second to lower pull cooldown and gain passive % Armor Penetration.',
    combos: [
      {
        name: 'Standard Trading',
        sequence: ['Auto Attack', 'W (Auto Reset)', 'Q (Blade Hit)', 'Auto Attack'],
        tip: 'Always tap W immediately after an auto attack lands to instantly cancel the animation and slow them so Q blade is guaranteed to hit.'
      },
      {
        name: 'Full Noxian Might All-In',
        sequence: ['Ghost', 'Auto', 'W', 'Auto', 'Q', 'E (Pull when they flee)', 'Auto', 'R (5 Stacks)'],
        tip: 'Save your E (Apprehend) for when they try to Flash or dash away, not as your opener!'
      }
    ],
    plainAbilities: {
      passive: {
        tldr: 'Attacks and blade abilities cause enemies to bleed physical damage for 5 seconds (up to 5 stacks). At 5 stacks, Darius gains massive bonus AD and his attacks instantly apply max stacks.',
        whenToUse: 'Keep trading as long as possible in extended fights to trigger Noxian Might (the blood rage). Once active, you out-damage almost any champion in the game.'
      },
      q: {
        tldr: 'Swings his axe in a circle. Enemies hit by the OUTER BLADE take full damage and heal Darius for missing health. Enemies hit by the inner handle take minimal damage and do NOT heal.',
        whenToUse: 'Always space yourself so the edge of the circle hits. Use it to heal back to full in trades, or cast it while moving during a W slow.'
      },
      w: {
        tldr: 'Empowers his next basic attack to deal bonus physical damage and heavily slow the target by 90% for 1 second. Resets attack animation.',
        whenToUse: 'Press W right after a normal auto attack connects. The 90% slow makes landing the sweet-spot Q effortless.'
      },
      e: {
        tldr: 'Passive: Grants permanent % Armor Penetration. Active: Pulls all enemies in a cone toward Darius and slows them briefly.',
        whenToUse: 'DO NOT open fights with this if you can walk up with Ghost. Save E to hook them back when they try to disengage, or to interrupt enemy dashes/channels.'
      },
      r: {
        tldr: 'Leaps and delivers a lethal strike dealing TRUE DAMAGE that increases by 20% per bleed stack (doubled at 5 stacks). If it kills the target, it resets its cooldown!',
        whenToUse: 'Only press R when the target has 5 bleed stacks or is low enough to execute. Getting the reset is how you win 1v2 and 1v3 fights.'
      }
    },
    coreBuild: {
      starter: "Doran's Blade + Health Potion",
      firstItem: {
        itemId: '6631',
        name: 'Stridebreaker',
        why: 'Gives movespeed on hit plus an active AoE slow to eliminate your biggest weakness: getting kite-killed.',
        order: 1
      },
      secondItem: {
        itemId: '3053',
        name: "Sterak's Gage",
        why: 'High bonus AD plus a massive Lifeline shield when bursted below 30% health, letting you finish 5 stacks.',
        order: 2
      },
      thirdItem: {
        itemId: '6333',
        name: "Death's Dance",
        why: 'Converts burst into a bleed and gives huge health cleanses on kills during teamfight dunks.',
        order: 3
      },
      bootsRecommendation: {
        defaultId: '3047',
        defaultName: 'Plated Steelcaps',
        why: 'Dominates physical top lane trades. Switch to Merc Treads only against heavy AP/CC.',
        alternative: "Mercury's Treads vs heavy CC"
      }
    },
    runeKit: {
      primaryTree: 'Precision',
      keystone: {
        name: 'Conqueror',
        tldr: 'Attacks and spells grant stacking Attack Damage (up to 12 stacks). At full stacks, heals for 8% of damage dealt.',
        why: 'Darius stacks Conqueror fast with his bleed and auto resets, giving him ramp-up AD and healing in long brawls.'
      },
      primaryMinors: [
        {
          name: 'Triumph',
          slot: 'Slot 1',
          effect: 'Takedowns restore 10% missing health and grant 20 gold. Crucial for surviving 1v2 ganks and teamfight resets.'
        },
        {
          name: 'Legend: Alacrity',
          slot: 'Slot 2',
          effect: 'Grants permanent attack speed as you score kills and farm minions, making your 5-stack bleed ramp much faster.'
        },
        {
          name: 'Last Stand',
          slot: 'Slot 3',
          effect: 'Deal up to 11% bonus damage to champions while you are below 60% health. Synergizes when you are low and dunking with R.'
        }
      ],
      secondaryTree: 'Resolve',
      secondaryMinors: [
        {
          name: 'Bone Plating',
          effect: 'After taking damage, the next 3 spells or attacks from that champion deal 30–60 less damage. Blocks early all-in burst.'
        },
        {
          name: 'Unflinching',
          effect: 'Grants bonus Armor and Magic Resist when impaired by slow or crowd control, keeping you alive in teamfights.'
        }
      ],
      swapRule: {
        trigger: 'Facing ranged poke champions (Teemo, Quinn, Kennen, Jayce)',
        take: 'Second Wind',
        insteadOf: 'Bone Plating',
        why: 'Bone Plating is wasted on 1 auto-attack from range, while Second Wind continuously regenerates health every time you take poke!'
      },
      statShards: '+8 Adaptive Force • +2% Movement Speed • +65 Health'
    }
  },

  Garen: {
    championId: 'Garen',
    role: 'Top',
    damageType: 'Physical Heavy',
    playstyle: 'Skirmisher',
    identity: 'Straightforward, resilient fighter with built-in sustain, a silence, crowd control resistance, and a true-damage execute.',
    winCondition: 'Safely farm until level 6, chunk opponents with Q-E trades, and split-push side lanes with extreme waveclear speed and safety.',
    powerSpikes: ['Level 6 True Damage Ult', 'Berserker Greaves Rush', '1-Item Stridebreaker', 'Level 11 Passive Regen'],
    skillMaxOrder: 'E > Q > W',
    skillMaxReason: 'Max E first for fast waveclear and armor shredding. Max Q second for longer silence and movespeed.',
    combos: [
      {
        name: 'Standard Bread & Butter',
        sequence: ['Q (Speed up & Silence)', 'E (Spin on them)', 'Ignite / R (Execute)'],
        tip: 'Q silences them so they cannot flash or use defensive shields while your E shreds their armor!'
      }
    ],
    plainAbilities: {
      passive: {
        tldr: 'If Garen has not taken champion or turret damage for a few seconds, he rapidly regenerates % max health every second.',
        whenToUse: 'Take short trades, then back off behind your minions and let your passive heal you to full while the opponent stays low.'
      },
      q: {
        tldr: 'Breaks all existing slows on Garen, grants a burst of movement speed, and empowers the next attack to deal bonus damage and SILENCE the target.',
        whenToUse: 'Use to cleanse an enemy slow (e.g. Nasus wither or Ashe arrow), or to prevent mages/assassins from pressing their combo.'
      },
      w: {
        tldr: 'Passive: Grants bonus Armor and MR as you kill minions. Active: Grants a shield, 30% damage reduction, and 60% Tenacity for 0.75 seconds.',
        whenToUse: 'Press W right as incoming burst damage or a heavy stun hits you to shrug it off with the damage reduction.'
      },
      e: {
        tldr: 'Spins rapidly for 3 seconds dealing physical damage. Nearest enemy takes 25% bonus damage. After 6 spins, shreds enemy Armor by 25% for 6 seconds.',
        whenToUse: 'Primary damage and waveclear. Spin inside the enemy wave to instantly delete caster minions, or stick to the champion after silencing with Q.'
      },
      r: {
        tldr: 'Calls down the blade of Demacia, dealing flat true damage PLUS up to 35% of the target\'s missing health.',
        whenToUse: 'Execute spell. Never use this when the enemy is full health. Wait until their HP bar turns into the execute threshold.'
      }
    },
    coreBuild: {
      starter: "Doran's Shield + Health Potion",
      firstItem: {
        itemId: '6631',
        name: 'Stridebreaker',
        why: 'Gives the vital AoE slow and stats to stick to slippery targets during your E spin.',
        order: 1
      },
      secondItem: {
        itemId: '3078',
        name: 'Trinity Force',
        why: 'Massive single-target burst on Q, tower demolition, and continuous movement speed.',
        order: 2
      },
      thirdItem: {
        itemId: '3033',
        name: 'Mortal Reminder',
        why: 'Gives % Armor Pen, crit for faster E spins, and 40% Grievous Wounds.',
        order: 3
      },
      bootsRecommendation: {
        defaultId: '3006',
        defaultName: "Berserker's Greaves",
        why: "Garen's E spin count scales directly with attack speed from items/boots! Berserker Greaves is a huge early damage spike.",
        alternative: 'Plated Steelcaps if desperately needing armor'
      }
    },
    runeKit: {
      primaryTree: 'Sorcery',
      keystone: {
        name: 'Phase Rush',
        tldr: 'Hitting an enemy with 3 separate attacks or spells grants 50% movement speed and 75% Slow Resistance for 3 seconds.',
        why: 'Garen Q -> E -> Stridebreaker proc triggers Phase Rush instantly, allowing him to trade and disengage with zero counter-play.'
      },
      primaryMinors: [
        {
          name: 'Nimbus Cloak',
          slot: 'Slot 1',
          effect: 'Casting a Summoner Spell (Flash or Ignite) grants a burst of movement speed and allows you to ghost through minions.'
        },
        {
          name: 'Celerity',
          slot: 'Slot 2',
          effect: 'All movement speed bonuses (Q, Phase Rush, Stridebreaker) are 7% more effective and grant bonus attack damage.'
        },
        {
          name: 'Gathering Storm',
          slot: 'Slot 3',
          effect: 'Gains escalating bonus Attack Damage every 10 minutes, giving Garen free late-game scaling.'
        }
      ],
      secondaryTree: 'Resolve',
      secondaryMinors: [
        {
          name: 'Second Wind',
          effect: 'Regenerates 4% of missing health over 10 seconds whenever you take champion damage. Perfect with Garen passive.'
        },
        {
          name: 'Overgrowth',
          effect: 'Gain permanent maximum health whenever nearby minions die, amplifying your W shield and tankiness.'
        }
      ],
      swapRule: {
        trigger: 'Facing immovable melee tanks (Malphite, Ornn, Sion, Shen)',
        take: 'Conqueror',
        insteadOf: 'Phase Rush',
        why: 'Tanks cannot kite you, so you do not need Phase Rush speed; Conqueror provides pure brawling power and sustain!'
      },
      statShards: '+8 Adaptive Force • +2% Movement Speed • +65 Health'
    }
  },

  // === ADC / BOT LANERS ===
  Jinx: {
    championId: 'Jinx',
    role: 'ADC',
    damageType: 'Physical Heavy',
    playstyle: 'Hypercarry',
    identity: 'Late-game artillery marksman who switches between a fast close-range minigun and long-range splash rockets, resetting movespeed on takedowns.',
    winCondition: 'Farm safely, hit your 2-3 item crit spikes, stay behind your frontline, and get one takedown to trigger "Get Excited!" to snowball the teamfight.',
    powerSpikes: ['1-Item Kraken Slayer / Yun Tal', '2-Item Runaan / Infinity Edge', '3-Item 75% Crit Hypercarry Mode'],
    skillMaxOrder: 'Q > W > E',
    skillMaxReason: 'Max Q first to increase rocket range and minigun attack speed bonus. Max W second for poke and slow.',
    combos: [
      {
        name: 'CC Layer Trap',
        sequence: ['Ally Stun/Hook lands', 'E (Flame Chompers directly beneath them)', 'W (Zap)', 'Q (Rockets AOE)'],
        tip: 'Never throw E randomly into an open field. Wait for an ally hook/root, or throw it at choke points when enemies chase you.'
      }
    ],
    plainAbilities: {
      passive: {
        tldr: 'Whenever an enemy champion, turret, or epic monster you damaged within 3 seconds dies, Jinx gains a massive 175% decaying move speed burst and bonus attack speed.',
        whenToUse: 'This is your teamfight superpower. Once you get one assist or kill, use the crazy speed to kite around enemies and clean up.'
      },
      q: {
        tldr: 'Toggles between Pow-Pow (Minigun: stacks attack speed up to 130%) and Fishbones (Rocket Launcher: attacks cost mana, deal 110% AoE damage, and gain up to 200 bonus range).',
        whenToUse: 'Use Minigun for towers, isolated targets in melee range, and farming under tower. Use Rockets in teamfights to stay at safe maximum range and hit grouped enemies.'
      },
      w: {
        tldr: 'Fires a shock blast in a line that reveals the first enemy hit, deals heavy physical damage, and slows them by up to 70% for 2 seconds.',
        whenToUse: 'Use to check unwarded bushes, slow down fleeing enemies, or poke before a dragon fight begins.'
      },
      e: {
        tldr: 'Throws out 3 snare grenades in a line. Enemy champions that step on them are ROOTED for 1.5 seconds and take magic damage.',
        whenToUse: 'Defensive self-peel. Drop these directly in the path of divers (like Master Yi or Zed) chasing you, or chain onto an ally\'s stun.'
      },
      r: {
        tldr: 'Fires a global rocket that gains speed and damage as it travels across the map, exploding on the first enemy champion hit for damage based on MISSING HEALTH.',
        whenToUse: 'Sniping low-health enemies backing in fog of war, or shooting into a clustered teamfight from another lane to help your team.'
      }
    },
    coreBuild: {
      starter: "Doran's Blade + Health Potion",
      firstItem: {
        itemId: '6672',
        name: 'Kraken Slayer',
        why: 'Strong early DPS spike with every third hit dealing ramped physical damage.',
        order: 1
      },
      secondItem: {
        itemId: '3085',
        name: "Runaan's Hurricane",
        why: "Jinx's Q rockets apply on-hit AoE splash to all 3 bolts! Runaan's triples your rocket teamfight damage.",
        order: 2
      },
      thirdItem: {
        itemId: '3031',
        name: 'Infinity Edge',
        why: 'The ultimate crit amplifier. Makes your long-range rockets hit like nuclear bombs.',
        order: 3
      },
      bootsRecommendation: {
        defaultId: '3006',
        defaultName: "Berserker's Greaves",
        why: 'Crucial 35% Attack Speed for marksmen.',
        alternative: 'Plated Steelcaps if facing full AD / fed assassin'
      }
    },
    runeKit: {
      primaryTree: 'Precision',
      keystone: {
        name: 'Lethal Tempo',
        tldr: 'Attacking enemy champions stacks attack speed up to 36% (melee) or 30% (ranged). At max stacks, attacks fire bonus adaptive damage.',
        why: 'Jinx stacks attack speed rapidly with her minigun, and Lethal Tempo unlocks devastating sustained DPS in teamfights.'
      },
      primaryMinors: [
        {
          name: 'Presence of Mind',
          slot: 'Slot 1',
          effect: 'Damaging an enemy champion regenerates mana. Takedowns restore 15% max mana. Solves Jinx Q rocket mana costs in fights!'
        },
        {
          name: 'Legend: Bloodline',
          slot: 'Slot 2',
          effect: 'Grants permanent lifesteal and 85 bonus maximum health as you get kills and farm minions.'
        },
        {
          name: 'Cut Down',
          slot: 'Slot 3',
          effect: 'Deal 8% more damage to champions above 60% maximum health, helping chunk down frontliners.'
        }
      ],
      secondaryTree: 'Sorcery',
      secondaryMinors: [
        {
          name: 'Absolute Focus',
          effect: 'While above 70% health, gain up to 18 Attack Damage, strengthening your long-range rocket poke.'
        },
        {
          name: 'Gathering Storm',
          effect: 'Gains escalating Attack Damage every 10 minutes, securing your late-game hypercarry status.'
        }
      ],
      swapRule: {
        trigger: 'Facing heavy lane poke & harass (Caitlyn + Lux / Xerath)',
        take: 'Fleet Footwork',
        insteadOf: 'Lethal Tempo',
        why: 'Fleet Footwork grants burst movement speed and healing on energize attacks, helping you dodge skillshots and survive laning phase!'
      },
      statShards: '+10% Attack Speed • +8 Adaptive Force • +65 Health'
    }
  },

  // === MID LANERS ===
  Ahri: {
    championId: 'Ahri',
    role: 'Mid',
    damageType: 'Magic Heavy',
    playstyle: 'Burst Assassin',
    identity: 'Mobile fox mage with high pick potential, charm crowd control, and triple-dash repositioning with resets on kills.',
    winCondition: 'Push mid waves with Q, land Charms (E) to create picks, and use your Ultimate (R) to roam to bot or top lane to snowball skirmishes.',
    powerSpikes: ['Level 6 Dash Roaming Spike', '1-Item Malignance / Luden', '2-Item Horizon / Shadowflame'],
    skillMaxOrder: 'Q > W > E',
    skillMaxReason: 'Max Q first for waveclear and true damage on return. Max W second for low-cooldown targeted burst and move speed.',
    combos: [
      {
        name: 'Standard Pick Combo',
        sequence: ['E (Charm)', 'Q (Orb forward & back)', 'W (Fox-fire)', 'R (Reposition or execute)'],
        tip: 'Charmed targets walk helplessly toward you. Landing E guarantees both halves of your Q (including the true damage return).'
      },
      {
        name: 'Charm-Flash Surprise',
        sequence: ['Press E', 'Immediately Flash during cast animation'],
        tip: 'The charm fires from your post-flash location, giving enemies zero time to react with dodge spells or shields.'
      }
    ],
    plainAbilities: {
      passive: {
        tldr: 'Killing minions and monsters stacks Essence. At 9 stacks, Ahri consumes them to heal. Scoring a champion takedown heals a large chunk of health.',
        whenToUse: 'Keeps Ahri healthy in mid lane. In teamfights, every assist heals you and gives you extra mobility to keep fighting.'
      },
      q: {
        tldr: 'Sends out an orb dealing magic damage going out, and TRUE DAMAGE on its way back to Ahri.',
        whenToUse: 'Line up the return path! The return orb deals true damage (ignores MR). Walk sideways to steer the returning orb into the enemy.'
      },
      w: {
        tldr: 'Releases 3 fox-fires that target nearby enemies (prioritizing champions), dealing magic damage and granting Ahri a 40% burst of move speed.',
        whenToUse: 'Tap W whenever you need a quick burst of movement speed to dodge a skillshot or chase down a fleeing target.'
      },
      e: {
        tldr: 'Blows a kiss dealing magic damage and CHARMING the first enemy hit, causing them to walk harmlessly toward Ahri for up to 2 seconds.',
        whenToUse: 'Your single most important spell. Never throw this blindly. Use it when enemy steps past their minion wave or to peel off an assassin.'
      },
      r: {
        tldr: 'Dashes up to 3 times, firing essence bolts at nearby champions. Scoring a champion takedown extends the duration and grants an additional dash (up to 3 extra).',
        whenToUse: 'Ultimate freedom: use dashes to reposition for impossible Charm angles, dodge heavy ultimates, or chase down runners.'
      }
    },
    coreBuild: {
      starter: "Doran's Ring + 2 Health Potions",
      firstItem: {
        itemId: '6655',
        name: "Luden's Companion",
        why: 'Solves mana issues, grants 20 Ability Haste, and adds extra burst to your waveclear and combos.',
        order: 1
      },
      secondItem: {
        itemId: '4645',
        name: 'Shadowflame',
        why: 'Provides 120 AP and magic penetration that critically strikes low-health targets, ensuring Charm picks convert into confirmed kills.',
        order: 2
      },
      thirdItem: {
        itemId: '3089',
        name: "Rabadon's Deathcap",
        why: 'Multiplies your total AP by 35% so your full combo can one-shot enemy squishies.',
        order: 3
      },
      bootsRecommendation: {
        defaultId: '3020',
        defaultName: "Sorcerer's Shoes",
        why: 'Flat 18 Magic Penetration maximizes burst against low-MR targets.',
        alternative: 'Ionian Boots of Lucidity for lower flash/charm cooldown'
      }
    },
    runeKit: {
      primaryTree: 'Domination',
      keystone: {
        name: 'Electrocute',
        tldr: 'Hitting a champion with 3 separate basic attacks or spells within 3 seconds deals bonus adaptive burst damage.',
        why: 'Ahri activates Electrocute easily with Auto -> W -> Q for quick, un-tradeable burst in lane.'
      },
      primaryMinors: [
        {
          name: 'Taste of Blood',
          slot: 'Slot 1',
          effect: 'Heals you whenever you damage an enemy champion (20s cooldown), giving free trading sustain.'
        },
        {
          name: 'Eyeball Collection',
          slot: 'Slot 2',
          effect: 'Grants permanent Ability Power for every champion takedown (up to 30 bonus AP).'
        },
        {
          name: 'Ultimate Hunter',
          slot: 'Slot 3',
          effect: 'Drastically lowers the cooldown of your Spirit Rush (R) dashes with each unique champion kill.'
        }
      ],
      secondaryTree: 'Inspiration',
      secondaryMinors: [
        {
          name: 'Magical Footwear',
          effect: 'Get free Slightly Magical Boots at 12 minutes (reduced by 45s per kill) that grant +10 bonus movespeed.'
        },
        {
          name: 'Cosmic Insight',
          effect: 'Grants +18 Summoner Spell Haste (lowers Flash cooldown) and +10 Item Haste.'
        }
      ],
      swapRule: {
        trigger: 'Facing long-range artillery mages (Xerath, Velkoz, Lux, Ziggs)',
        take: 'Manaflow Band + Scorch',
        insteadOf: 'Inspiration secondary',
        why: 'Gives you unlimited mana and extra poke damage from max range so you can match their waveclear.'
      },
      statShards: '+8 Adaptive Force • +8 Adaptive Force • +65 Health'
    }
  },

  // === JUNGLE ===
  Warwick: {
    championId: 'Warwick',
    role: 'Jungle',
    damageType: 'True / Hybrid',
    playstyle: 'Diver',
    identity: 'Feral hunter who smells low-health enemies across the entire map, healing heavily when low on health and locking down targets with suppressive bites.',
    winCondition: 'Invade early, secure neutral objectives (Dragon / Herald) solo, gank low-health lanes via Blood Hunt trails, and lock down high-value carries with R.',
    powerSpikes: ['Level 3 1v1 Invasions', 'Tiamat Rush (Waveclear)', 'Level 6 Suppression Ult', 'Blade of the Ruined King Spike'],
    skillMaxOrder: 'W > Q > E',
    skillMaxReason: 'Max W first to gain up to 110% attack speed and insane move speed toward low enemies. Max Q second for damage and healing.',
    combos: [
      {
        name: 'Follow-Through Gank',
        sequence: ['Hold Q (Latch behind target)', 'E (Fear them backward toward your team)', 'Auto attacks'],
        tip: 'Holding down Q causes Warwick to swing completely behind the target, preventing them from running to their tower!'
      }
    ],
    plainAbilities: {
      passive: {
        tldr: 'Warwick\'s basic attacks deal bonus magic damage. When below 50% health, his attacks heal him for 100% of damage dealt (tripled to 250% when below 25% health!).',
        whenToUse: 'Do not run away when low on health! Warwick is strongest at 20% HP because his passive heals for hundreds of HP per attack. Turn and fight.'
      },
      q: {
        tldr: 'Bites an enemy, dealing % max health damage and healing Warwick for a massive chunk. HOLDING the key makes him latch on and leap behind the target, following dashes/flashes!',
        whenToUse: 'Hold Q right as an enemy is about to Flash or dash. You will literally follow them through their Flash.'
      },
      w: {
        tldr: 'Passively gains movement speed toward low-health enemies and bonus attack speed against them. Active: reveals the nearest enemy champion and marks them.',
        whenToUse: 'Active can be used to track the enemy jungler in fog of war or sprint across the map to counter-gank.'
      },
      e: {
        tldr: 'Reduces incoming damage by up to 55% for 2.5 seconds. Recasting (or when it expires) fears all nearby enemies for 1 second, causing them to flee.',
        whenToUse: 'Press E before jumping into a fight to soak incoming burst, then activate the fear to disrupt the enemy team.'
      },
      r: {
        tldr: 'Leaps a long distance (scaling with move speed) onto an enemy champion, SUPPRESSING them for 1.5 seconds, dealing magic damage, and healing for 100% of damage dealt.',
        whenToUse: 'Lock down their most fed carry. Since it is a SUPPRESSION, Summoner Cleanse cannot break it (only QSS can).'
      }
    },
    coreBuild: {
      starter: 'Scorchclaw Pup + Health Potion',
      firstItem: {
        itemId: '3748',
        name: 'Titanic Hydra',
        why: 'Tiamat rush gives crucial jungle AoE clear speed, completed into Titanic Hydra for auto-attack resets, burst damage, and max health scaling.',
        order: 1
      },
      secondItem: {
        itemId: '3153',
        name: 'Blade of the Ruined King',
        why: '% Current health damage on hit plus lifesteal. Makes you an unbeatable 1v1 duelist.',
        order: 2
      },
      thirdItem: {
        itemId: '3068',
        name: 'Sunfire Aegis',
        why: 'Provides armor, health, and ramping AoE burn in extended melee fights.',
        order: 3
      },
      bootsRecommendation: {
        defaultId: '3047',
        defaultName: 'Plated Steelcaps',
        why: 'Blocks incoming auto attacks from enemy ADCs and bruisers.',
        alternative: "Mercury's Treads vs heavy CC"
      }
    },
    runeKit: {
      primaryTree: 'Precision',
      keystone: {
        name: 'Press the Attack',
        tldr: 'Hitting an enemy 3 times deals bonus damage and exposes them to take 8% increased damage from ALL sources for 5 seconds.',
        why: 'Warwick Q and R instantly trigger Press the Attack, exposing targets so your team can delete them immediately.'
      },
      primaryMinors: [
        {
          name: 'Triumph',
          slot: 'Slot 1',
          effect: 'Takedowns restore 10% missing health and grant 20 gold. Crucial for surviving tower dives.'
        },
        {
          name: 'Legend: Alacrity',
          slot: 'Slot 2',
          effect: 'Permanently stacks attack speed, letting Warwick trigger more on-hit healing attacks.'
        },
        {
          name: 'Last Stand',
          slot: 'Slot 3',
          effect: 'Deals up to 11% bonus damage when low on health, matching Warwick\'s passive triple healing threshold!'
        }
      ],
      secondaryTree: 'Sorcery',
      secondaryMinors: [
        {
          name: 'Celerity',
          effect: 'Movement speed bonuses from your Blood Hunt (W) trail are 7% stronger and grant extra Attack Damage.'
        },
        {
          name: 'Waterwalking',
          effect: 'Gain bonus movement speed and Adaptive Force when in the river, guaranteeing Dragon and Baron fight dominance.'
        }
      ],
      swapRule: {
        trigger: 'Facing 2+ tank brawlers (Skarner, Zac, Sejuani, ChoGath)',
        take: 'Lethal Tempo',
        insteadOf: 'Press the Attack',
        why: 'Lethal Tempo gives endless attack speed and on-hit damage in long frontline slugfests against meat-shield tanks!'
      },
      statShards: '+10% Attack Speed • +8 Adaptive Force • +65 Health'
    }
  },

  // === SUPPORT ===
  Thresh: {
    championId: 'Thresh',
    role: 'Support',
    damageType: 'Magic Heavy',
    playstyle: 'Diver',
    identity: 'The quintessential playmaker support who controls battlefield geometry with hooks, lantern rescues, knockbacks, and a slowing box.',
    winCondition: 'Dominate bush vision in lane, land Death Sentences (Q) to win 2v2 skirmishes, and throw Lanterns (W) to escort your jungler into ganks.',
    powerSpikes: ['Level 2 Hook + Flay Spike', 'Mobility / Swiftness Boots Roams', '1-Item Knight\'s Vow / Locket'],
    skillMaxOrder: 'Q > W > E',
    skillMaxReason: 'Max Q first to reduce hook cooldown down to 12s (and 9s when it lands). Max W second to give larger rescue shields.',
    combos: [
      {
        name: 'Lantern Express Gank',
        sequence: ['Throw W (Lantern) backward to your jungler', 'Flash forward or Q (Hook enemy)', 'E (Flay toward your team)'],
        tip: 'Your jungler clicks the lantern while you fly with Q, pulling both of you onto the enemy carry simultaneously!'
      },
      {
        name: 'Flay into Guaranteed Hook',
        sequence: ['Walk up', 'E (Flay backward toward you)', 'Immediate Q (Hook)'],
        tip: 'Never throw Q from max range if you can walk up and Flay first! The Flay slow makes the subsequent hook virtually unmissable.'
      }
    ],
    plainAbilities: {
      passive: {
        tldr: 'Thresh does not gain armor per level. Instead, dying enemies drop souls that Thresh collects to permanently gain Armor and Ability Power.',
        whenToUse: 'Collect souls safely in lane using your lantern if they are too dangerous to walk to.'
      },
      q: {
        tldr: 'Winds up and throws a scythe. Stuns the first enemy hit and tugs them twice. Recasting pulls Thresh directly to the caught enemy.',
        whenToUse: 'Landing the hook refunds 3 seconds of cooldown. Only recast Q2 if it is safe to dive in; you can just let the double-tug pull them without going in.'
      },
      w: {
        tldr: 'Throws a lantern to a location. Allies who click the lantern dash directly to Thresh. Nearby allies gain a shield.',
        whenToUse: 'The greatest rescue tool in League. Throw it behind a teammate who is getting ganked, or throw it forward to pull a teammate in.'
      },
      e: {
        tldr: 'Passive: Basic attacks deal bonus magic damage that winds up over time. Active: Sweeps his chain, knocking enemies in the direction of the swing and slowing them.',
        whenToUse: 'Flay interrupts enemy dashes! You can cancel Tristana W jump, Leona E Zenith Blade, or Zac leap out of mid-air if timed correctly.'
      },
      r: {
        tldr: 'Creates a prison of 5 spectral walls around Thresh. Breaking a wall deals heavy magic damage and slows the target by 99% for 2 seconds.',
        whenToUse: 'Drop inside teamfights or after pulling yourself in with Q2 to trap multiple enemies in inescapable 99% slows.'
      }
    },
    coreBuild: {
      starter: "World Atlas (Support Quest) + 2 Potions",
      firstItem: {
        itemId: '3190',
        name: 'Locket of the Iron Solari',
        why: 'Cheap, team-wide active shield that protects your carry from burst damage in dragon fights.',
        order: 1
      },
      secondItem: {
        itemId: '3050',
        name: "Zeke's Convergence",
        why: 'Casting your ultimate creates an icy tempest that burns and slows nearby enemies.',
        order: 2
      },
      thirdItem: {
        itemId: '3109',
        name: "Knight's Vow",
        why: 'Designate your fed carry as your Worthy Ally to redirect 12% of damage taken onto yourself and heal from their damage.',
        order: 3
      },
      bootsRecommendation: {
        defaultId: '3009',
        defaultName: 'Boots of Swiftness',
        why: 'High out-of-combat movement speed allows you to roam to mid lane and ward deep enemy jungle.',
        alternative: "Plated Steelcaps if enemy ADC is fed"
      }
    },
    runeKit: {
      primaryTree: 'Inspiration',
      keystone: {
        name: 'Glacial Augment',
        tldr: 'Immobilizing an enemy champion emits 3 freezing rays toward nearby enemies, slowing them by 30% and reducing their damage to your allies by 15%.',
        why: 'Landing Thresh Q (Hook) or E (Flay) freezes the whole area, making it impossible for the enemy ADC to escape or return fire.'
      },
      primaryMinors: [
        {
          name: 'Hextech Flashtraption',
          slot: 'Slot 1',
          effect: 'While Flash is on cooldown, channel for 2 seconds to blink from unwarded bushes for surprise hooks.'
        },
        {
          name: 'Biscuit Delivery',
          slot: 'Slot 2',
          effect: 'Receive free biscuits that restore 8% missing health and mana, securing early laning phase.'
        },
        {
          name: 'Cosmic Insight',
          slot: 'Slot 3',
          effect: 'Grants +18 Summoner Spell Haste (Flash on a much lower cooldown for flash-flay plays) and Item Haste.'
        }
      ],
      secondaryTree: 'Resolve',
      secondaryMinors: [
        {
          name: 'Bone Plating',
          effect: 'Reduces the damage of 3 consecutive enemy attacks after being hit, protecting you when taking early 2v2 trades.'
        },
        {
          name: 'Unflinching',
          effect: 'Grants bonus Armor and Magic Resist when impaired by slow or crowd control, keeping you alive when engaging.'
        }
      ],
      swapRule: {
        trigger: 'Facing long-range poke lanes (Caitlyn + Lux / Xerath / Brand)',
        take: 'Second Wind',
        insteadOf: 'Bone Plating',
        why: 'Bone Plating gets poked off by 1 auto-attack, whereas Second Wind constantly regens your HP every time you are poked!'
      },
      statShards: '+8 Ability Haste • +65 Health • +65 Health'
    }
  }
};

const TREE_MINORS: Record<string, { name: string; slot: string; effect: string }[]> = {
  Precision: [
    { name: 'Triumph', slot: 'Slot 1', effect: 'Takedowns restore 10% missing health and grant 20 gold.' },
    { name: 'Legend: Alacrity', slot: 'Slot 2', effect: 'Permanently stacks attack speed per champion takedown.' },
    { name: 'Last Stand', slot: 'Slot 3', effect: 'Deals up to 11% bonus damage when low on health.' }
  ],
  Domination: [
    { name: 'Sudden Impact', slot: 'Slot 1', effect: 'Dealing damage after a dash or stealth deals bonus true damage.' },
    { name: 'Eyeball Collection', slot: 'Slot 2', effect: 'Permanently stacks Adaptive Force on champion takedowns.' },
    { name: 'Ultimate Hunter', slot: 'Slot 3', effect: 'Permanently reduces ultimate cooldown per unique champion kill.' }
  ],
  Sorcery: [
    { name: 'Manaflow Band', slot: 'Slot 1', effect: 'Hitting spells permanently increases max mana up to 250.' },
    { name: 'Transcendence', slot: 'Slot 2', effect: 'Grants 10 Ability Haste and refunds 20% remaining cooldowns on kills.' },
    { name: 'Gathering Storm', slot: 'Slot 3', effect: 'Gains escalating bonus AD or AP every 10 minutes.' }
  ],
  Resolve: [
    { name: 'Demolish', slot: 'Slot 1', effect: 'Charges a massive attack against enemy turrets to print plate gold.' },
    { name: 'Second Wind', slot: 'Slot 2', effect: 'Regenerates missing health over 10s after taking damage.' },
    { name: 'Overgrowth', slot: 'Slot 3', effect: 'Permanently absorbs max health from nearby dying minions.' }
  ],
  Inspiration: [
    { name: 'Magical Footwear', slot: 'Slot 1', effect: 'Gives free upgraded boots (+10 MS) at 12 minutes (reduced by kills).' },
    { name: 'Biscuit Delivery', slot: 'Slot 2', effect: 'Delivers free biscuits for early health and mana sustain.' },
    { name: 'Cosmic Insight', slot: 'Slot 3', effect: '+18 Summoner Spell Haste and +10 Item Haste.' }
  ]
};

/**
 * Universal fallback generator for any champion in the 173-character roster!
 */
export function generateDynamicTactics(championId: string, tags: string[], name: string): TacticalGuide {
  const isSupport = tags.includes('Support');
  const isMarksman = tags.includes('Marksman');
  const isMage = tags.includes('Mage') && !isMarksman && !isSupport;
  const isAssassin = tags.includes('Assassin') && !isSupport;
  const isTank = tags.includes('Tank') && !isSupport;

  let role: 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support' = 'Top';
  let damageType: 'Physical Heavy' | 'Magic Heavy' | 'True / Hybrid' = 'Physical Heavy';
  let playstyle: any = 'Skirmisher';
  let firstItemId = '6631';
  let firstItemName = 'Stridebreaker';
  let secondItemId = '3053';
  let secondItemName = "Sterak's Gage";
  let thirdItemId = '6333';
  let thirdItemName = "Death's Dance";
  let bootsId = '3047';
  let bootsName = 'Plated Steelcaps';

  let primaryTree: any = 'Precision';
  let keystoneName = 'Conqueror';
  let keystoneTldr = 'Attacks and spells grant stacking Attack Damage and heal at max stacks.';
  let keystoneWhy = 'Reliable ramping damage and sustain in prolonged teamfights.';
  let secondaryTree: any = 'Resolve';
  let secondaryMinors = [
    { name: 'Bone Plating', effect: 'Blocks early trade burst damage from enemy combos.' },
    { name: 'Overgrowth', effect: 'Permanently stacks bonus health as nearby minions die.' }
  ];
  let swapTrigger = 'Facing heavy ranged poke champions';
  let swapTake = 'Second Wind';
  let swapInstead = 'Bone Plating';
  let swapWhy = 'Regenerates health continuously against poke damage.';
  let shards = '+8 Adaptive Force • +8 Adaptive Force • +65 Health';

  if (isSupport) {
    role = 'Support';
    const isSupportTank = tags.includes('Tank');
    damageType = isSupportTank ? 'Physical Heavy' : 'Magic Heavy';
    playstyle = isSupportTank ? 'Engage Tank Support' : 'Utility Enchanter';
    firstItemId = '3190';
    firstItemName = 'Locket of the Iron Solari';
    secondItemId = isSupportTank ? '3050' : '3107';
    secondItemName = isSupportTank ? "Zeke's Convergence" : 'Redemption';
    thirdItemId = '3109';
    thirdItemName = "Knight's Vow";
    bootsId = isSupportTank ? '3009' : '3158';
    bootsName = isSupportTank ? 'Boots of Swiftness' : 'Ionian Boots of Lucidity';
    primaryTree = isSupportTank ? 'Resolve' : 'Inspiration';
    keystoneName = isSupportTank ? 'Aftershock' : 'Glacial Augment';
    keystoneTldr = isSupportTank
      ? 'Immobilizing an enemy grants massive bonus resistances, then explodes for AoE magic damage.'
      : 'Immobilizing enemies sprays slowing rays that reduce enemy damage to allies by 15%.';
    keystoneWhy = isSupportTank
      ? 'Survives all-in initiation burst without dying in the first 2 seconds of teamfights.'
      : 'Protects your carry and pins down enemies during teamfights.';
    secondaryTree = isSupportTank ? 'Inspiration' : 'Resolve';
    secondaryMinors = isSupportTank
      ? [
          { name: 'Hextech Flashtraption', effect: 'Enables surprise ganks from out of vision.' },
          { name: 'Cosmic Insight', effect: 'Lower Flash and summoner spell cooldowns.' }
        ]
      : [
          { name: 'Font of Life', effect: 'Allies heal when attacking enemies you impair.' },
          { name: 'Revitalize', effect: 'Increases all your healing and shielding by 5–10%.' }
        ];
    swapTrigger = 'Facing poke-heavy bot lanes';
    swapTake = 'Guardian';
    swapInstead = isSupportTank ? 'Aftershock' : 'Glacial Augment';
    swapWhy = 'Grants an instant defensive shield to both you and your carry when taking poke.';
    shards = '+8 Ability Haste • +65 Health • +65 Health';
  } else if (isMarksman) {
    role = 'ADC';
    damageType = 'Physical Heavy';
    playstyle = 'Hypercarry';
    firstItemId = '6672';
    firstItemName = 'Kraken Slayer';
    secondItemId = '3031';
    secondItemName = 'Infinity Edge';
    thirdItemId = '3036';
    thirdItemName = "Lord Dominik's Regards";
    bootsId = '3006';
    bootsName = "Berserker's Greaves";
    primaryTree = 'Precision';
    keystoneName = 'Lethal Tempo';
    keystoneTldr = 'Attacking champions stacks attack speed; at max stacks, attacks deal bonus on-hit adaptive damage.';
    keystoneWhy = 'Maximizes your sustained damage output from safe maximum distance.';
    secondaryTree = 'Sorcery';
    secondaryMinors = [
      { name: 'Absolute Focus', effect: 'Bonus Attack Damage while above 70% health.' },
      { name: 'Gathering Storm', effect: 'Escalating Attack Damage every 10 minutes.' }
    ];
    swapTrigger = 'Facing heavy poke lanes';
    swapTake = 'Fleet Footwork';
    swapInstead = 'Lethal Tempo';
    swapWhy = 'Provides energize movement speed and healing to survive poke.';
    shards = '+10% Attack Speed • +8 Adaptive Force • +65 Health';
  } else if (isMage) {
    role = 'Mid';
    damageType = 'Magic Heavy';
    playstyle = 'Control Mage';
    firstItemId = '6655';
    firstItemName = "Luden's Companion";
    secondItemId = '4645';
    secondItemName = 'Shadowflame';
    thirdItemId = '3089';
    thirdItemName = "Rabadon's Deathcap";
    bootsId = '3020';
    bootsName = "Sorcerer's Shoes";
    primaryTree = 'Sorcery';
    keystoneName = 'Arcane Comet';
    keystoneTldr = 'Damaging a champion hurls a comet dealing adaptive damage to their location.';
    keystoneWhy = 'Consistent poke damage that synergizes with ability slows and zoning.';
    secondaryTree = 'Inspiration';
    secondaryMinors = [
      { name: 'Magical Footwear', effect: 'Free boots at 12 minutes with +10 movespeed.' },
      { name: 'Cosmic Insight', effect: 'Lower Flash and item active cooldowns.' }
    ];
    swapTrigger = 'Facing high-mobility dive or assassin threats';
    swapTake = 'Phase Rush';
    swapInstead = 'Arcane Comet';
    swapWhy = 'Phase Rush gives rapid disengage movement speed and slow resistance when jumped on.';
    shards = '+8 Adaptive Force • +8 Adaptive Force • +65 Health';
  } else if (isAssassin) {
    role = 'Mid';
    damageType = 'Physical Heavy';
    playstyle = 'Burst Assassin';
    firstItemId = '3142';
    firstItemName = "Youmuu's Ghostblade";
    secondItemId = '6694';
    secondItemName = "Serylda's Grudge";
    thirdItemId = '3814';
    thirdItemName = 'Edge of Night';
    bootsId = '3158';
    bootsName = 'Ionian Boots of Lucidity';
    primaryTree = 'Domination';
    keystoneName = 'Electrocute';
    keystoneTldr = 'Triggered on 3 hit combos for lethal assassination burst.';
    keystoneWhy = 'Guarantees your full combo deletes squishy backliners.';
    secondaryTree = 'Precision';
    secondaryMinors = [
      { name: 'Triumph', effect: 'Heals 10% on kill so you can escape tower dives.' },
      { name: 'Coup de Grace', effect: 'Deals 8% more damage to enemies below 40% health.' }
    ];
    swapTrigger = 'Facing heavy armor bruisers';
    swapTake = 'Conqueror';
    swapInstead = 'Electrocute';
    swapWhy = 'Grants prolonged damage in fights you cannot end in 1 second.';
    shards = '+8 Adaptive Force • +8 Adaptive Force • +65 Health';
  } else if (isTank) {
    role = 'Top';
    damageType = 'Physical Heavy';
    playstyle = 'Teamfight Tank';
    firstItemId = '3068';
    firstItemName = 'Sunfire Aegis';
    secondItemId = '2504';
    secondItemName = 'Kaenic Rookern';
    thirdItemId = '3075';
    thirdItemName = 'Thornmail';
    bootsId = '3047';
    bootsName = 'Plated Steelcaps';
    primaryTree = 'Resolve';
    keystoneName = 'Grasp of the Undying';
    keystoneTldr = 'Combat empowers attacks to deal bonus damage, heal, and permanently increase max HP.';
    keystoneWhy = 'Gives endless lane trading sustain and scales your health into late game.';
    secondaryTree = 'Inspiration';
    secondaryMinors = [
      { name: 'Biscuit Delivery', effect: 'Early health and mana sustain.' },
      { name: 'Cosmic Insight', effect: 'Lower Teleport and Flash cooldowns.' }
    ];
    swapTrigger = 'Facing heavy teamfight crowd control';
    swapTake = 'Aftershock';
    swapInstead = 'Grasp of the Undying';
    swapWhy = 'Gives massive temporary Armor and Magic Resist when initiating fights.';
    shards = '+8 Ability Haste • +65 Health • +65 Health';
  }

  return {
    championId,
    role,
    damageType,
    playstyle,
    identity: `${name} is an impactful ${playstyle.toLowerCase()} who controls game tempo with their ${tags.join(' / ')} kit.`,
    winCondition: `Group with your team around core dragon / baron objectives and play around your cooldowns and power spikes.`,
    powerSpikes: ['Level 3 All-in Window', 'Level 6 Ultimate Spike', '1st Item Completion'],
    skillMaxOrder: 'Q > E > W',
    skillMaxReason: 'Max primary damage skill first for waveclear and cooldown reduction.',
    combos: [],
    plainAbilities: {
      passive: {
        tldr: '',
        whenToUse: 'Track status and stack counters to time favorable trading windows.'
      },
      q: {
        tldr: '',
        whenToUse: 'Cast to poke, contest minion waves, or initiate short trades.'
      },
      w: {
        tldr: '',
        whenToUse: 'Deploy reactively to counter enemy advances or peel threats.'
      },
      e: {
        tldr: '',
        whenToUse: 'Save for crucial repositioning or disengaging from incoming ganks.'
      },
      r: {
        tldr: '',
        whenToUse: 'Deploy in teamfight clashes to turn skirmishes and secure decisive advantages.'
      }
    },
    coreBuild: {
      starter: isSupport ? "World Atlas + 2 Potions" : isMarksman ? "Doran's Blade + Health Potion" : isMage ? "Doran's Ring + 2 Potions" : isTank ? "Doran's Shield + Health Potion" : "Doran's Blade + Health Potion",
      firstItem: {
        itemId: firstItemId,
        name: firstItemName,
        why: synthesizeItemRationale(firstItemId, firstItemName, role, playstyle, damageType, 1),
        order: 1
      },
      secondItem: {
        itemId: secondItemId,
        name: secondItemName,
        why: synthesizeItemRationale(secondItemId, secondItemName, role, playstyle, damageType, 2),
        order: 2
      },
      thirdItem: {
        itemId: thirdItemId,
        name: thirdItemName,
        why: synthesizeItemRationale(thirdItemId, thirdItemName, role, playstyle, damageType, 3),
        order: 3
      },
      bootsRecommendation: {
        defaultId: bootsId,
        defaultName: bootsName,
        why: 'Optimal baseline boots for this class profile.',
        alternative: "Mercury's Treads if facing heavy CC / AP"
      }
    },
    runeKit: {
      primaryTree,
      keystone: {
        name: keystoneName,
        tldr: keystoneTldr,
        why: keystoneWhy
      },
      primaryMinors: TREE_MINORS[primaryTree] || TREE_MINORS.Precision,
      secondaryTree,
      secondaryMinors,
      swapRule: {
        trigger: swapTrigger,
        take: swapTake,
        insteadOf: swapInstead,
        why: swapWhy
      },
      statShards: shards
    }
  };
}

export function getTacticsForChampion(championId: string, tags: string[] = [], name: string = championId): TacticalGuide {
  const meta = getMetaBuildForChampion(championId);
  const handcrafted = CHAMPION_TACTICS[championId];

  // If we have both handcrafted depth and live meta build, merge them!
  // Live meta supplies up-to-date items, runes, and max order;
  // Handcrafted supplies deep combos, ability secrets, identity, and matchup swaps.
  if (handcrafted && meta) {
    return {
      ...handcrafted,
      role: meta.role || handcrafted.role,
      damageType: meta.damageType || handcrafted.damageType,
      skillMaxOrder: meta.skillMaxOrder || handcrafted.skillMaxOrder,
      skillMaxReason: meta.skillMaxReason || handcrafted.skillMaxReason,
      coreBuild: {
        starter: meta.starter || handcrafted.coreBuild.starter,
        starterIds: meta.starterIds,
        firstItem: {
          itemId: meta.firstItemId || handcrafted.coreBuild.firstItem.itemId,
          name: meta.firstItemName || handcrafted.coreBuild.firstItem.name,
          why: synthesizeItemRationale(meta.firstItemId, meta.firstItemName, meta.role, handcrafted.playstyle, meta.damageType, 1),
          order: 1
        },
        secondItem: {
          itemId: meta.secondItemId || handcrafted.coreBuild.secondItem.itemId,
          name: meta.secondItemName || handcrafted.coreBuild.secondItem.name,
          why: synthesizeItemRationale(meta.secondItemId, meta.secondItemName, meta.role, handcrafted.playstyle, meta.damageType, 2),
          order: 2
        },
        thirdItem: {
          itemId: meta.thirdItemId || handcrafted.coreBuild.thirdItem.itemId,
          name: meta.thirdItemName || handcrafted.coreBuild.thirdItem.name,
          why: synthesizeItemRationale(meta.thirdItemId, meta.thirdItemName, meta.role, handcrafted.playstyle, meta.damageType, 3),
          order: 3
        },
        bootsRecommendation: {
          defaultId: meta.bootsId || handcrafted.coreBuild.bootsRecommendation.defaultId,
          defaultName: meta.bootsName || handcrafted.coreBuild.bootsRecommendation.defaultName,
          why: meta.bootsWhy || handcrafted.coreBuild.bootsRecommendation.why,
          alternative: handcrafted.coreBuild.bootsRecommendation.alternative
        }
      },
      runeKit: {
        primaryTree: meta.primaryTree,
        keystone: {
          name: meta.keystoneName,
          tldr: meta.keystoneTldr,
          why: meta.keystoneWhy
        },
        primaryMinors: (meta.primaryRunes && meta.primaryRunes.length >= 4
          ? meta.primaryRunes.slice(1)
          : handcrafted.runeKit.primaryMinors.map(m => m.name)
        ).map((rName, idx) => ({
          name: rName,
          slot: `Slot ${idx + 1}`,
          effect: getRuneByName(rName)?.details || 'Optimal minor rune.',
          fourWords: getRuneFourWords(rName)
        })),
        secondaryTree: meta.secondaryTree,
        secondaryMinors: (meta.secondaryRunes && meta.secondaryRunes.length >= 2
          ? meta.secondaryRunes
          : handcrafted.runeKit.secondaryMinors.map(m => m.name)
        ).map((rName) => ({
          name: rName,
          effect: getRuneByName(rName)?.details || 'Secondary tactical utility.',
          fourWords: getRuneFourWords(rName)
        })),
        swapRule: handcrafted.runeKit.swapRule,
        statShards: meta.statShards || handcrafted.runeKit.statShards
      }
    };
  }

  // Tier 1: Hand-crafted deep mastery tactics (if meta builds not yet loaded)
  if (handcrafted) {
    return handcrafted;
  }

  // Tier 2: Patch Meta Build
  if (meta) {
    return {
      championId,
      role: meta.role,
      damageType: meta.damageType,
      playstyle: meta.playstyle as any,
      identity: meta.identity,
      winCondition: meta.winCondition,
      powerSpikes: meta.powerSpikes,
      skillMaxOrder: meta.skillMaxOrder,
      skillMaxReason: meta.skillMaxReason || 'Provides optimal damage scaling and cooldown reduction.',
      combos: [],
      plainAbilities: {
        passive: {
          tldr: '',
          whenToUse: 'Track status and stack counters to time favorable trading windows.'
        },
        q: {
          tldr: '',
          whenToUse: 'Cast to poke, contest minion waves, or initiate short trades.'
        },
        w: {
          tldr: '',
          whenToUse: 'Deploy reactively to counter enemy advances or peel threats.'
        },
        e: {
          tldr: '',
          whenToUse: 'Save for crucial repositioning or disengaging from incoming ganks.'
        },
        r: {
          tldr: '',
          whenToUse: 'Deploy in teamfight clashes to turn skirmishes and secure decisive advantages.'
        }
      },
      coreBuild: {
        starter: meta.starter,
        starterIds: meta.starterIds,
        firstItem: {
          itemId: meta.firstItemId,
          name: meta.firstItemName,
          why: synthesizeItemRationale(meta.firstItemId, meta.firstItemName, meta.role, meta.playstyle, meta.damageType, 1),
          order: 1
        },
        secondItem: {
          itemId: meta.secondItemId,
          name: meta.secondItemName,
          why: synthesizeItemRationale(meta.secondItemId, meta.secondItemName, meta.role, meta.playstyle, meta.damageType, 2),
          order: 2
        },
        thirdItem: {
          itemId: meta.thirdItemId,
          name: meta.thirdItemName,
          why: synthesizeItemRationale(meta.thirdItemId, meta.thirdItemName, meta.role, meta.playstyle, meta.damageType, 3),
          order: 3
        },
        bootsRecommendation: {
          defaultId: meta.bootsId,
          defaultName: meta.bootsName,
          why: meta.bootsWhy,
          alternative: "Mercury's Treads if facing heavy CC / AP"
        }
      },
      runeKit: {
        primaryTree: meta.primaryTree,
        keystone: {
          name: meta.keystoneName,
          tldr: meta.keystoneTldr || getRuneFourWords(meta.keystoneName),
          why: meta.keystoneWhy
        },
        primaryMinors: (meta.primaryRunes && meta.primaryRunes.length >= 4)
          ? meta.primaryRunes.slice(1).map(name => {
              const def = getRuneByName(name);
              return {
                name,
                effect: def ? def.details : getRuneFourWords(name),
                fourWords: getRuneFourWords(name)
              };
            })
          : (TREE_MINORS[meta.primaryTree] || TREE_MINORS.Precision).map(m => ({
              ...m,
              fourWords: getRuneFourWords(m.name)
            })),
        secondaryTree: meta.secondaryTree,
        secondaryMinors: (meta.secondaryRunes && meta.secondaryRunes.length >= 2)
          ? meta.secondaryRunes.map(name => {
              const def = getRuneByName(name);
              return {
                name,
                effect: def ? def.details : getRuneFourWords(name),
                fourWords: getRuneFourWords(name)
              };
            })
          : (TREE_MINORS[meta.secondaryTree]?.slice(0, 2) || [
              { name: 'Conditioning', effect: 'Gain bonus Armor and Magic Resist after 12 minutes.' },
              { name: 'Overgrowth', effect: 'Gain maximum health when minions die near you.' }
            ]).map(m => ({
              ...m,
              fourWords: getRuneFourWords(m.name)
            })),
        swapRule: {
          trigger: 'Facing heavy lane poke or threat matchup',
          take: 'Second Wind',
          insteadOf: 'Bone Plating',
          why: 'Provides consistent health regeneration whenever taking poke damage.'
        },
        statShards: meta.statShards
      }
    };
  }

  // Tier 3: Algorithmic heuristic fallback
  return generateDynamicTactics(championId, tags, name);
}
