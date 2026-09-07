#!/usr/bin/env node
/**
 * HexCards Anti-Slop League Desktop Bridge Sidecar
 * 
 * Connects to the local League Client Update (LCU) REST API over 127.0.0.1.
 * Allows HexCards to auto-import Item Sets and Runes directly into the running game client.
 * 
 * - Zero ads, zero tracking, zero bloat
 * - Uses native Node.js http/https (zero npm dependencies required)
 * - Compliant with Riot Games third-party out-of-game API policies
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { execSync, exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow local LCU self-signed TLS certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BRIDGE_PORT = 4173;
const LCU_AGENT = new https.Agent({ rejectUnauthorized: false });

let lcuCredentials = null;
let lastCheckTime = 0;

/**
 * Searches for the running LeagueClientUx process to extract dynamic port and auth token.
 */
function findLcuCredentials() {
  const now = Date.now();
  if (lcuCredentials && now - lastCheckTime < 5000) {
    return lcuCredentials;
  }
  lastCheckTime = now;

  // 1. Check lockfile in common install paths
  const commonPaths = [
    'C:/Riot Games/League of Legends/lockfile',
    'D:/Riot Games/League of Legends/lockfile',
    'E:/Riot Games/League of Legends/lockfile',
    'C:/Program Files/Riot Games/League of Legends/lockfile'
  ];

  for (const lockPath of commonPaths) {
    if (fs.existsSync(lockPath)) {
      try {
        const content = fs.readFileSync(lockPath, 'utf8');
        const parts = content.split(':');
        if (parts.length >= 5) {
          lcuCredentials = {
            port: parts[2],
            token: parts[3],
            protocol: parts[4] || 'https'
          };
          return lcuCredentials;
        }
      } catch {
        // continue
      }
    }
  }

  // 2. Fallback: Query Windows WMIC / PowerShell for running process arguments
  try {
    const output = execSync(
      'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name = \'LeagueClientUx.exe\'\\" | Select-Object -ExpandProperty CommandLine"',
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000 }
    );

    const portMatch = output.match(/--app-port=([0-9]+)/);
    const tokenMatch = output.match(/--remoting-auth-token=([a-zA-Z0-9_\-]+)/);

    if (portMatch && tokenMatch) {
      lcuCredentials = {
        port: portMatch[1],
        token: tokenMatch[1],
        protocol: 'https'
      };
      return lcuCredentials;
    }
  } catch {
    // Process not found or query timed out
  }

  lcuCredentials = null;
  return null;
}

/**
 * Helper to call local LCU REST API.
 * Uses the https module with LCU_AGENT to handle the client's self-signed certificate.
 */
