#!/usr/bin/env node
/**
 * Patch change detector.
 *
 * Compares the live Data Dragon patch with the previous one and writes every
 * measurable change to public/data/patch-diffs-latest.json:
 *   - champion base stats (health, armor, attack damage, ... and per-level growth)
 *   - ability cooldowns, costs and ranges (passive + Q/W/E/R)
 *   - item gold cost and item stats (read from the item's stat block)
 *
 * The file is rebuilt from scratch every run, so it only ever describes the
 * current patch.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'public', 'data');
const PATCH_DIFFS_FILE = path.join(DATA_DIR, 'patch-diffs-latest.json');

const BASE_URL = 'https://ddragon.leagueoflegends.com';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json();
}

// ---------- helpers ----------

const round = (n) => Math.round(n * 1000) / 1000;

function fmt(n) {
  const r = round(n);
  return Number.isInteger(r) ? String(r) : String(r).replace(/0+$/, '');
}

/** Rate a change: +1 means the new value is better for the player, -1 worse. */
function rate(oldVal, newVal, higherIsBetter) {
  if (newVal === oldVal) return 0;
  return (newVal > oldVal) === higherIsBetter ? 1 : -1;
}

function directionFromScore(score) {
  if (score > 0) return 'buff';
  if (score < 0) return 'nerf';
  return 'neutral';
}

function overallType(changes) {
  const buffs = changes.filter((c) => c.direction === 'buff').length;
  const nerfs = changes.filter((c) => c.direction === 'nerf').length;
  if (buffs && !nerfs) return 'buff';
  if (nerfs && !buffs) return 'nerf';
  return 'adjusted';
}

// ---------- champions ----------

const CHAMP_STAT_LABELS = {
  hp: 'Base Health',
  hpperlevel: 'Health per Level',
  mp: 'Base Mana',
  mpperlevel: 'Mana per Level',
  movespeed: 'Move Speed',
  armor: 'Base Armor',
  armorperlevel: 'Armor per Level',
  spellblock: 'Base Magic Resist',
  spellblockperlevel: 'Magic Resist per Level',
  attackrange: 'Attack Range',
  hpregen: 'Health Regen',
  hpregenperlevel: 'Health Regen per Level',
  mpregen: 'Mana Regen',
  mpregenperlevel: 'Mana Regen per Level',
  attackdamage: 'Base Attack Damage',
  attackdamageperlevel: 'Attack Damage per Level',
  attackspeedperlevel: 'Attack Speed per Level',
  attackspeed: 'Base Attack Speed',
};

const SLOTS = ['Q', 'W', 'E', 'R'];

/**
 * Compare two per-rank arrays (e.g. cooldowns). Returns null when unchanged.
 */
function compareRanks(oldArr, newArr, higherIsBetter) {
  if (!Array.isArray(oldArr) || !Array.isArray(newArr)) return null;
  const a = oldArr.map(round);
  const b = newArr.map(round);
  if (a.length === b.length && a.every((v, i) => v === b[i])) return null;

  let score = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) score += rate(a[i], b[i], higherIsBetter);
  const show = (arr) => (arr.every((v) => v === arr[0]) ? fmt(arr[0]) : arr.map(fmt).join(' / '));
  return {
    from: show(a),
    to: show(b),
    direction: directionFromScore(score),
  };
}

function diffChampion(oldC, newC) {
  const changes = [];

  for (const [key, label] of Object.entries(CHAMP_STAT_LABELS)) {
    const o = oldC.stats?.[key];
    const n = newC.stats?.[key];
    if (typeof o !== 'number' || typeof n !== 'number' || round(o) === round(n)) continue;
    changes.push({
      slot: 'Stats',
      label,
      from: fmt(o),
      to: fmt(n),
      direction: directionFromScore(rate(o, n, true)),
    });
  }

  (newC.spells || []).forEach((spell, i) => {
    const prev = oldC.spells?.[i];
    if (!prev) return;
    const slot = SLOTS[i];
    const checks = [
      ['Cooldown', prev.cooldown, spell.cooldown, false, 's'],
      // Only compare costs when the resource didn't change type.
      ['Cost', prev.costType === spell.costType ? prev.cost : null, spell.cost, false, ''],
      ['Range', prev.range, spell.range, true, ''],
    ];
    for (const [what, o, n, higherIsBetter, unit] of checks) {
      // Global ranges (25000+) are placeholders, not real values.
      if (what === 'Range' && Array.isArray(n) && n.some((v) => v >= 25000)) continue;
      if (what === 'Cost' && Array.isArray(n) && n.every((v) => v === 0) && Array.isArray(o) && o.every((v) => v === 0)) continue;
      const cmp = compareRanks(o, n, higherIsBetter);
      if (!cmp) continue;
      changes.push({
        slot,
        label: `${spell.name} ${what.toLowerCase()}`,
        from: cmp.from + unit,
        to: cmp.to + unit,
        direction: cmp.direction,
      });
    }
  });

  return changes;
}

// ---------- items ----------

