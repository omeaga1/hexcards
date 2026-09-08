import { ChampionDetail, TacticalGuide, ItemData, RuneKitGuide } from '../types';

export interface RiotItemSetItem {
  id: string;
  count: number;
}

export interface RiotItemSetBlock {
  type: string;
  recMath?: boolean;
  minSummonerLevel?: number;
  maxSummonerLevel?: number;
  showIfSummonerSpell?: string;
  hideIfSummonerSpell?: string;
  items: RiotItemSetItem[];
}

export interface RiotItemSet {
  title: string;
  type?: string;
  map?: string;
  mode?: string;
  priority?: boolean;
  sortrank?: number;
  associatedMaps: number[];
  associatedChampions: number[];
  blocks: RiotItemSetBlock[];
}

export interface RiotPerkPage {
  name: string;
  primaryStyleId: number;
  subStyleId: number;
  selectedPerkIds: number[];
  current: boolean;
}

export const RUNE_STYLE_IDS: Record<string, number> = {
  Precision: 8000,
  Domination: 8100,
  Sorcery: 8200,
  Resolve: 8400,
  Inspiration: 8300
};

export const KEYSTONE_IDS: Record<string, number> = {
  'Press the Attack': 8005,
  'Lethal Tempo': 8008,
  'Fleet Footwork': 8021,
  'Conqueror': 8010,
  'Electrocute': 8112,
  'Dark Harvest': 8128,
  'Hail of Blades': 9923,
  'Summon Aery': 8214,
  'Arcane Comet': 8229,
  'Phase Rush': 8230,
  'Grasp of the Undying': 8437,
  'Aftershock': 8439,
  'Guardian': 8465,
  'Glacial Augment': 8351,
  'First Strike': 8369,
  'Unsealed Spellbook': 8360
};

// Full minor rune name → ID map (all trees)
export const RUNE_IDS: Record<string, number> = {
  // Precision row 1
  'Absorb Life': 9101,
  'Overheal': 9101,
  'Triumph': 9111,
  'Presence of Mind': 8009,
  // Precision row 2
  'Legend: Alacrity': 9104,
  'Legend: Haste': 9105,
  'Legend: Bloodline': 9103,
  // Precision row 3
  'Coup de Grace': 8014,
  'Cut Down': 8017,
  'Last Stand': 8299,

  // Domination row 1
  'Cheap Shot': 8126,
  'Taste of Blood': 8139,
  'Sudden Impact': 8143,
  // Domination row 2
  'Zombie Ward': 8136,
  'Ghost Poro': 8120,
  'Eyeball Collection': 8138,
  'Sixth Sense': 8137,
  'Grisly Mementos': 8140,
  'Deep Ward': 8141,
  // Domination row 3
  'Treasure Hunter': 8135,
  'Ingenious Hunter': 8134,
  'Relentless Hunter': 8105,
  'Ultimate Hunter': 8106,

  // Sorcery row 1
  'Nullifying Orb': 8224,
  'Manaflow Band': 8226,
  'Nimbus Cloak': 8275,
  // Sorcery row 2
  'Transcendence': 8210,
  'Celerity': 8234,
  'Absolute Focus': 8233,
  // Sorcery row 3
  'Scorch': 8237,
  'Waterwalking': 8232,
  'Gathering Storm': 8236,

  // Resolve row 1
  'Demolish': 8446,
  'Font of Life': 8463,
  'Shield Bash': 8401,
  // Resolve row 2
  'Conditioning': 8429,
  'Second Wind': 8444,
  'Bone Plating': 8473,
  // Resolve row 3
  'Overgrowth': 8451,
  'Revitalize': 8453,
  'Unflinching': 8242,

  // Inspiration row 1
  'Hextech Flashtraption': 8306,
  'Magical Footwear': 8304,
  'Cash Back': 8321,
  // Inspiration row 2
  'Triple Tonic': 8313,
  'Time Warp Tonic': 8352,
  'Biscuit Delivery': 8345,
  'Biscuits of Everlasting Will': 8345,
  // Inspiration row 3
  'Cosmic Insight': 8347,
  'Approach Velocity': 8410,
  'Jack of All Trades': 8316,
};

