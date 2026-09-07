import fs from 'fs';
import path from 'path';

const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';
const OPGG_MCP_URL = 'https://mcp-api.op.gg/mcp';
const MERAKI_CHAMPS_URL = 'https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions.json';

// Boots why helper
function getBootsWhy(bootsName) {
  const n = (bootsName || '').toLowerCase();
  if (n.includes('steelcaps') || n.includes('ninja')) return 'Essential physical attack damage mitigation and armor.';
  if (n.includes('mercury') || n.includes('merc')) return 'Tenacity to reduce crowd control duration and magic resistance.';
  if (n.includes('sorcerer')) return 'Flat magic penetration to pierce enemy magic resistance.';
  if (n.includes('berserker')) return 'Attack speed scaling for auto-attack and spell cast fluidness.';
  if (n.includes('lucidity') || n.includes('ionian')) return 'Ability haste and summoner spell cooldown reduction.';
  if (n.includes('swiftness')) return 'Maximum flat movement speed and slow resistance.';
  if (n.includes('symbiotic')) return 'Empowered recall and bonus movement speed for map rotations.';
  return 'Core movement speed and combat mobility.';
}

const KEYSTONE_INFO = {
  'Conqueror': {
    tldr: 'Attacks and spells grant stacking AD/AP; at 12 stacks, heals for a portion of damage dealt.',
    why: 'Provides scaling offensive power and combat sustain in extended trades.'
  },
  'Press the Attack': {
    tldr: 'Hitting 3 consecutive basic attacks deals bonus damage and exposes target for increased damage.',
    why: 'Drastically amplifies single-target burst in fast attack rotations.'
  },
  'Lethal Tempo': {
    tldr: 'Attacking enemy champions stacks attack speed; at max stacks, attacks deal bonus on-hit adaptive damage.',
    why: 'Maximizes sustained damage per second in extended skirmishes.'
  },
  'Fleet Footwork': {
    tldr: 'Energized attacks restore health and grant a surging burst of movement speed.',
    why: 'Provides vital early lane sustain and kiting mobility.'
  },
  'Electrocute': {
    tldr: 'Hitting 3 distinct attacks or abilities triggers a massive burst of adaptive damage.',
    why: 'Guarantees lethal single-target burst in quick trade combos.'
  },
  'Dark Harvest': {
    tldr: 'Damaging low-health champions reaps soul essence, dealing ramping bonus damage.',
    why: 'Enables explosive teamfight execution and resets on low-health carries.'
  },
  'Phase Rush': {
    tldr: 'Hitting 3 attacks or spells grants a massive burst of movement speed and slow resistance.',
    why: 'Crucial repositioning speed to stick to fleeing enemies or disengage cleanly from danger.'
  },
  'Arcane Comet': {
    tldr: 'Damaging a champion hurls a comet dealing adaptive AoE damage to their location.',
    why: 'Consistent ranged poke damage that synergizes with ability slows.'
  },
  'Summon Aery': {
    tldr: 'Attacks and spells send Aery to damage enemies or provide shielding to allies.',
    why: 'Provides constant poke pressure and protective shields.'
  },
  'Grasp of the Undying': {
    tldr: 'Combat empowers basic attacks to deal bonus magic damage, heal, and permanently gain max HP.',
    why: 'Endless lane trading sustain that continuously scales maximum health.'
  },
  'Aftershock': {
    tldr: 'Immobilizing an enemy grants temporary armor and MR before detonating in AoE magic damage.',
    why: 'Absorbs retaliatory burst when initiating crowd-control engagements.'
  },
  'Guardian': {
    tldr: 'Shields you and nearby allies when taking heavy damage from enemies.',
    why: 'Protects vulnerable carries against lethal dive aggression.'
  },
  'First Strike': {
    tldr: 'Damaging enemy champions first grants gold and bonus true damage for 3 seconds.',
    why: 'Accelerates core item completion while adding true-damage burst.'
  },
  'Glacial Augment': {
    tldr: 'Immobilizing an enemy shoots 3 freezing rays creating severe slow zones.',
    why: 'Guarantees lockdown and team-wide slow control following your engage.'
  },
  'Hail of Blades': {
    tldr: 'Grants an extreme burst of attack speed for the first 3 basic attacks.',
    why: 'Instantly unloads front-loaded auto attacks and fast passive triggers.'
  }
};

