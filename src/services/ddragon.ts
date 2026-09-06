import { ChampionDetail, ChampionSummary, ItemData } from '../types';

const BASE_URL = 'https://ddragon.leagueoflegends.com';
const FALLBACK_VERSION = '16.17.1';

// Cache keys
const CACHE_VERSION_KEY = 'lol_qc_patch_version';
const CACHE_CHAMPIONS_KEY = 'lol_qc_champions_';
const CACHE_ITEMS_KEY = 'lol_qc_items_';
const CACHE_CHAMP_DETAIL_PREFIX = 'lol_qc_champ_';

const PRESERVED_KEYS = new Set([
  'lol_qc_favorites',
  'lol_qc_pinned_cards',
  'lol_qc_dismissed_patch',
  'lol_qc_patch_version',
  'lol_qc_patch_version_time'
]);

/**
 * Purges old patch cached data from localStorage to prevent QuotaExceededError,
 * while safely preserving user preferences, favorites, and pinned cards.
 */
export function purgeStaleCache(activeVersion: string): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || PRESERVED_KEYS.has(key)) continue;
      if (key.startsWith('lol_qc_') && !key.includes(activeVersion)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    if (keysToRemove.length > 0) {
      console.log(`[HexCards Cache] Purged ${keysToRemove.length} stale entries for previous patches.`);
    }
  } catch (err) {
    console.warn('[HexCards Cache] Error purging stale cache:', err);
  }
}

/**
 * Checks Riot's versions.json without caching, allowing detection of live patch deploys.
 */
export async function checkRemotePatchVersion(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/versions.json?_t=${Date.now()}`);
    if (!res.ok) return null;
    const versions: string[] = await res.json();
    return versions[0] || null;
  } catch {
    return null;
  }
}

export async function fetchLatestVersion(): Promise<string> {
  try {
    const cached = localStorage.getItem(CACHE_VERSION_KEY);
    const cachedTime = localStorage.getItem(CACHE_VERSION_KEY + '_time');
    // Re-check version every 2 hours
    if (cached && cachedTime && Date.now() - parseInt(cachedTime) < 1000 * 60 * 60 * 2) {
      purgeStaleCache(cached);
      return cached;
    }

    const res = await fetch(`${BASE_URL}/api/versions.json`);
    if (!res.ok) throw new Error('Failed to fetch versions');
    const versions: string[] = await res.json();
    const latest = versions[0] || FALLBACK_VERSION;
    localStorage.setItem(CACHE_VERSION_KEY, latest);
    localStorage.setItem(CACHE_VERSION_KEY + '_time', Date.now().toString());
    purgeStaleCache(latest);
    return latest;
  } catch (err) {
    console.warn('Using fallback DDragon version due to fetch error:', err);
    const fallback = localStorage.getItem(CACHE_VERSION_KEY) || FALLBACK_VERSION;
    purgeStaleCache(fallback);
    return fallback;
  }
}

export async function fetchAllChampions(version: string): Promise<Record<string, ChampionSummary>> {
  const cacheKey = CACHE_CHAMPIONS_KEY + version;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  try {
    const res = await fetch(`${BASE_URL}/cdn/${version}/data/en_US/champion.json`);
    if (!res.ok) throw new Error(`Failed to fetch champion list for ${version}`);
    const data = await res.json();
    const champions = data.data as Record<string, ChampionSummary>;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(champions));
    } catch {
      // Storage might be full, safe to ignore
    }
    return champions;
  } catch (err) {
    console.error('Error fetching champion list:', err);
    return {};
  }
}

export async function fetchChampionDetail(version: string, championId: string): Promise<ChampionDetail | null> {
  const cacheKey = `${CACHE_CHAMP_DETAIL_PREFIX}${version}_${championId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  try {
    const res = await fetch(`${BASE_URL}/cdn/${version}/data/en_US/champion/${championId}.json`);
    if (!res.ok) throw new Error(`Failed to fetch champion detail for ${championId}`);
    const data = await res.json();
    const detail = data.data[championId] as ChampionDetail;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(detail));
    } catch {
      // ignore
    }
    return detail;
  } catch (err) {
    console.error(`Error fetching detail for ${championId}:`, err);
    return null;
  }
}

export async function fetchAllItems(version: string): Promise<Record<string, ItemData>> {
  const cacheKey = CACHE_ITEMS_KEY + version;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  try {
    const res = await fetch(`${BASE_URL}/cdn/${version}/data/en_US/item.json`);
    if (!res.ok) throw new Error(`Failed to fetch items for ${version}`);
    const data = await res.json();
    
    // Filter to standard Summoner's Rift items (map 11) and purchasable items
    const rawItems = data.data as Record<string, ItemData>;
    const filteredItems: Record<string, ItemData> = {};

    for (const [id, item] of Object.entries(rawItems)) {
      if (item.gold?.purchasable && (!item.maps || item.maps['11'])) {
        filteredItems[id] = { ...item, id };
      }
    }

    try {
      localStorage.setItem(cacheKey, JSON.stringify(filteredItems));
    } catch {
      // ignore
    }
    return filteredItems;
  } catch (err) {
    console.error('Error fetching items:', err);
    return {};
  }
}

export function cleanDDragonText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<rules>(.*?)<\/rules>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Asset URL helpers
export function getChampionSplashUrl(championId: string): string {
  return `${BASE_URL}/cdn/img/champion/splash/${championId}_0.jpg`;
}

export function getChampionLoadingUrl(championId: string): string {
  return `${BASE_URL}/cdn/img/champion/loading/${championId}_0.jpg`;
}

export function getChampionIconUrl(version: string, filename: string): string {
  return `${BASE_URL}/cdn/${version}/img/champion/${filename}`;
}

export function getSpellIconUrl(version: string, filename: string): string {
  return `${BASE_URL}/cdn/${version}/img/spell/${filename}`;
}

export function getPassiveIconUrl(version: string, filename: string): string {
  return `${BASE_URL}/cdn/${version}/img/passive/${filename}`;
}

export function getItemIconUrl(version: string, itemId: string): string {
  return `${BASE_URL}/cdn/${version}/img/item/${itemId}.png`;
}

export { getRuneIconUrl } from '../data/runeIcons';