function callLcu(endpoint, method = 'GET', body = null) {
  const creds = findLcuCredentials();
  if (!creds) {
    return Promise.reject(new Error('League of Legends client is not currently running.'));
  }

  const authHeader = 'Basic ' + Buffer.from(`riot:${creds.token}`).toString('base64');
  const payload = body ? JSON.stringify(body) : null;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: '127.0.0.1',
        port: Number(creds.port),
        path: endpoint,
        method,
        agent: LCU_AGENT,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`LCU Error (${res.statusCode}): ${data}`));
            return;
          }
          const ct = res.headers['content-type'] || '';
          if (ct.includes('application/json') && data) {
            try { resolve(JSON.parse(data)); }
            catch { resolve(data); }
          } else {
            resolve(data);
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

/**
 * Maps HexCards RuneKitGuide shape → LCU perk page fields.
 * The frontend sends { primaryTree, keystone: { name }, primaryMinors, secondaryTree, secondaryMinors, statShards }
 * The LCU expects { primaryStyleId, subStyleId, selectedPerkIds: number[] }
 */
const STYLE_IDS = {
  Precision: 8000,
  Domination: 8100,
  Sorcery: 8200,
  Inspiration: 8300,
  Resolve: 8400
};

const PERK_NAME_TO_ID = {
  // Keystones
  'Press the Attack': 8005, 'Lethal Tempo': 8008, 'Fleet Footwork': 8021, 'Conqueror': 8010,
  'Electrocute': 8112, 'Dark Harvest': 8128, 'Hail of Blades': 9923,
  'Summon Aery': 8214, 'Arcane Comet': 8229, 'Phase Rush': 8230,
  'Grasp of the Undying': 8437, 'Aftershock': 8439, 'Guardian': 8465,
  'Glacial Augment': 8351, 'First Strike': 8369, 'Unsealed Spellbook': 8360,

  // Precision minors
  'Absorb Life': 9101, 'Overheal': 9101, 'Triumph': 9111, 'Presence of Mind': 8009,
  'Legend: Alacrity': 9104, 'Legend: Haste': 9105, 'Legend: Bloodline': 9103,
  'Coup de Grace': 8014, 'Cut Down': 8017, 'Last Stand': 8299,

  // Domination minors
  'Cheap Shot': 8126, 'Taste of Blood': 8139, 'Sudden Impact': 8143,
  'Zombie Ward': 8136, 'Ghost Poro': 8120, 'Eyeball Collection': 8138,
  'Sixth Sense': 8137, 'Grisly Mementos': 8140, 'Deep Ward': 8141,
  'Treasure Hunter': 8135, 'Relentless Hunter': 8105, 'Ultimate Hunter': 8106,
  'Ingenious Hunter': 8134,

  // Sorcery minors
  'Nullifying Orb': 8224, 'Manaflow Band': 8226, 'Nimbus Cloak': 8275,
  'Transcendence': 8210, 'Celerity': 8234, 'Absolute Focus': 8233,
  'Scorch': 8237, 'Waterwalking': 8232, 'Gathering Storm': 8236,

  // Resolve minors
  'Demolish': 8446, 'Font of Life': 8463, 'Shield Bash': 8401,
  'Conditioning': 8429, 'Second Wind': 8444, 'Bone Plating': 8473,
  'Overgrowth': 8451, 'Revitalize': 8453, 'Unflinching': 8242,

  // Inspiration minors
  'Hextech Flashtraption': 8306, 'Magical Footwear': 8304, 'Cash Back': 8321,
  'Triple Tonic': 8313, 'Time Warp Tonic': 8352, 'Biscuit Delivery': 8345,
  'Biscuits of Everlasting Will': 8345,
  'Cosmic Insight': 8347, 'Approach Velocity': 8410, 'Jack of All Trades': 8316,

  // Stat shards (Modern Season 14+ rework)
  'Adaptive Force': 5008, 'Attack Speed': 5005, 'Ability Haste': 5007,
  'Move Speed': 5010, 'Movement Speed': 5010, 'Health (Scaling)': 5001, 'Scaling Health': 5001,
  'Tenacity and Slow Resist': 5013, 'Tenacity': 5013,
  'Health': 5011, 'Flat Health': 5011
};

function resolveRunePerkId(name) {
  if (!name) return null;
  // Clean prefix numbers/symbols (e.g. "+8 Adaptive Force" -> "Adaptive Force")
  const cleanName = name.replace(/^[+\d%.\s]+/, '').trim();

  // Exact match
  if (PERK_NAME_TO_ID[name]) return PERK_NAME_TO_ID[name];
  if (PERK_NAME_TO_ID[cleanName]) return PERK_NAME_TO_ID[cleanName];

  // Case-insensitive search
  const lower = name.toLowerCase();
  const cleanLower = cleanName.toLowerCase();
  for (const [key, id] of Object.entries(PERK_NAME_TO_ID)) {
    const kLower = key.toLowerCase();
    if (kLower === lower || kLower === cleanLower) return id;
  }
  // Partial match
  for (const [key, id] of Object.entries(PERK_NAME_TO_ID)) {
    const kLower = key.toLowerCase();
    if (cleanLower.includes(kLower) || kLower.includes(cleanLower)) return id;
  }
  return null;
}

/**
 * Translates a HexCards RuneKitGuide into the LCU-ready shape.
 */
function runeKitToLcuPerks(runeKit) {
  if (!runeKit) return null;

  // If it's already in LCU shape (has selectedPerkIds), pass through
  if (runeKit.selectedPerkIds && Array.isArray(runeKit.selectedPerkIds)) {
    return {
      primaryStyleId: runeKit.primaryStyleId || 8000,
      subStyleId: runeKit.subStyleId || 8400,
      selectedPerkIds: runeKit.selectedPerkIds
    };
  }

  const primaryStyleId = STYLE_IDS[runeKit.primaryTree] || 8000;
  const subStyleId = STYLE_IDS[runeKit.secondaryTree] || 8400;

  const perkIds = [];

  // 1. Keystone
  const keystoneId = resolveRunePerkId(runeKit.keystone?.name);
  if (keystoneId) perkIds.push(keystoneId);
  else perkIds.push(8010); // fallback Conqueror

  // 2. Primary minors (3 slots)
  const primaryMinors = runeKit.primaryMinors || [];
  for (const minor of primaryMinors.slice(0, 3)) {
    const id = resolveRunePerkId(minor.name);
    if (id) perkIds.push(id);
  }

  // 3. Secondary minors (2 slots)
  const secondaryMinors = runeKit.secondaryMinors || [];
  for (const minor of secondaryMinors.slice(0, 2)) {
    const id = resolveRunePerkId(minor.name);
    if (id) perkIds.push(id);
  }

  // 4. Stat shards — parse from the "statShards" text field or use defaults
  // Formats: "Adaptive Force / Adaptive Force / Armor" or "+8 Adaptive Force • +2% Movement Speed • +65 Health"
  const shardDefaults = [5008, 5008, 5002];
  if (runeKit.statShards && typeof runeKit.statShards === 'string') {
    const parts = runeKit.statShards.split(/[/•|,]/).map(s => s.trim()).filter(Boolean);
    parts.forEach((part, i) => {
      if (i < 3) {
        const id = resolveRunePerkId(part);
        if (id) shardDefaults[i] = id;
      }
    });
  }
  perkIds.push(...shardDefaults);

  return { primaryStyleId, subStyleId, selectedPerkIds: perkIds };
}

/**
 * HTTP Server setup for the HexCards Web App connection.
 */
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${BRIDGE_PORT}`);

  try {
    // 1. Status Check
    if (url.pathname === '/api/status' && req.method === 'GET') {
      const creds = findLcuCredentials();
      if (!creds) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ connected: false, message: 'League client not detected.' }));
        return;
      }

      try {
        const summoner = await callLcu('/lol-summoner/v1/current-summoner');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          connected: true,
          summonerName: summoner.gameName ? `${summoner.gameName}#${summoner.tagLine}` : summoner.displayName,
          accountId: summoner.accountId,
          port: creds.port
        }));
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          connected: true,
          summonerName: 'League Client Active',
          port: creds.port
        }));
      }
      return;
    }

    // 2. Import Item Set & Runes
    if (url.pathname === '/api/import-all' && req.method === 'POST') {
      let bodyData = '';
      for await (const chunk of req) {
        bodyData += chunk;
      }
      const { itemSet, runeKit } = JSON.parse(bodyData);

      const summoner = await callLcu('/lol-summoner/v1/current-summoner');
      const accountId = summoner.accountId;

      // 1. Ingest Item Set into LCU via /lol-item-sets/v1/item-sets/{accountId}/sets
      if (itemSet) {
        let existingItemSets = { itemSets: [] };
        try {
          existingItemSets = await callLcu(`/lol-item-sets/v1/item-sets/${accountId}/sets`);
        } catch (e) {
          console.warn('[Bridge] Could not fetch existing item sets:', e.message);
        }

        const formattedSet = {
          title: itemSet.title || 'HexCards Build',
          type: 'custom',
          map: 'any',
          mode: 'any',
          priority: false,
          sortrank: 1,
          associatedMaps: itemSet.associatedMaps || [11, 12],
          associatedChampions: itemSet.associatedChampions || [],
          blocks: itemSet.blocks || []
        };

        // Replace any existing set with same title, or append
        const filtered = (existingItemSets.itemSets || []).filter(s => s.title !== formattedSet.title);
        filtered.unshift(formattedSet);

        await callLcu(`/lol-item-sets/v1/item-sets/${accountId}/sets`, 'PUT', {
          accountId: Number(accountId),
          itemSets: filtered,
          timestamp: Date.now()
        });
        console.log(`[Bridge] Item set "${formattedSet.title}" successfully saved to LCU.`);
      }

      // 2. Ingest Runes Page into LCU (if provided)
      let runeSuccess = false;
      if (runeKit) {
        const lcuPerks = runeKitToLcuPerks(runeKit);
        if (lcuPerks && lcuPerks.selectedPerkIds.length > 0) {
          try {
            const currentPages = await callLcu('/lol-perks/v1/pages');
            const editablePage = (currentPages || []).find(p => p.isEditable);

            const pagePayload = {
              name: `HexCards ${itemSet?.title ? itemSet.title.replace('HexCards: ', '') : 'Tactics'}`,
              primaryStyleId: lcuPerks.primaryStyleId,
              subStyleId: lcuPerks.subStyleId,
              selectedPerkIds: lcuPerks.selectedPerkIds,
              current: true
            };

            let targetPageId = null;
            if (editablePage) {
              targetPageId = editablePage.id;
              try {
                await callLcu(`/lol-perks/v1/pages/${editablePage.id}`, 'PUT', { ...pagePayload, id: editablePage.id });
                runeSuccess = true;
              } catch {
                await callLcu(`/lol-perks/v1/pages/${editablePage.id}`, 'DELETE');
                const created = await callLcu('/lol-perks/v1/pages', 'POST', pagePayload);
                targetPageId = created?.id;
                runeSuccess = true;
              }
            } else {
              const created = await callLcu('/lol-perks/v1/pages', 'POST', pagePayload);
              targetPageId = created?.id;
              runeSuccess = true;
            }

            if (targetPageId) {
              await callLcu('/lol-perks/v1/currentpage', 'PUT', targetPageId.toString()).catch(() => null);
            }
            console.log(`[Bridge] Runes imported: ${lcuPerks.selectedPerkIds.length} perks set.`);
          } catch (runeErr) {
            console.warn('[Bridge] Runes import warning (page locked or quota reached):', runeErr.message);
          }
        } else {
          console.warn('[Bridge] Rune kit provided but could not resolve any perk IDs.');
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: runeSuccess
          ? `Imported "${itemSet?.title || 'Build'}" & Runes to League Client!`
          : `Imported "${itemSet?.title || 'Build'}" to your in-game shop!`
      }));
      return;
    }

    // 3. Champ Select Session Polling
    if (url.pathname === '/api/champ-select' && req.method === 'GET') {
      try {
        let session = null;
        try {
          session = await callLcu('/lol-champ-select/v1/session');
        } catch {
          // not in champ select session
        }

        let gameflow = null;
        try {
          gameflow = await callLcu('/lol-gameflow/v1/session');
        } catch {
          // gameflow not available
        }

        const isChampSelectPhase = gameflow?.phase === 'ChampSelect';
        const isInGamePhase = gameflow?.phase === 'InProgress' || gameflow?.phase === 'GameStart';

        if (!session && !isChampSelectPhase && !isInGamePhase) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ inChampSelect: false }));
          return;
        }

        // Extract local player's champion info
        let championId = 0;
        let teamId = 0;
        let assignedPosition = '';

        if (session) {
          const localCellId = session.localPlayerCellId;
          if (localCellId !== undefined && session.myTeam) {
            const me = session.myTeam.find(p => p.cellId === localCellId);
            if (me) {
              championId = me.championId || me.championPickIntent || 0;
              teamId = me.team || 0;
              assignedPosition = me.assignedPosition || '';
            }
          }

          // Check actions array if championId is still 0
          if (!championId && session.actions) {
            for (const group of session.actions) {
              for (const action of group) {
                if (action.actorCellId === localCellId && (action.type === 'pick' || action.type === 'vote') && action.championId > 0) {
                  championId = action.championId;
                }
              }
            }
          }
        }

        // Fallback: check /lol-champ-select/v1/current-champion
        if (!championId) {
          try {
            const currentChamp = await callLcu('/lol-champ-select/v1/current-champion');
            if (typeof currentChamp === 'number' && currentChamp > 0) {
              championId = currentChamp;
            }
          } catch {}
        }

        // Fallback: check gameflow playerChampionSelections if in game
        if (!championId && gameflow?.gameData?.playerChampionSelections) {
          try {
            const summoner = await callLcu('/lol-summoner/v1/current-summoner');
            if (summoner) {
              const mySelection = gameflow.gameData.playerChampionSelections.find(
                s => s.summonerInternalName === summoner.internalName || s.summonerId === summoner.summonerId
              );
              if (mySelection?.championId) {
                championId = mySelection.championId;
              }
            }
          } catch {}
        }

        // Extract enemy champions and direct lane opponent
        const enemyChampions = [];
        let opponentChampionId = 0;

        if (session?.theirTeam && Array.isArray(session.theirTeam)) {
          for (const enemy of session.theirTeam) {
            const eChampId = enemy.championId || 0;
            if (eChampId > 0) {
              enemyChampions.push({
                championId: eChampId,
                assignedPosition: enemy.assignedPosition || '',
                cellId: enemy.cellId
              });
            }
          }

          // Determine direct lane opponent if position matches
          if (assignedPosition) {
            const laneMatch = session.theirTeam.find(
              e => (e.championId > 0) && e.assignedPosition && e.assignedPosition.toLowerCase() === assignedPosition.toLowerCase()
            );
            if (laneMatch) {
              opponentChampionId = laneMatch.championId;
            }
          }

          // Fallback for Practice Tool / single revealed enemy
          if (!opponentChampionId && enemyChampions.length === 1) {
            opponentChampionId = enemyChampions[0].championId;
          } else if (!opponentChampionId && enemyChampions.length > 0) {
            opponentChampionId = enemyChampions[0].championId;
          }
        }

        // Fallback: Check gameflow teamOne / teamTwo if in game
        if (enemyChampions.length === 0 && gameflow?.gameData) {
          try {
            const summoner = await callLcu('/lol-summoner/v1/current-summoner');
            const mySummId = summoner?.summonerId;
            const teamOne = gameflow.gameData.teamOne || [];
            const teamTwo = gameflow.gameData.teamTwo || [];

            const isTeamOne = teamOne.some(p => p.summonerId === mySummId);
            const enemyTeam = isTeamOne ? teamTwo : teamOne;

            for (const enemy of enemyTeam) {
              if (enemy.championId > 0) {
                enemyChampions.push({
                  championId: enemy.championId,
                  assignedPosition: enemy.selectedPosition || '',
                  summonerName: enemy.summonerName || ''
                });
              }
            }

            if (assignedPosition) {
              const match = enemyTeam.find(
                e => e.championId > 0 && e.selectedPosition && e.selectedPosition.toLowerCase() === assignedPosition.toLowerCase()
              );
              if (match) opponentChampionId = match.championId;
            }
            if (!opponentChampionId && enemyChampions.length > 0) {
              opponentChampionId = enemyChampions[0].championId;
            }
          } catch {}
        }

        // Detailed Queue and Game Mode Mapping
        const queueId = gameflow?.gameData?.queue?.id ?? null;
        let gameMode = 'Custom / Training';

        const QUEUE_NAMES = {
          0: 'Custom Game',
          400: 'Normal Draft (Summoner\'s Rift)',
          420: 'Ranked Solo/Duo (Summoner\'s Rift)',
          430: 'Blind Pick (Summoner\'s Rift)',
          440: 'Ranked Flex (Summoner\'s Rift)',
          450: 'ARAM (Howling Abyss)',
          490: 'Quickplay (Summoner\'s Rift)',
          700: 'Clash Tournament',
          830: 'Intro Bots (Co-op vs AI)',
          840: 'Beginner Bots (Co-op vs AI)',
          850: 'Intermediate Bots (Co-op vs AI)',
          900: 'ARURF',
          1700: 'Arena (2v2v2v2)',
          1710: 'Arena (2v2v2v2)',
          1900: 'Pick URF'
        };

        if (queueId !== null && QUEUE_NAMES[queueId]) {
          gameMode = QUEUE_NAMES[queueId];
        } else if (gameflow?.map?.gameMode === 'PRACTICETOOL' || session?.isCustomGame) {
          gameMode = 'Training Grounds (Practice Tool)';
        } else if (gameflow?.gameData?.queue?.description) {
          gameMode = gameflow.gameData.queue.description;
        } else if (gameflow?.map?.gameMode) {
          const modeMap = {
            'PRACTICETOOL': 'Training Grounds (Practice Tool)',
            'CLASSIC': "Summoner's Rift",
            'ARAM': 'ARAM (Howling Abyss)',
            'URF': 'Ultra Rapid Fire',
            'CHERRY': 'Arena (2v2v2v2)'
          };
          gameMode = modeMap[gameflow.map.gameMode] || gameflow.map.gameMode;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          inChampSelect: true,
          isInGame: isInGamePhase,
          championId,
          teamId,
          assignedPosition,
          gameMode,
          queueId,
          opponentChampionId,
          enemyChampions,
          timer: session?.timer || null
        }));
      } catch {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ inChampSelect: false }));
      }
      return;
    }

    // 4. Trigger Meta Builds Sync on demand
    if (url.pathname === '/api/sync-builds' && req.method === 'POST') {
      const scriptPath = path.resolve(__dirname, 'generateAllChampionBuilds.mjs');
      exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('[Bridge] Error during sync-builds:', error);
        } else {
          console.log('[Bridge] Successfully synced meta builds via OP.GG!');
        }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Build generation initiated via OP.GG live API.' }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  } catch (err) {
    console.error('[Bridge] Error handling request:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: err.message,
      message: err.message
    }));
  }
});

server.listen(BRIDGE_PORT, '127.0.0.1', () => {
  console.log('====================================================');
  console.log('⚡ HexCards League Client Desktop Bridge Running!');
  console.log(`⚡ Listening on http://127.0.0.1:${BRIDGE_PORT}`);
  console.log('⚡ Monitoring for LeagueClientUx.exe...');
  console.log('====================================================');
});
