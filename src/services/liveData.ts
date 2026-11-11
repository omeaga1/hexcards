/**
 * Loads a synced data file (public/data/*.json).
 *
 * The bundled copy ships with each build, so on the desktop app it is frozen at
 * install time. The GitHub sync job refreshes these files on `main` twice a day,
 * so we also fetch the live copy and use whichever one is newer.
 */
const LIVE_DATA_BASE = 'https://raw.githubusercontent.com/omeaga1/hexcards/main/public/data/';
const REMOTE_TIMEOUT_MS = 6000;

async function fetchJson<T>(url: string, timeoutMs?: number): Promise<T | null> {
  const controller = timeoutMs ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const res = await fetch(url, { signal: controller?.signal, cache: 'no-cache' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function loadSyncedData<T>(
  fileName: string,
  getTimestamp: (data: T) => string | undefined,
  isValid: (data: T) => boolean = () => true
): Promise<T | null> {
  const baseUrl = import.meta.env.BASE_URL || './';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  const [bundledRaw, liveRaw] = await Promise.all([
    fetchJson<T>(`${cleanBase}data/${fileName}`),
    fetchJson<T>(`${LIVE_DATA_BASE}${fileName}`, REMOTE_TIMEOUT_MS),
  ]);
  const bundled = bundledRaw && isValid(bundledRaw) ? bundledRaw : null;
  const live = liveRaw && isValid(liveRaw) ? liveRaw : null;

  if (!live) return bundled;
  if (!bundled) return live;

  const stamp = (d: T) => Date.parse(getTimestamp(d) || '') || 0;
  return stamp(live) > stamp(bundled) ? live : bundled;
}
