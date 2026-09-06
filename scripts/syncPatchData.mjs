#!/usr/bin/env node
/**
 * Autonomous Riot Patch Synchronization Script
 * 
 * Compares current live Data Dragon version against previous version,
 * detects champion and item balance deltas, and updates:
 *   - public/data/patch-diffs-latest.json
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

async function run() {
  console.log('⚡ [HexCards Sync] Checking Riot Data Dragon versions...');
  const versions = await fetchJson(`${BASE_URL}/api/versions.json`);
  const latestVer = versions[0];
  const previousVer = versions[1];

  console.log(`⚡ [HexCards Sync] Latest version: ${latestVer} | Previous version: ${previousVer}`);

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Load existing patch diffs if available to preserve custom tactical commentary
  let existingDiffs = { champions: {}, items: {} };
  if (fs.existsSync(PATCH_DIFFS_FILE)) {
    try {
      existingDiffs = JSON.parse(fs.readFileSync(PATCH_DIFFS_FILE, 'utf-8'));
    } catch (e) {
      console.warn('Could not parse existing patch diffs:', e.message);
    }
  }

  console.log(`⚡ [HexCards Sync] Fetching item datasets for ${latestVer} and ${previousVer}...`);
  const [latestItemsData, prevItemsData] = await Promise.all([
    fetchJson(`${BASE_URL}/cdn/${latestVer}/data/en_US/item.json`).catch(() => null),
    fetchJson(`${BASE_URL}/cdn/${previousVer}/data/en_US/item.json`).catch(() => null)
  ]);

  const itemsDiff = { ...existingDiffs.items };

  if (latestItemsData && prevItemsData) {
    const latestItems = latestItemsData.data;
    const prevItems = prevItemsData.data;

    for (const [id, item] of Object.entries(latestItems)) {
      if (!item.gold?.purchasable || (item.maps && !item.maps['11'])) continue;
      const prev = prevItems[id];
      if (!prev) continue;

      const deltas = [];

      // Check gold cost delta
      if (item.gold?.total && prev.gold?.total && item.gold.total !== prev.gold.total) {
        const diff = item.gold.total - prev.gold.total;
        deltas.push({
          property: 'cost',
          label: 'Total Gold Cost',
          oldValue: prev.gold.total,
          newValue: item.gold.total,
          deltaText: `${diff > 0 ? '+' : ''}${diff}g Cost`,
          isPositive: diff < 0 // cheaper is positive
        });
      }

      // Check stats delta
      if (item.stats && prev.stats) {
        for (const [stat, val] of Object.entries(item.stats)) {
          const oldVal = prev.stats[stat];
          if (oldVal !== undefined && val !== oldVal) {
            const diff = val - oldVal;
            deltas.push({
              property: stat,
              label: stat.replace('Flat', '').replace('Mod', ''),
              oldValue: oldVal,
              newValue: val,
              deltaText: `${diff > 0 ? '+' : ''}${diff} ${stat.replace('Flat', '').replace('Mod', '')}`,
              isPositive: diff > 0
            });
          }
        }
      }

      if (deltas.length > 0) {
        const isOverallBuff = deltas.filter(d => d.isPositive).length >= deltas.filter(d => !d.isPositive).length;
        itemsDiff[id] = {
          id,
          name: item.name,
          type: isOverallBuff ? 'buff' : 'nerf',
          summary: deltas.map(d => `${d.label} changed to ${d.newValue} (${d.deltaText})`).join('. '),
          deltas
        };
      }
    }
  }

  const manifest = {
    version: latestVer,
    previousVersion: previousVer,
    releaseDate: new Date().toISOString().split('T')[0],
    summary: `Patch ${latestVer} balance changes and item tuning.`,
    champions: existingDiffs.champions || {},
    items: itemsDiff
  };

  fs.writeFileSync(PATCH_DIFFS_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✅ [HexCards Sync] Successfully updated ${PATCH_DIFFS_FILE} for patch ${latestVer}!`);
}

run().catch((err) => {
  console.error('❌ [HexCards Sync] Error running patch sync:', err);
  process.exit(1);
});
