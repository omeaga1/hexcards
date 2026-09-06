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
  secondaryTree: 'Precision' | 'Domination' | 'Sorcery' | 'Resolve' | 'Inspiration';
  statShards: string;
}

interface MetaBuildsPayload {
  patch: string;
  generatedAt: string;
  builds: Record<string, ChampionMetaBuild>;
}

let cachedBuilds: Record<string, ChampionMetaBuild> = {};
let loadPromise: Promise<Record<string, ChampionMetaBuild>> | null = null;

export async function loadMetaBuilds(): Promise<Record<string, ChampionMetaBuild>> {
  if (Object.keys(cachedBuilds).length > 0) return cachedBuilds;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const baseUrl = import.meta.env.BASE_URL || './';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const res = await fetch(`${cleanBase}data/meta-builds-latest.json`);
      if (!res.ok) {
        console.warn('[MetaBuildService] Failed to load meta builds:', res.statusText);
        return {};
      }
      const data: MetaBuildsPayload = await res.json();
      cachedBuilds = data.builds || {};
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