// Stat shard IDs (Modern Season 14+ rework)
// Offense (Slot 4): Adaptive Force=5008, Attack Speed=5005, Ability Haste=5007
// Flex (Slot 5): Adaptive Force=5008, Move Speed=5010, Scaling Health=5001
// Defense (Slot 6): Flat Health=5011, Tenacity & Slow Resist=5013, Scaling Health=5001
export const STAT_SHARD_ADAPTIVE = 5008;
export const STAT_SHARD_ATTACK_SPEED = 5005;
export const STAT_SHARD_ABILITY_HASTE = 5007;
export const STAT_SHARD_MOVE_SPEED = 5010;
export const STAT_SHARD_HEALTH_SCALING = 5001;
export const STAT_SHARD_HEALTH_FLAT = 5011;
export const STAT_SHARD_TENACITY = 5013;

const BRIDGE_API_URL = 'http://127.0.0.1:4173';

/**
 * Resolves an item ID to a valid purchasable shop item ID.
 * Transforms unpurchasable items (e.g. Seraph's, Muramana, Diadem of Songs)
 * back to their base purchasable recipe so the League shop displays them correctly.
 */
function toPurchasableItemId(itemId: string, allItems?: Record<string, ItemData>): string {
  const UNPURCHASABLE_MAP: Record<string, string> = {
    '3040': '3003', // Seraph's Embrace -> Archangel's Staff
    '3042': '3004', // Muramana -> Manamune
    '3121': '3119', // Fimbulwinter -> Winter's Approach
    '2530': '2526', // Diadem of Songs -> base item
  };

  if (UNPURCHASABLE_MAP[itemId]) {
    return UNPURCHASABLE_MAP[itemId];
  }

  if (allItems && allItems[itemId]) {
    const item = allItems[itemId];
    // If not purchasable and has a special recipe, use the base recipe item
    if (item.gold && item.gold.purchasable === false && (item as any).specialRecipe) {
      return String((item as any).specialRecipe);
    }
  }

  return itemId;
}

/**
 * Creates an official Riot Item Set Block with strict schema adherence.
 * Avoids duplicate item IDs and ensures all standard Riot block properties are present.
 */
function createRiotBlock(
  type: string,
  rawItems: RiotItemSetItem[],
  allItems?: Record<string, ItemData>,
  recMath = false
): RiotItemSetBlock {
  const seen = new Set<string>();
  const items: RiotItemSetItem[] = [];

  for (const item of rawItems) {
    if (!item || !item.id) continue;
    const resolvedId = toPurchasableItemId(String(item.id), allItems);
    if (!seen.has(resolvedId)) {
      seen.add(resolvedId);
      items.push({ id: resolvedId, count: Number(item.count) || 1 });
    }
  }

  return {
    type,
    recMath,
    minSummonerLevel: -1,
    maxSummonerLevel: -1,
    showIfSummonerSpell: '',
    hideIfSummonerSpell: '',
    items
  };
}

/**
 * Generates an official Riot-compatible Item Set object from HexCards data.
 */
