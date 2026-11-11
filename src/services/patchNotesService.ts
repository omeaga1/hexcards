import { loadSyncedData } from './liveData';

export type ChangeDirection = 'buff' | 'nerf' | 'neutral';
export type ChangeType = 'buff' | 'nerf' | 'adjusted';

export interface PatchChange {
  /** 'Stats', 'Cost', or an ability slot: 'Q' | 'W' | 'E' | 'R' */
  slot: string;
  label: string;
  from: string;
  to: string;
  direction: ChangeDirection;
}

export interface PatchEntry {
  id: string;
  name: string;
  type: ChangeType;
  changes: PatchChange[];
}

export interface PatchNotes {
  version: string;
  previousVersion: string;
  releaseDate: string;
  summary: string;
  newChampions?: string[];
  champions: Record<string, PatchEntry>;
  items: Record<string, PatchEntry>;
}

let cached: PatchNotes | null = null;

function isValid(data: PatchNotes | null): boolean {
  // Older files used a different shape (hand-written notes without `changes`); ignore them.
  if (!data || !data.champions || !data.items) return false;
  const entries = [...Object.values(data.champions), ...Object.values(data.items)];
  return entries.every((e) => Array.isArray(e.changes));
}

export async function loadPatchNotes(force = false): Promise<PatchNotes | null> {
  if (cached && !force) return cached;
  cached = await loadSyncedData<PatchNotes>('patch-diffs-latest.json', (d) => d.releaseDate, isValid);
  return cached;
}

/** "16.22.1" -> "16.22" */
export function shortPatch(version: string): string {
  return version.split('.').slice(0, 2).join('.');
}
