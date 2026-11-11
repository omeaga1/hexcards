import { loadSyncedData } from './liveData';

export interface ChampionMetaBuild {
  championId: string;
  role: 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support';
  secondaryRole?: 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support';
  playstyle: string;
  damageType: 'Physical Heavy' | 'Magic Heavy' | 'True / Hybrid';
  identity: string;
  winCondition: string;
  powerSpikes: string[];
  skillMaxOrder: string;
  skillMaxReason: string;
  starter: string;
  starterIds?: string[];
  firstItemId: string;
  firstItemName: string;
  secondItemId: string;
  secondItemName: string;
  thirdItemId: string;
  thirdItemName: string;
  bootsId: string;
  bootsName: string;
  bootsWhy: string;
  primaryTree: 'Precision' | 'Domination' | 'Sorcery' | 'Resolve' | 'Inspiration';
  keystoneName: string;
  keystoneTldr: string;
  keystoneWhy: string;
  primaryRunes?: string[];
  secondaryTree: 'Precision' | 'Domination' | 'Sorcery' | 'Resolve' | 'Inspiration';
  secondaryRunes?: string[];
  statShards: string;
}

interface MetaBuildsPayload {
  patch: string;
  generatedAt: string;
  builds: Record<string, ChampionMetaBuild>;
}

let cachedBuilds: Record<string, ChampionMetaBuild> = {};
let buildsInfo: { patch: string; generatedAt: string } | null = null;
let loadPromise: Promise<Record<string, ChampionMetaBuild>> | null = null;

export async function loadMetaBuilds(force = false): Promise<Record<string, ChampionMetaBuild>> {
  if (!force && Object.keys(cachedBuilds).length > 0) return cachedBuilds;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const data = await loadSyncedData<MetaBuildsPayload>(
        'meta-builds-latest.json',
        (d) => d.generatedAt,
        (d) => Boolean(d.builds && Object.keys(d.builds).length > 0)
      );
      if (!data) {
        console.warn('[MetaBuildService] Failed to load meta builds.');
        return {};
      }
      cachedBuilds = data.builds || {};
      buildsInfo = { patch: data.patch, generatedAt: data.generatedAt };
      return cachedBuilds;
    } catch (err) {
      console.warn('[MetaBuildService] Error loading meta builds:', err);
      return {};
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export function getMetaBuildForChampion(championId: string): ChampionMetaBuild | null {
  return cachedBuilds[championId] || null;
}

/** Patch and timestamp of the build data currently in use. */
export function getMetaBuildsInfo(): { patch: string; generatedAt: string } | null {
  return buildsInfo;
}
