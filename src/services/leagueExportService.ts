import { ChampionDetail, TacticalGuide, ItemData, RuneKitGuide } from '../types';

export interface RiotItemSetItem {
  id: string;
  count: number;
}

export interface RiotItemSetBlock {
  type: string;
  items: RiotItemSetItem[];
}

export interface RiotItemSet {
  title: string;
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
  'First Strike': 8360
};

const BRIDGE_API_URL = 'http://127.0.0.1:4173';

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
    { id: '3158', count: 1 }  // Ionian Boots
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
    associatedMaps: [11, 12], // Summoner's Rift & ARAM
    associatedChampions: champKeyNum > 0 ? [champKeyNum] : [],
    blocks: [
      {
        type: `1. Early Starters (${tactics.role})`,
        items: starterItems
      },
      {
        type: `2. Core Spikes (Order: 1 > 2 > 3)`,
        items: coreItems
      },
      {
        type: `3. Boots Options`,
        items: bootItems
      },
      {
        type: `4. Situational Pivots & Counters`,
        items: situationalItems
      },
      {
        type: `5. Consumables & Vision`,
        items: consumables
      }
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
      if (runeKit && window.electronAPI.importRunes) {
        const runePage = {
          name: `HexCards: ${itemSet.title}`,
          primaryStyleId: RUNE_STYLE_IDS[runeKit.primaryTree] || 8000,
          subStyleId: RUNE_STYLE_IDS[runeKit.secondaryTree] || 8400,
          selectedPerkIds: [
            KEYSTONE_IDS[runeKit.keystone.name] || 8010,
            8009, 9104, 8299, 8444, 8451, 5008, 5008, 5002
          ],
          current: true
        };
        await window.electronAPI.importRunes(runePage).catch(() => null);
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