/** Read "<stats><attention>40</attention> Attack Damage<br>...</stats>" into { 'Attack Damage': {value, pct} } */
function parseItemStats(description = '') {
  const block = description.match(/<stats>([\s\S]*?)<\/stats>/i);
  const out = {};
  if (!block) return out;
  const re = /<attention>\s*([\d.]+)(%?)\s*<\/attention>\s*([^<]+)/gi;
  let m;
  while ((m = re.exec(block[1]))) {
    const name = m[3].trim();
    if (!name) continue;
    out[name] = { value: parseFloat(m[1]), pct: m[2] === '%' };
  }
  return out;
}

function diffItem(oldI, newI) {
  const changes = [];
  const oldGold = oldI.gold?.total;
  const newGold = newI.gold?.total;
  if (typeof oldGold === 'number' && typeof newGold === 'number' && oldGold !== newGold) {
    changes.push({
      slot: 'Cost',
      label: 'Total cost',
      from: `${oldGold}g`,
      to: `${newGold}g`,
      direction: directionFromScore(rate(oldGold, newGold, false)),
    });
  }

  const oldStats = parseItemStats(oldI.description);
  const newStats = parseItemStats(newI.description);
  const names = new Set([...Object.keys(oldStats), ...Object.keys(newStats)]);
  for (const name of names) {
    const o = oldStats[name];
    const n = newStats[name];
    const pct = (o || n).pct ? '%' : '';
    const ov = o ? o.value : 0;
    const nv = n ? n.value : 0;
    if (round(ov) === round(nv)) continue;
    changes.push({
      slot: 'Stats',
      label: name,
      from: o ? `${fmt(ov)}${pct}` : 'none',
      to: n ? `${fmt(nv)}${pct}` : 'removed',
      direction: directionFromScore(rate(ov, nv, true)),
    });
  }
  return changes;
}

function isSummonersRiftItem(item) {
  return item.gold?.purchasable && (!item.maps || item.maps['11']) && !item.requiredChampion && !item.requiredAlly;
}

// ---------- main ----------

async function run() {
  console.log('⚡ [HexCards Sync] Checking Riot Data Dragon versions...');
  const versions = await fetchJson(`${BASE_URL}/api/versions.json`);
  const latestVer = versions[0];
  const previousVer = versions[1];
  console.log(`⚡ [HexCards Sync] Latest version: ${latestVer} | Previous version: ${previousVer}`);

  fs.mkdirSync(DATA_DIR, { recursive: true });

  console.log(`⚡ [HexCards Sync] Fetching champion and item data for ${latestVer} and ${previousVer}...`);
  const [latestChamps, prevChamps, latestItems, prevItems] = await Promise.all([
    fetchJson(`${BASE_URL}/cdn/${latestVer}/data/en_US/championFull.json`),
    fetchJson(`${BASE_URL}/cdn/${previousVer}/data/en_US/championFull.json`),
    fetchJson(`${BASE_URL}/cdn/${latestVer}/data/en_US/item.json`),
    fetchJson(`${BASE_URL}/cdn/${previousVer}/data/en_US/item.json`),
  ]);

  const champions = {};
  const newChampions = [];
  for (const [id, champ] of Object.entries(latestChamps.data)) {
    const prev = prevChamps.data[id];
    if (!prev) {
      newChampions.push(id);
      continue;
    }
    const changes = diffChampion(prev, champ);
    if (changes.length) {
      champions[id] = { id, name: champ.name, type: overallType(changes), changes };
    }
  }

  const items = {};
  const seenNames = new Set();
  for (const [id, item] of Object.entries(latestItems.data)) {
    if (!isSummonersRiftItem(item)) continue;
    const prev = prevItems.data[id];
    if (!prev || seenNames.has(item.name)) continue;
    const changes = diffItem(prev, item);
    if (changes.length) {
      seenNames.add(item.name);
      items[id] = { id, name: item.name, type: overallType(changes), changes };
    }
  }

  const champCount = Object.keys(champions).length;
  const itemCount = Object.keys(items).length;
  const manifest = {
    version: latestVer,
    previousVersion: previousVer,
    releaseDate: new Date().toISOString().split('T')[0],
    source: 'Riot Data Dragon (champion stats, ability cooldowns/costs/ranges, item stats and cost)',
    summary: `${champCount} champion${champCount === 1 ? '' : 's'} and ${itemCount} item${itemCount === 1 ? '' : 's'} changed in ${latestVer}.`,
    newChampions,
    champions,
    items,
  };

  // Keep the original release date for this patch so reruns don't rewrite the file.
  if (fs.existsSync(PATCH_DIFFS_FILE)) {
    try {
      const current = JSON.parse(fs.readFileSync(PATCH_DIFFS_FILE, 'utf-8'));
      if (current.version === latestVer && current.releaseDate) {
        manifest.releaseDate = current.releaseDate;
      }
    } catch {
      // overwrite unreadable file
    }
  }
  fs.writeFileSync(PATCH_DIFFS_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✅ [HexCards Sync] ${manifest.summary} Saved to ${PATCH_DIFFS_FILE}`);
}

run().catch((err) => {
  console.error('❌ [HexCards Sync] Error running patch sync:', err);
  process.exit(1);
});