function toOpGgName(id) {
  const SPECIAL_MAP = {
    'MonkeyKing': 'WUKONG',
    'RenataGlasc': 'RENATA',
    'Nunu': 'NUNU',
    'DrMundo': 'DR_MUNDO',
    'JarvanIV': 'JARVAN_IV',
    'MasterYi': 'MASTER_YI',
    'TahmKench': 'TAHM_KENCH',
    'TwistedFate': 'TWISTED_FATE',
    'XinZhao': 'XIN_ZHAO',
    'LeeSin': 'LEE_SIN',
    'RekSai': 'REK_SAI',
    'KhaZix': 'KHA_ZIX',
    'BelVeth': 'BEL_VETH',
    'AurelionSol': 'AURELION_SOL',
    'MissFortune': 'MISS_FORTUNE',
    'KogMaw': 'KOG_MAW',
    'KSante': 'KSANTE',
    'ChoGath': 'CHOGATH',
    'KaiSa': 'KAISA',
    'LeBlanc': 'LEBLANC'
  };

  if (SPECIAL_MAP[id]) return SPECIAL_MAP[id];

  return id
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toUpperCase();
}

function parseOpGgResponse(text) {
  try {
    const coreItemMatches = [...text.matchAll(/CoreItems\(\[([0-9, ]+)\],\s*\[(.*?)\]/g)];
    if (coreItemMatches.length < 3) return null;

    const parseArray = (str) => str.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    const parseNumArray = (str) => str.split(',').map(s => s.trim());

    // 1st CoreItems is core 1, 2, 3
    const coreIds = parseNumArray(coreItemMatches[0][1]);
    const coreNames = parseArray(coreItemMatches[0][2]);

    // 2nd CoreItems is boots
    const bootIds = parseNumArray(coreItemMatches[1][1]);
    const bootNames = parseArray(coreItemMatches[1][2]);

    // 3rd CoreItems is starter
    const starterNames = parseArray(coreItemMatches[2][2]);

    // Runes: Runes(id, primaryId, "PrimaryTree", [ids], ["Keystone", ...], secId, "SecondaryTree", ...)
    const runeMatch = text.match(/Runes\(\d+,\d+,"([^"]+)",\[.*?\],\[(.*?)\],\d+,"([^"]+)"/);
    let primaryTree = 'Precision';
    let secondaryTree = 'Resolve';
    let keystoneName = 'Conqueror';
    if (runeMatch) {
      primaryTree = runeMatch[1];
      const runeNames = parseArray(runeMatch[2]);
      keystoneName = runeNames[0] || 'Conqueror';
      secondaryTree = runeMatch[3];
    }

    // Skills: SkillMasteries(["Q","E","W"],...)
    const skillMatch = text.match(/SkillMasteries\(\[([^\]]+)\]/);
    let skillMaxOrder = 'Q > E > W';
    if (skillMatch) {
      const skills = parseArray(skillMatch[1]);
      skillMaxOrder = skills.join(' > ');
    }

    if (!coreIds[0] || !coreNames[0]) return null;

    return {
      firstItemId: coreIds[0] || '',
      firstItemName: coreNames[0] || '',
      secondItemId: coreIds[1] || coreIds[0],
      secondItemName: coreNames[1] || coreNames[0],
      thirdItemId: coreIds[2] || coreIds[1] || coreIds[0],
      thirdItemName: coreNames[2] || coreNames[1] || coreNames[0],
      bootsId: bootIds[0] || '3047',
      bootsName: bootNames[0] || 'Plated Steelcaps',
      starter: starterNames.join(' + ') || "Doran's Blade + Health Potion",
      primaryTree,
      keystoneName,
      secondaryTree,
      skillMaxOrder
    };
  } catch {
    return null;
  }
}

async function fetchOpGgBuild(champName, position) {
  try {
    const res = await fetch(OPGG_MCP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'lol_get_champion_analysis',
          arguments: {
            game_mode: 'ranked',
            champion: champName,
            position: position.toLowerCase(),
            desired_output_fields: [
              'data.core_items',
              'data.boots',
              'data.starter_items',
              'data.runes',
              'data.skill_masteries'
            ]
          }
        }
      })
    });

    if (!res.ok) return null;
    const json = await res.json();
    const text = json?.result?.content?.[0]?.text;
    if (!text) return null;

    return parseOpGgResponse(text);
  } catch {
    return null;
  }
}