export function generateRiotItemSet(
  champion: ChampionDetail,
  tactics: TacticalGuide,
  allItems: Record<string, ItemData>
): RiotItemSet {
  const champKeyNum = parseInt(champion.key) || 0;
  const isSupport = tactics.role === 'Support';

  // 1. Starter Block
  const starterItems: RiotItemSetItem[] = [];
  if (isSupport) {
    starterItems.push({ id: '3865', count: 1 }); // World Atlas
    starterItems.push({ id: '2003', count: 2 }); // Health Potions
  } else if (tactics.role === 'Jungle') {
    starterItems.push({ id: '1102', count: 1 }); // Gustwalker Hatchling
    starterItems.push({ id: '2003', count: 1 });
  } else if (tactics.damageType === 'Magic Heavy') {
    starterItems.push({ id: '1056', count: 1 }); // Doran's Ring
    starterItems.push({ id: '2003', count: 2 });
  } else if (tactics.playstyle === 'Teamfight Tank' || tactics.playstyle === 'Lane Bully') {
    starterItems.push({ id: '1054', count: 1 }); // Doran's Shield
    starterItems.push({ id: '2003', count: 1 });
  } else {
    starterItems.push({ id: '1055', count: 1 }); // Doran's Blade
    starterItems.push({ id: '2003', count: 1 });
  }
  starterItems.push({ id: '3340', count: 1 }); // Stealth Ward

  // 2. Core Progression Block
  const coreItems: RiotItemSetItem[] = [
    { id: tactics.coreBuild.firstItem.itemId, count: 1 },
    { id: tactics.coreBuild.secondItem.itemId, count: 1 },
    { id: tactics.coreBuild.thirdItem.itemId, count: 1 }
  ];

  // 3. Boots Block
  const bootItems: RiotItemSetItem[] = [
    { id: tactics.coreBuild.bootsRecommendation.defaultId, count: 1 },
    { id: '3047', count: 1 }, // Steelcaps
    { id: '3111', count: 1 }, // Mercury's Treads
    { id: '3158', count: 1 }, // Ionian Boots
    { id: '3020', count: 1 }, // Sorcerer's Shoes
    { id: '3006', count: 1 }, // Berserker's Greaves
    { id: '3009', count: 1 }  // Boots of Swiftness
  ];

  // 4. Situational & Threat Counter Pivots
  const pivotItemIds = new Set<string>();
  // Anti-Heal
  if (tactics.damageType === 'Magic Heavy') pivotItemIds.add('3165'); // Morellonomicon
  else if (tactics.playstyle === 'Teamfight Tank') pivotItemIds.add('3075'); // Thornmail
  else pivotItemIds.add('3033'); // Mortal Reminder / Chempunk

  // Armor Penetration / Magic Pen
  if (tactics.damageType === 'Magic Heavy') pivotItemIds.add('3135'); // Void Staff
  else pivotItemIds.add('3036'); // LDR

  // Defensive / Stasis / Lifeline
  if (tactics.damageType === 'Magic Heavy') pivotItemIds.add('3157'); // Zhonya's
  else pivotItemIds.add('3053'); // Sterak's
  pivotItemIds.add('2504'); // Kaenic Rookern (MR)

  const situationalItems: RiotItemSetItem[] = Array.from(pivotItemIds).map(id => ({
    id,
    count: 1
  }));

  // 5. Consumables & Elixirs
  const consumables: RiotItemSetItem[] = [
    { id: '2055', count: 1 }, // Control Ward
    { id: '2140', count: 1 }, // Elixir of Wrath
    { id: '2139', count: 1 }, // Elixir of Sorcery
    { id: '2138', count: 1 }  // Elixir of Iron
  ];

  return {
    title: `HexCards: ${champion.name} ${tactics.role}`,
    type: 'custom',
    map: 'any',
    mode: 'any',
    priority: false,
    sortrank: 0,
    associatedMaps: [11, 12], // Summoner's Rift & ARAM
    associatedChampions: champKeyNum > 0 ? [champKeyNum] : [],
    blocks: [
      createRiotBlock('Starting Items', starterItems, allItems),
      createRiotBlock('Core Build', coreItems, allItems),
      createRiotBlock('Boots', bootItems, allItems),
      createRiotBlock('Situational Items', situationalItems, allItems),
      createRiotBlock('Consumables', consumables, allItems)
    ]
  };
}

/**
 * Copies the item set JSON to the user's clipboard for direct paste into League client.
 */
export async function copyItemSetToClipboard(itemSet: RiotItemSet): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(itemSet, null, 2);
    await navigator.clipboard.writeText(jsonString);
    return true;
  } catch (err) {
    console.error('Failed to copy item set to clipboard:', err);
    return false;
  }
}

