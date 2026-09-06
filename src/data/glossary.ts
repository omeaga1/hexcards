import { GlossaryTerm } from '../types';

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'grievous_wounds',
    term: 'Grievous Wounds (Anti-Heal)',
    shortDef: 'Reduces all incoming healing and health regeneration on the target by 40%.',
    fullExplanation: 'Whenever a champion afflicted by Grievous Wounds receives healing (from their own kit, lifesteal, omnivamp, or an ally like Soraka/Yuumi), that healing is reduced by 40%. It lasts 3 seconds per hit.',
    whyItMatters: 'If you are fighting champions with heavy healing (Aatrox, Warwick, Vlad, Briar, red Kayn, Soraka) and nobody on your team buys an 800g anti-heal component, they will out-sustain your damage and win every fight.',
    category: 'Combat Mechanics',
    exampleItemOrChamp: "Executioner's Calling (AD), Oblivion Orb (AP), Bramble Vest (Tank)"
  },
  {
    id: 'tenacity',
    term: 'Tenacity',
    shortDef: 'Reduces the duration of incoming crowd control effects (stuns, roots, silences, taunts, fears, slows).',
    fullExplanation: 'Tenacity reduces how long disabling CC lasts on you. For example, 30% Tenacity reduces a 2.0-second Morgana root to 1.4 seconds. CRITICAL NOTE: Tenacity does NOT reduce Knockups (Airborne) or Suppression (Malzahar/Warwick ultimates)!',
    whyItMatters: 'Against teams loaded with point-and-click stuns or chain roots, buying Mercury\'s Treads or taking the Legend: Haste / Resolve runes lets you react and press Flash/Zhonya\'s before dying.',
    category: 'Stats & Ratios',
    exampleItemOrChamp: "Mercury's Treads, Sterak's Gage"
  },
  {
    id: 'lethality',
    term: 'Lethality (Flat Armor Pen)',
    shortDef: 'Ignores a flat amount of enemy armor, scaling directly with your champion level.',
    fullExplanation: 'Lethality grants flat armor penetration (1 Lethality = 1 Armor ignored at level 18, slightly less at early levels). If an enemy squishy has 60 armor and you have 40 Lethality, you treat them as having only ~20 armor.',
    whyItMatters: 'Lethality is godly against squishy marksmen, mages, and enchanters with low base armor. However, it is TERRIBLE against tanks with 250+ armor (ignoring 18 armor off 300 armor does almost nothing).',
    category: 'Stats & Ratios',
    exampleItemOrChamp: "Ghostblade, Opportunity, Collector, Hubris"
  },
  {
    id: 'armor_penetration',
    term: '% Armor Penetration (Anti-Tank)',
    shortDef: 'Ignores a percentage of the target\'s TOTAL armor. Essential against tanks.',
    fullExplanation: 'Unlike Lethality (flat reduction), % Armor Penetration ignores 30%–40% of their total armor. If a Malphite has 300 armor, a 35% Armor Pen item treats him as having only 195 armor—erasing 105 armor with one item!',
    whyItMatters: 'If the enemy has 2 or more tanks or bruisers building armor (Tabis/Steelcaps, Sunfire, Thornmail), you MUST build a % Armor Pen item by your 3rd or 4th item or you will deal tickle damage.',
    category: 'Stats & Ratios',
    exampleItemOrChamp: "Lord Dominik's Regards, Serylda's Grudge, Mortal Reminder"
  },
  {
    id: 'magic_penetration',
    term: 'Magic Penetration (Flat vs %)',
    shortDef: 'Bypasses enemy Magic Resist (MR). Flat pen is for squishies; % pen is for tanks.',
    fullExplanation: 'Flat Magic Pen (Sorcerer\'s Shoes, Shadowflame) subtracts a flat number from enemy MR (deadly against squishies with only 40 MR). Void Staff and Cryptbloom provide % Magic Pen, stripping 30%–40% of all MR (mandatory against tanks building Kaenic Rookern or Force of Nature).',
    whyItMatters: 'When enemies buy Magic Resist items (Negatron Cloak, Merc Treads, Rookern), your mage burst drops sharply unless you invest in Void Staff or Cryptbloom.',
    category: 'Stats & Ratios',
    exampleItemOrChamp: "Sorcerer's Shoes (Flat), Void Staff / Cryptbloom (%)"
  },
  {
    id: 'omnivamp_vs_lifesteal',
    term: 'Omnivamp vs. Lifesteal',
    shortDef: 'Lifesteal only heals off basic attack physical damage; Omnivamp heals off ALL damage dealt.',
    fullExplanation: 'Lifesteal heals you for a % of the physical damage dealt by your auto-attacks. Omnivamp heals off auto-attacks, spell abilities, magic damage, and true damage. Note: Area-of-Effect (AoE) abilities only heal for 33% effectiveness with Omnivamp.',
    whyItMatters: 'ADCs who rely on auto-attacks love Lifesteal (Bloodthirster, Blade of the Ruined King). Spell-casters and bruisers who rely on Q/W/E abilities need Omnivamp (Riftmaker) or innate healing.',
    category: 'Combat Mechanics',
    exampleItemOrChamp: 'Bloodthirster (Lifesteal) vs. Riftmaker (Omnivamp)'
  },
  {
    id: 'adaptive_force',
    term: 'Adaptive Force',
    shortDef: 'Grants either Attack Damage (AD) or Ability Power (AP) based on whichever bonus you have more of.',
    fullExplanation: '1 point of Adaptive Force grants either 0.6 Bonus AD or 1.0 Ability Power. The game automatically checks your inventory: if you have more bonus AD, it gives AD; if you have more AP, it gives AP.',
    whyItMatters: 'Runes and starter items like Doran\'s Blade / Ring adjust your adaptive force automatically so hybrid champions don\'t waste stat bonuses.',
    category: 'Stats & Ratios',
    exampleItemOrChamp: 'Conqueror, Gathering Storm, Eyeball Collection'
  },
  {
    id: 'suppression',
    term: 'Suppression vs. Stun',
    shortDef: 'The most lethal CC. Stops all actions and CANNOT be cleansed with Summoner Cleanse.',
    fullExplanation: 'While a standard Stun can be removed with the Summoner Spell Cleanse, Suppression completely disables the target, including Summoner Spells. The ONLY way to break out of Suppression is Quicksilver Sash (QSS) / Mercurial Scimitar or specific champion cleanses (Gangplank W, Olaf R).',
    whyItMatters: 'If you are playing against Malzahar, Warwick, or Skarner and you are the carry, buying an early QSS (1300g) completely neutralizes their primary win condition.',
    category: 'Crowd Control',
    exampleItemOrChamp: 'Malzahar R, Warwick R, Skarner R, Quicksilver Sash'
  },
  {
    id: 'root_vs_stun',
    term: 'Root (Snare) vs. Stun',
    shortDef: 'Root prevents walking/dashing, but allows attacking & spellcasting. Stun stops EVERYTHING.',
    fullExplanation: 'When Rooted (Lux Q, Morgana Q, Jinx E), you cannot walk or use mobility spells (Flash, dashes), but you CAN still auto-attack enemies in range and cast non-movement spells! When Stunned, you can do literally nothing.',
    whyItMatters: 'If you get rooted as a ranged carry, don\'t panic: you can still hit enemies and cast your defensive shields or poke abilities.',
    category: 'Crowd Control',
    exampleItemOrChamp: 'Lux Q (Root) vs. Taric E (Stun)'
  },
  {
    id: 'airborne',
    term: 'Airborne (Knockup / Knockback / Pull)',
    shortDef: 'Crowd control that physically moves your champion. COMPLETELY IMMUNE to Tenacity.',
    fullExplanation: 'Knockups (Malphite R, Yasuo Q3, Janna Q) and pulls (Blitzcrank Q, Nautilus Q) cannot have their duration shortened by Tenacity. You cannot cast spells or move until you land, and Cleanse does not let you walk away while airborne.',
    whyItMatters: 'Do NOT buy Mercury\'s Treads solely thinking it will shorten Malphite, Yasuo, or Alistar knockups. Position defensively instead.',
    category: 'Crowd Control',
    exampleItemOrChamp: 'Malphite R, Blitzcrank Q, Yasuo Q3'
  },
  {
    id: 'true_damage',
    term: 'True Damage',
    shortDef: 'Damage that completely ignores Armor and Magic Resist, dealing exact face-value damage.',
    fullExplanation: 'True damage cannot be reduced by building Armor or Magic Resistance. It also ignores damage reduction buffs (like Alistar R or Warwick E). The only way to survive true damage is stacking maximum Health (HP).',
    whyItMatters: 'Against heavy true damage champions (Vayne, Fiora, Camille, Master Yi), buying high Armor is inefficient—stacking raw Health (Heartsteel, Warmog\'s, Sterak\'s) is much more effective.',
    category: 'Combat Mechanics',
    exampleItemOrChamp: 'Vayne Silver Bolts (W), Fiora Passive, Camille Q2'
  },
  {
    id: 'spell_shield',
    term: 'Spell Shield',
    shortDef: 'A magical barrier that completely absorbs and negates the next single enemy ability.',
    fullExplanation: 'Blocks one hostile champion spell, including ultimates (like Blitz hook, Malphite ult, Veigar cage). Once triggered, it goes on cooldown for 30–40 seconds.',
    whyItMatters: 'Squishy carries buying Edge of Night (AD) or Banshee\'s Veil (AP) gain insurance against being blind-hooked or assassinated before a fight starts.',
    category: 'Item Concepts',
    exampleItemOrChamp: 'Edge of Night, Banshee\'s Veil, Sivir E'
  },
  {
    id: 'shield_reduction',
    term: 'Shield Reave (Anti-Shield)',
    shortDef: 'Reduces the value of enemy shields gained by 50% (melee) or 35% (ranged).',
    fullExplanation: 'When dealing physical damage to an enemy, all new shields they generate are reduced for 3 seconds. Also instantly breaks existing shield chunks.',
    whyItMatters: 'Crucial against team comps stacking massive shields (Sett W, Tahm Kench grey health, Shen R, Karma team shields, Lulu, Sterak\'s Gage).',
    category: 'Combat Mechanics',
    exampleItemOrChamp: "Serpent's Fang"
  },
  {
    id: 'ability_haste',
    term: 'Ability Haste (CDR)',
    shortDef: 'Determines how frequently you can cast your abilities. Replaces old Cooldown Reduction.',
    fullExplanation: 'Ability Haste scales linearly with casts per minute: 100 Ability Haste gives you 100% more casts (equivalent to 50% CDR). 50 Ability Haste gives 33% CDR. Unlike old CDR, there is no hard cap.',
    whyItMatters: 'Great for spell-weaving champions who rely on continuous ability rotations rather than single burst hits.',
    category: 'Stats & Ratios',
    exampleItemOrChamp: "Ionian Boots of Lucidity, Spear of Shojin"
  }
];

export function findGlossaryTerm(termId: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find(t => t.id === termId);
}