// Fallback archetype generator when OP.GG is unavailable for a champion
function generateFallbackBuild(champ, role) {
  const tags = champ.tags || [];
  const isMarksman = role === 'ADC' || tags.includes('Marksman');
  const isSupport = role === 'Support' || tags.includes('Support');
  const isMage = tags.includes('Mage');
  const isTank = tags.includes('Tank');
  const isAssassin = tags.includes('Assassin');

  if (isMarksman) {
    return {
      starter: "Doran's Blade + Health Potion",
      firstItemId: '6672', firstItemName: 'Kraken Slayer',
      secondItemId: '3031', secondItemName: 'Infinity Edge',
      thirdItemId: '3036', thirdItemName: "Lord Dominik's Regards",
      bootsId: '3006', bootsName: "Berserker's Greaves",
      primaryTree: 'Precision', keystoneName: 'Lethal Tempo', secondaryTree: 'Inspiration',
      skillMaxOrder: 'Q > W > E'
    };
  }
  if (isSupport) {
    return {
      starter: "World Atlas + 2 Health Potions",
      firstItemId: '3190', firstItemName: 'Locket of the Iron Solari',
      secondItemId: '3050', secondItemName: "Zeke's Convergence",
      thirdItemId: '3109', thirdItemName: "Knight's Vow",
      bootsId: '3009', bootsName: 'Boots of Swiftness',
      primaryTree: 'Resolve', keystoneName: 'Glacial Augment', secondaryTree: 'Inspiration',
      skillMaxOrder: 'Q > E > W'
    };
  }
  if (isMage) {
    return {
      starter: "Doran's Ring + 2 Health Potions",
      firstItemId: '6655', firstItemName: "Luden's Companion",
      secondItemId: '4645', secondItemName: 'Shadowflame',
      thirdItemId: '3089', thirdItemName: "Rabadon's Deathcap",
      bootsId: '3020', bootsName: "Sorcerer's Shoes",
      primaryTree: 'Sorcery', keystoneName: 'Arcane Comet', secondaryTree: 'Inspiration',
      skillMaxOrder: 'Q > E > W'
    };
  }
  if (isAssassin) {
    return {
      starter: "Doran's Blade + Health Potion",
      firstItemId: '6701', firstItemName: 'Opportunity',
      secondItemId: '6696', secondItemName: 'Profane Hydra',
      thirdItemId: '6694', thirdItemName: "Serylda's Grudge",
      bootsId: '3158', bootsName: 'Ionian Boots of Lucidity',
      primaryTree: 'Domination', keystoneName: 'Electrocute', secondaryTree: 'Precision',
      skillMaxOrder: 'Q > E > W'
    };
  }
  if (isTank) {
    return {
      starter: "Doran's Shield + Health Potion",
      firstItemId: '3068', firstItemName: 'Sunfire Aegis',
      secondItemId: '2504', secondItemName: 'Kaenic Rookern',
      thirdItemId: '3075', thirdItemName: 'Thornmail',
      bootsId: '3047', bootsName: 'Plated Steelcaps',
      primaryTree: 'Resolve', keystoneName: 'Grasp of the Undying', secondaryTree: 'Inspiration',
      skillMaxOrder: 'Q > W > E'
    };
  }

  // Fighter / Bruiser
  return {
    starter: "Doran's Blade + Health Potion",
    firstItemId: '6630', firstItemName: 'Sundered Sky',
    secondItemId: '3053', secondItemName: "Sterak's Gage",
    thirdItemId: '6333', thirdItemName: "Death's Dance",
    bootsId: '3047', bootsName: 'Plated Steelcaps',
    primaryTree: 'Precision', keystoneName: 'Conqueror', secondaryTree: 'Resolve',
    skillMaxOrder: 'Q > E > W'
  };
}