/**
 * Triggers a browser download of the item set as a .json file.
 */
export function downloadItemSetFile(itemSet: RiotItemSet, filename: string): void {
  const jsonString = JSON.stringify(itemSet, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

declare global {
  interface Window {
    electronAPI?: {
      isDesktop: boolean;
      platform: string;
      checkChampSelect: () => Promise<{
        connected?: boolean;
        inChampSelect: boolean;
        isInGame?: boolean;
        championId?: number;
        gameMode?: string;
        queueId?: number | null;
        assignedPosition?: string;
        opponentChampionId?: number;
        enemyChampions?: EnemyChampionInfo[];
        summonerName?: string;
      }>;
      importItemSet: (itemSet: RiotItemSet) => Promise<{ success: boolean; message: string }>;
      importRunes: (runePage: any) => Promise<{ success: boolean; message: string }>;
      checkBridgeStatus: () => Promise<{
        connected: boolean;
        summonerName?: string;
        port?: string;
        championId?: string;
        version?: string;
      }>;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      toggleAlwaysOnTop: () => Promise<boolean>;
      onUpdateStatus?: (callback: (data: { status: 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'; version?: string; percent?: number }) => void) => () => void;
      getUpdateStatus?: () => Promise<{ status: 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'; version?: string; percent?: number; message?: string }>;
      checkForUpdates?: () => Promise<{ status: string; isNewer?: boolean; version?: string; currentVersion?: string; message?: string }>;
      installUpdate?: () => void;
    };
  }
}

/**
 * Checks if the local HexCards League Desktop Bridge is running.
 */
export async function checkBridgeStatus(): Promise<{
  connected: boolean;
  summonerName?: string;
  championId?: string;
  version?: string;
}> {
  // If running inside the Electron Desktop App, communicate directly via native IPC
  if (typeof window !== 'undefined' && window.electronAPI) {
    try {
      return await window.electronAPI.checkBridgeStatus();
    } catch {
      return { connected: false };
    }
  }

  // Otherwise, query the local HTTP bridge
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${BRIDGE_API_URL}/api/status`, {
      signal: controller.signal
    }).catch(() => fetch(`${BRIDGE_API_URL}/status`, { signal: controller.signal }));
    clearTimeout(timeout);
    if (!res || !res.ok) return { connected: false };
    return await res.json();
  } catch {
    return { connected: false };
  }
}

/**
 * Pushes the item set and rune kit directly into the live League client via the local bridge or IPC.
 */
export async function autoImportToLeague(
  itemSet: RiotItemSet,
  runeKit?: RuneKitGuide
): Promise<{ success: boolean; message: string }> {
  // 1. Desktop native IPC execution
  if (typeof window !== 'undefined' && window.electronAPI) {
    try {
      const itemResult = await window.electronAPI.importItemSet(itemSet);
      let runeResult: { success: boolean; message: string } | null = null;

      if (runeKit && window.electronAPI.importRunes) {
        // Build selectedPerkIds from the actual runeKit data:
        // [keystone, primary1, primary2, primary3, secondary1, secondary2, shard1, shard2, shard3]
        const keystoneId = KEYSTONE_IDS[runeKit.keystone.name] || 8010;
        const primary1 = RUNE_IDS[runeKit.primaryMinors[0]?.name] || 9111;
        const primary2 = RUNE_IDS[runeKit.primaryMinors[1]?.name] || 9104;
        const primary3 = RUNE_IDS[runeKit.primaryMinors[2]?.name] || 8299;
        const secondary1 = RUNE_IDS[runeKit.secondaryMinors[0]?.name] || 8444;
        const secondary2 = RUNE_IDS[runeKit.secondaryMinors[1]?.name] || 8451;

        // Stat shards — parse from the statShards string across the 3 modern slots
        // Format is typically "+8 Adaptive Force • +2% Movement Speed • +65 Health"
        const shardsStr = runeKit.statShards || '';
        const shard1 = shardsStr.includes('Attack Speed') ? STAT_SHARD_ATTACK_SPEED
          : shardsStr.includes('Ability Haste') ? STAT_SHARD_ABILITY_HASTE
          : STAT_SHARD_ADAPTIVE;

        const shard2 = shardsStr.includes('Movement Speed') || shardsStr.includes('Move Speed')
          ? STAT_SHARD_MOVE_SPEED
          : shardsStr.includes('Scaling Health')
          ? STAT_SHARD_HEALTH_SCALING
          : STAT_SHARD_ADAPTIVE;

        const shard3 = shardsStr.includes('Tenacity') ? STAT_SHARD_TENACITY
          : shardsStr.includes('Scaling Health') ? STAT_SHARD_HEALTH_SCALING
          : STAT_SHARD_HEALTH_FLAT;

        // Strip existing prefix if present so title stays clean and <= 30 chars
        const cleanTitle = (itemSet.title || 'Build').replace(/^HexCards:\s*/i, '');
        const pageName = `HexCards: ${cleanTitle}`.slice(0, 30);

        const runePage = {
          name: pageName,
          primaryStyleId: RUNE_STYLE_IDS[runeKit.primaryTree] || 8000,
          subStyleId: RUNE_STYLE_IDS[runeKit.secondaryTree] || 8400,
          selectedPerkIds: [keystoneId, primary1, primary2, primary3, secondary1, secondary2, shard1, shard2, shard3],
          current: true
        };

        runeResult = await window.electronAPI.importRunes(runePage).catch((err: any) => ({
          success: false,
          message: err?.message || 'Failed to apply runes'
        }));
      }

      if (itemResult.success && runeResult) {
        if (runeResult.success) {
          return {
            success: true,
            message: `Injected Item Set & Runes into League Client!`
          };
        } else {
          return {
            success: false,
            message: `Item set injected, but runes failed: ${runeResult.message}`
          };
        }
      }

      return itemResult;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to inject item set via Desktop App.'
      };
    }
  }

  // 2. Web browser HTTP bridge fallback
  try {
    const res = await fetch(`${BRIDGE_API_URL}/api/import-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemSet, runeKit })
    }).catch(() =>
      fetch(`${BRIDGE_API_URL}/import-item-set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemSet)
      })
    );
    if (!res || !res.ok) {
      const err = await res?.json().catch(() => ({ message: res?.statusText }));
      return { success: false, message: err?.message || err?.error || 'Bridge import failed.' };
    }
    const data = await res.json();
    return { success: true, message: data.message || 'Successfully imported to League Client!' };
  } catch (err: any) {
    return {
      success: false,
      message: 'Could not communicate with HexCards Desktop Bridge. Is `npm run bridge` running?'
    };
  }
}

export interface EnemyChampionInfo {
  championId: number;
  assignedPosition?: string;
  summonerName?: string;
}

/**
 * Polls the bridge for active champ select / game session data.
 */
export async function checkChampSelect(): Promise<{
  inChampSelect: boolean;
  isInGame?: boolean;
  championId?: number;
  gameMode?: string;
  queueId?: number | null;
  teamId?: number;
  assignedPosition?: string;
  opponentChampionId?: number;
  enemyChampions?: EnemyChampionInfo[];
}> {
  // 1. Desktop native IPC
  if (typeof window !== 'undefined' && window.electronAPI) {
    try {
      return await window.electronAPI.checkChampSelect();
    } catch {
      return { inChampSelect: false };
    }
  }

  // 2. Web browser HTTP bridge
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${BRIDGE_API_URL}/api/champ-select`, {
      signal: controller.signal
    }).catch(() => fetch(`${BRIDGE_API_URL}/champ-select`, { signal: controller.signal }));
    clearTimeout(timeout);
    if (!res || !res.ok) return { inChampSelect: false };
    return await res.json();
  } catch {
    return { inChampSelect: false };
  }
}