// Concurrency pool helper
async function mapConcurrent(items, limit, fn) {
  const results = [];
  const executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    if (limit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

async function main() {
  console.log('⚡ [HexCards Meta Generator] Initializing authentic build pipeline...');

  // 1. Fetch DDragon latest version
  const verRes = await fetch(`${DDRAGON_BASE}/api/versions.json`);
  const versions = await verRes.json();
  const latestVersion = versions[0] || '16.17.1';
  console.log(`✓ Riot Data Dragon Active Version: ${latestVersion}`);

  // 2. Fetch all champions from DDragon
  const champRes = await fetch(`${DDRAGON_BASE}/cdn/${latestVersion}/data/en_US/champion.json`);
  const champData = await champRes.json();
  const champions = Object.values(champData.data);
  console.log(`✓ Discovered ${champions.length} champions in League roster.`);

  // 3. Fetch Meraki positions mapping
  let merakiMap = {};
  try {
    const merakiRes = await fetch(MERAKI_CHAMPS_URL);
    if (merakiRes.ok) {
      merakiMap = await merakiRes.json();
      console.log(`✓ Loaded positions directory from Meraki Analytics.`);
    }
  } catch (err) {
    console.warn('⚠ Could not load Meraki positions, falling back to DDragon tags.');
  }

  const builds = {};
  let opggCount = 0;
  let fallbackCount = 0;

  console.log(`\n🚀 Pulling authentic builds from OP.GG API (concurrency: 5)...`);

  const startTime = Date.now();

  await mapConcurrent(champions, 5, async (champ) => {
    const id = champ.id;
    const name = champ.name;
    const tags = champ.tags || [];

    // Determine primary position
    const merakiEntry = merakiMap[id] || merakiMap[name];
    let position = 'mid';
    let role = 'Mid';

    if (merakiEntry && merakiEntry.positions && merakiEntry.positions.length > 0) {
      const p = merakiEntry.positions[0];
      if (p === 'TOP') { position = 'top'; role = 'Top'; }
      else if (p === 'JUNGLE') { position = 'jungle'; role = 'Jungle'; }
      else if (p === 'MIDDLE') { position = 'mid'; role = 'Mid'; }
      else if (p === 'BOTTOM') { position = 'adc'; role = 'ADC'; }
      else if (p === 'UTILITY' || p === 'SUPPORT') { position = 'support'; role = 'Support'; }
    } else {
      if (tags.includes('Marksman')) { position = 'adc'; role = 'ADC'; }
      else if (tags.includes('Support')) { position = 'support'; role = 'Support'; }
      else if (tags.includes('Tank') || tags.includes('Fighter')) { position = 'top'; role = 'Top'; }
      else { position = 'mid'; role = 'Mid'; }
    }

    const opggName = toOpGgName(id);
    let opggData = await fetchOpGgBuild(opggName, position);

    // If initial position returned nothing, try alternate common role
    if (!opggData && (position === 'mid' || position === 'top')) {
      const altPos = position === 'mid' ? 'top' : 'mid';
      opggData = await fetchOpGgBuild(opggName, altPos);
      if (opggData) {
        position = altPos;
        role = altPos === 'top' ? 'Top' : 'Mid';
      }
    }

    let buildData;
    if (opggData) {
      buildData = opggData;
      opggCount++;
      process.stdout.write(`✓ [${id}: ${opggData.firstItemName} -> ${opggData.secondItemName} -> ${opggData.thirdItemName}] `);
    } else {
      buildData = generateFallbackBuild(champ, role);
      fallbackCount++;
      process.stdout.write(`• [${id}: Fallback] `);
    }

    // Determine damage type & playstyle
    const isAP = tags.includes('Mage') || champ.info?.magic > 6;
    const damageType = isAP ? 'Magic Heavy' : 'Physical Heavy';
    const playstyle = role === 'ADC' ? 'Sustained Marksman'
      : role === 'Support' ? (isAP ? 'Enchanter / Peeler' : 'Engage Vanguard')
      : isAP ? 'Control Mage'
      : tags.includes('Tank') ? 'Teamfight Tank'
      : tags.includes('Assassin') ? 'Burst Assassin'
      : 'Bruiser / Skirmisher';

    const kInfo = KEYSTONE_INFO[buildData.keystoneName] || {
      tldr: 'Key combat rune maximizing damage and engagement utility.',
      why: 'Optimal keystone for trading cadence and primary spell kit.'
    };

    const isMarksman = role === 'ADC';
    const isSupportRole = role === 'Support';
    const statShards = isMarksman
      ? '+10% Attack Speed • +9 Adaptive Force • +65 Health'
      : isSupportRole
      ? '+8 Ability Haste • +9 Adaptive Force • +65 Health'
      : isAP
      ? '+8 Ability Haste • +9 Adaptive Force • +65 Health'
      : '+9 Adaptive Force • +9 Adaptive Force • +65 Health';

    builds[id] = {
      championId: id,
      role,
      secondaryRole: role === 'Top' ? 'Mid' : role === 'Mid' ? 'Top' : 'Support',
      playstyle,
      damageType,
      identity: `${name} controls the match through high-impact ${tags.join(' / ')} kit mechanics and tactical power spikes.`,
      winCondition: `Coordinate with your team around key Dragon/Baron objectives, play around your core item spikes, and punish positioning mistakes.`,
      powerSpikes: [
        'Early Back Component Spike',
        `1st Item ${buildData.firstItemName} Spike`,
        `2-Item ${buildData.secondItemName} Core Synergy`
      ],
      skillMaxOrder: buildData.skillMaxOrder,
      skillMaxReason: `Max primary damage and waveclear ability first to accelerate lane tempo and cooldown reduction.`,
      starter: buildData.starter,
      firstItemId: String(buildData.firstItemId),
      firstItemName: buildData.firstItemName,
      secondItemId: String(buildData.secondItemId),
      secondItemName: buildData.secondItemName,
      thirdItemId: String(buildData.thirdItemId),
      thirdItemName: buildData.thirdItemName,
      bootsId: String(buildData.bootsId),
      bootsName: buildData.bootsName,
      bootsWhy: getBootsWhy(buildData.bootsName),
      primaryTree: buildData.primaryTree,
      keystoneName: buildData.keystoneName,
      keystoneTldr: kInfo.tldr,
      keystoneWhy: kInfo.why,
      secondaryTree: buildData.secondaryTree,
      statShards
    };
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n🎉 Done in ${duration}s!`);
  console.log(`✓ Authentic OP.GG builds: ${opggCount}`);
  console.log(`✓ Fallback builds: ${fallbackCount}`);

  const payload = {
    patch: latestVersion,
    generatedAt: new Date().toISOString(),
    source: 'OP.GG Ranked Solo Queue Analysis via MCP API',
    builds
  };

  const outPath = path.resolve('public', 'data', 'meta-builds-latest.json');
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`✓ Saved ${Object.keys(builds).length} champion builds to ${outPath}`);
}

main().catch(console.error);
