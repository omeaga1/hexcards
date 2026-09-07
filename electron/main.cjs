const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const https = require("https");
const http = require("http");
const fs = require("fs");
const { execSync } = require("child_process");

// Configure automatic background updates
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Allow local LCU self-signed TLS certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const BRIDGE_PORT = 4173;
const LCU_AGENT = new https.Agent({ rejectUnauthorized: false });

let mainWindow = null;
let lcuCredentials = null;
let lastCheckTime = 0;

/**
 * Searches for the running LeagueClient process to extract port and auth token.
 */
function findLcuCredentials() {
  const now = Date.now();
  if (lcuCredentials && now - lastCheckTime < 5000) {
    return lcuCredentials;
  }
  lastCheckTime = now;

  // 1. Check lockfile in common install paths
  const commonPaths = [
    "C:/Riot Games/League of Legends/lockfile",
    "D:/Riot Games/League of Legends/lockfile",
    "E:/Riot Games/League of Legends/lockfile",
    "C:/Program Files/Riot Games/League of Legends/lockfile"
  ];

  for (const lockPath of commonPaths) {
    if (fs.existsSync(lockPath)) {
      try {
        const content = fs.readFileSync(lockPath, "utf8");
        const parts = content.split(":");
        if (parts.length >= 5) {
          lcuCredentials = {
            port: parts[2],
            token: parts[3],
            protocol: parts[4] || "https"
          };
          return lcuCredentials;
        }
      } catch {
        // continue
      }
    }
  }

  // 2. Fallback: Process command line on Windows
  if (process.platform === "win32") {
    try {
      const output = execSync(
        'wmic PROCESS WHERE "name=\'LeagueClientUx.exe\'" GET CommandLine /VALUE',
        { encoding: "utf8", timeout: 2500, stdio: ["ignore", "pipe", "ignore"] }
      );
      const portMatch = output.match(/--app-port=([0-9]+)/);
      const tokenMatch = output.match(/--remoting-auth-token=([\w-_]+)/);

      if (portMatch && tokenMatch) {
        lcuCredentials = {
          port: portMatch[1],
          token: tokenMatch[1],
          protocol: "https"
        };
        return lcuCredentials;
      }
    } catch {
      // Process not found or query timed out
    }
  }

  lcuCredentials = null;
  return null;
}

/**
 * Make an authenticated request to the local Riot LCU API.
 */
function requestLcu(endpoint, method = "GET", bodyData = null) {
  return new Promise((resolve) => {
    const creds = findLcuCredentials();
    if (!creds) {
      return resolve({ ok: false, status: 0, error: "League client not detected." });
    }

    const auth = Buffer.from(`riot:${creds.token}`).toString("base64");
    const options = {
      hostname: "127.0.0.1",
      port: creds.port,
      path: endpoint,
      method,
      agent: LCU_AGENT,
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      timeout: 3000
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = data ? JSON.parse(data) : null;
        } catch {
          json = data;
        }
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          data: json
        });
      });
    });

    req.on("error", (err) => {
      lcuCredentials = null;
      resolve({ ok: false, status: 0, error: err.message });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, status: 0, error: "LCU request timeout" });
    });

    if (bodyData) {
      req.write(typeof bodyData === "string" ? bodyData : JSON.stringify(bodyData));
    }
    req.end();
  });
}

/**
 * Helper to fetch live champion select, active match, opponents, and summoner info.
 */
async function getLiveSessionData() {
  const creds = findLcuCredentials();
  if (!creds) {
    return { inChampSelect: false, isInGame: false, connected: false };
  }

  // 1. Check Champ Select
  const csRes = await requestLcu("/lol-champ-select/v1/session");
  const gfRes = await requestLcu("/lol-gameflow/v1/session");
  const sumRes = await requestLcu("/lol-summoner/v1/current-summoner");

  const summonerName = sumRes?.data?.gameName || sumRes?.data?.displayName || "Summoner";

  if (csRes.ok && csRes.data) {
    const cs = csRes.data;
    const localCellId = cs.localPlayerCellId;
    const myTeam = cs.myTeam || [];
    const theirTeam = cs.theirTeam || [];

    const me = myTeam.find((p) => p.cellId === localCellId);
    const myChampionId = me?.championId || 0;
    const myAssignedPosition = me?.assignedPosition || "";

    let opponentChampionId = 0;
    if (myAssignedPosition && theirTeam.length > 0) {
      const directOpponent = theirTeam.find((p) => p.assignedPosition === myAssignedPosition);
      if (directOpponent && directOpponent.championId > 0) {
        opponentChampionId = directOpponent.championId;
      }
    }

    const enemyChampions = theirTeam
      .filter((p) => p.championId > 0)
      .map((p) => ({
        championId: p.championId,
        assignedPosition: p.assignedPosition
      }));

    return {
      connected: true,
      inChampSelect: true,
      isInGame: false,
      championId: myChampionId,
      assignedPosition: myAssignedPosition,
      opponentChampionId,
      enemyChampions,
      summonerName,
      gameMode: gfRes?.data?.gameData?.queue?.gameMode || "Summoner's Rift",
      queueId: gfRes?.data?.gameData?.queue?.id
    };
  }

  // 2. Check If In Game
  if (gfRes.ok && gfRes.data?.phase === "InProgress") {
    return {
      connected: true,
      inChampSelect: false,
      isInGame: true,
      summonerName,
      gameMode: gfRes.data?.gameData?.queue?.gameMode || "Live Match",
      queueId: gfRes.data?.gameData?.queue?.id
    };
  }

  return {
    connected: true,
    inChampSelect: false,
    isInGame: false,
    summonerName,
    phase: gfRes?.data?.phase || "Lobby"
  };
}

/**
 * Start companion HTTP server on 127.0.0.1:4173 for cross-app or browser requests
 */
function startLocalBridgeServer() {
  const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    const url = new URL(req.url, `http://127.0.0.1:${BRIDGE_PORT}`);

    if (url.pathname === "/status") {
      const creds = findLcuCredentials();
      if (!creds) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ connected: false, message: "League client offline" }));
      }
      const sum = await requestLcu("/lol-summoner/v1/current-summoner");
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          connected: true,
          summonerName: sum.data?.gameName || sum.data?.displayName || "Summoner",
          port: creds.port
        })
      );
    }

    if (url.pathname === "/champ-select") {
      const data = await getLiveSessionData();
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(data));
    }

    if (url.pathname === "/import-item-set" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const itemSet = JSON.parse(body);
          const sum = await requestLcu("/lol-summoner/v1/current-summoner");
          if (!sum.ok || !sum.data) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ success: false, message: "Could not retrieve summoner info." }));
          }
          const summonerId = sum.data.summonerId || sum.data.accountId;
          if (!summonerId) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ success: false, message: "Summoner ID not found." }));
          }
          // LCU expects { itemSets: [...] } wrapper
          const lcuBody = { itemSets: [itemSet] };
          const putRes = await requestLcu(`/lol-item-sets/v1/item-sets/${summonerId}`, "PUT", lcuBody);
          res.writeHead(putRes.ok ? 200 : 400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({
            success: putRes.ok,
            message: putRes.ok
              ? `Item set "${itemSet.title}" injected into your in-game shop!`
              : `Failed to push item set. (Status: ${putRes.status})`
          }));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ success: false, message: err.message }));
        }
      });
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  server.listen(BRIDGE_PORT, "127.0.0.1", () => {
    console.log(`[HexCards Bridge] Companion HTTP service active on http://127.0.0.1:${BRIDGE_PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`[HexCards Bridge] Port ${BRIDGE_PORT} already in use; reusing existing bridge.`);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1040,
    minHeight: 700,
    title: "HexCards • Tactical LoL Companion",
    backgroundColor: "#182319",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    }
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[HexCards Load Error] ${validatedURL}: [${errorCode}] ${errorDescription}`);
  });

  // Load from local Vite dev server in development, or dist/index.html in production
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || (!app.isPackaged ? "http://127.0.0.1:5173" : null);

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl).catch(() => {
      loadProductionIndex();
    });
  } else {
    loadProductionIndex();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function loadProductionIndex() {
  const possiblePaths = [
    path.join(app.getAppPath(), "dist/index.html"),
    path.join(__dirname, "../dist/index.html"),
    path.join(__dirname, "dist/index.html")
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      mainWindow.loadFile(p);
      return;
    }
  }

  mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
}

// IPC Handlers
ipcMain.handle("lcu:getStatus", async () => {
  const creds = findLcuCredentials();
  if (!creds) {
    return { connected: false, message: "League client not detected." };
  }
  const sum = await requestLcu("/lol-summoner/v1/current-summoner");
  return {
    connected: true,
    summonerName: sum.data?.gameName || sum.data?.displayName || "Summoner",
    port: creds.port
  };
});

ipcMain.handle("lcu:checkChampSelect", async () => {
  return await getLiveSessionData();
});

ipcMain.handle("lcu:importItemSet", async (_event, itemSet) => {
  try {
    const sum = await requestLcu("/lol-summoner/v1/current-summoner");
    if (!sum.ok || !sum.data) {
      return { success: false, message: "Could not retrieve summoner info — is League client running?" };
    }
    const accountId = sum.data.accountId || sum.data.summonerId;
    if (!accountId) {
      return { success: false, message: "Summoner account ID missing." };
    }

    const formattedSet = {
      title: itemSet.title || "HexCards Build",
      type: "custom",
      map: "any",
      mode: "any",
      priority: false,
      sortrank: 1,
      associatedMaps: itemSet.associatedMaps || [11, 12],
      associatedChampions: itemSet.associatedChampions || [],
      blocks: itemSet.blocks || []
    };

    // Fetch existing item sets to preserve user sets
    let existingSets = [];
    const getRes = await requestLcu(`/lol-item-sets/v1/item-sets/${accountId}/sets`);
    if (getRes.ok && getRes.data && Array.isArray(getRes.data.itemSets)) {
      existingSets = getRes.data.itemSets;
    }

    // Replace any set with the same title or prepend new set
    const filtered = existingSets.filter((s) => s.title !== formattedSet.title);
    filtered.unshift(formattedSet);

    const body = {
      accountId: Number(accountId),
      itemSets: filtered,
      timestamp: Date.now()
    };

    const putRes = await requestLcu(`/lol-item-sets/v1/item-sets/${accountId}/sets`, "PUT", body);
    return {
      success: putRes.ok,
      message: putRes.ok
        ? `Item set "${formattedSet.title}" injected into your in-game shop!`
        : `Failed to push item set. (Status: ${putRes.status})`
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle("lcu:importRunes", async (_event, runePage) => {
  try {
    // 1. Fetch current perk pages
    const pagesRes = await requestLcu("/lol-perks/v1/pages");
    if (!pagesRes.ok || !Array.isArray(pagesRes.data)) {
      return { success: false, message: "Could not access rune pages from League client." };
    }

    const pages = pagesRes.data;
    // Find an existing HexCards page, or any editable user page to recycle
    const hexPage = pages.find((p) => p.isEditable && p.name && p.name.includes("HexCards"));
    const editablePage = hexPage || pages.find((p) => p.isEditable);

    // Sanitize title length (League has a strict 30-character limit)
    let sanitizedName = (runePage.name || "HexCards Build").trim();
    if (sanitizedName.length > 30) {
      sanitizedName = sanitizedName.substring(0, 30).trim();
    }

    const payload = {
      name: sanitizedName,
      primaryStyleId: runePage.primaryStyleId,
      subStyleId: runePage.subStyleId,
      selectedPerkIds: runePage.selectedPerkIds,
      current: true
    };

    let targetPageId = null;

    if (editablePage) {
      targetPageId = editablePage.id;
      // Try updating the existing editable page
      const putRes = await requestLcu(`/lol-perks/v1/pages/${editablePage.id}`, "PUT", {
        ...payload,
        id: editablePage.id
      });

      if (!putRes.ok) {
        // Fallback: delete and recreate if PUT was rejected
        await requestLcu(`/lol-perks/v1/pages/${editablePage.id}`, "DELETE");
        const postFallback = await requestLcu("/lol-perks/v1/pages", "POST", payload);
        if (postFallback.ok && postFallback.data) {
          targetPageId = postFallback.data.id;
        } else {
          return { success: false, message: `Failed to apply rune page. (Status: ${postFallback.status})` };
        }
      }
    } else {
      // No editable page exists; create a new one
      const postRes = await requestLcu("/lol-perks/v1/pages", "POST", payload);
      if (postRes.ok && postRes.data) {
        targetPageId = postRes.data.id;
      } else {
        return {
          success: false,
          message: postRes.data?.message === "Max pages reached"
            ? "Rune page limit reached. Please delete one page in your League client."
            : `Failed to create rune page. (Status: ${postRes.status})`
        };
      }
    }

    // Set page as active in champion select
    if (targetPageId) {
      await requestLcu("/lol-perks/v1/currentpage", "PUT", targetPageId.toString());
    }

    return {
      success: true,
      message: `Rune page "${sanitizedName}" applied directly to active rune kit!`
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

ipcMain.on("window:minimize", () => mainWindow?.minimize());
ipcMain.on("window:maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on("window:close", () => mainWindow?.close());
ipcMain.handle("window:toggleAlwaysOnTop", () => {
  if (!mainWindow) return false;
  const isTop = mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(!isTop);
  return !isTop;
});
let currentUpdateState = { status: "idle" };

ipcMain.handle("update:getStatus", () => {
  return currentUpdateState;
});

ipcMain.on("update:installNow", () => {
  // isSilent = true, isForceRunAfter = true (Seamless update with zero wizard prompts)
  autoUpdater.quitAndInstall(true, true);
});
ipcMain.handle("update:checkForUpdates", async () => {
  if (!app.isPackaged) {
    return { status: "dev", message: "Development mode (updates disabled)" };
  }
  try {
    // Clear the updater cache so stale downloaded-but-not-installed packages
    // don't prevent detection of a newer release published after the cached one.
    const updaterCacheDir = path.join(app.getPath("appData"), "..", "Local", "lol-quick-cards-updater");
    if (fs.existsSync(updaterCacheDir)) {
      fs.rmSync(updaterCacheDir, { recursive: true, force: true });
      console.log("[AutoUpdater] Cleared stale updater cache before check.");
    }

    const res = await autoUpdater.checkForUpdates();
    const remoteVersion = res?.updateInfo?.version;
    const isNewer = Boolean(remoteVersion && remoteVersion !== app.getVersion());
    if (isNewer) {
      currentUpdateState = { status: "available", version: remoteVersion, percent: 0 };
    }
    return {
      status: "ok",
      isNewer,
      version: remoteVersion,
      currentVersion: app.getVersion()
    };
  } catch (err) {
    return { status: "error", message: err.message };
  }
});

function setupAutoUpdater() {
  if (!app.isPackaged) return;

  autoUpdater.on("checking-for-update", () => {
    console.log("[AutoUpdater] Checking GitHub Releases for updates...");
  });

  autoUpdater.on("update-available", (info) => {
    console.log("[AutoUpdater] New update available:", info.version);
    currentUpdateState = { status: "available", version: info.version, percent: 0 };
    mainWindow?.webContents.send("update:status", currentUpdateState);
  });

  autoUpdater.on("update-not-available", () => {
    console.log("[AutoUpdater] App is on latest version.");
    currentUpdateState = { status: "idle", message: `Up to date (v${app.getVersion()}) ✓` };
  });

  autoUpdater.on("download-progress", (progress) => {
    currentUpdateState = { status: "downloading", percent: Math.round(progress.percent) };
    mainWindow?.webContents.send("update:status", currentUpdateState);
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log("[AutoUpdater] Update downloaded; ready to install.", info.version);
    currentUpdateState = { status: "downloaded", version: info.version };
    mainWindow?.webContents.send("update:status", currentUpdateState);
  });

  autoUpdater.on("error", (err) => {
    console.warn("[AutoUpdater] Update check failed:", err.message);
  });

  function clearUpdaterCacheAndCheck() {
    try {
      const updaterCacheDir = path.join(app.getPath("appData"), "..", "Local", "lol-quick-cards-updater");
      if (fs.existsSync(updaterCacheDir)) {
        fs.rmSync(updaterCacheDir, { recursive: true, force: true });
      }
    } catch { /* non-fatal */ }
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }

  // Check 3 seconds after launch, then every 30 minutes
  setTimeout(() => clearUpdaterCacheAndCheck(), 3000);
  setInterval(() => clearUpdaterCacheAndCheck(), 30 * 60 * 1000);
}

// App Lifecycle
app.whenReady().then(() => {
  startLocalBridgeServer();
  createWindow();
  setupAutoUpdater();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
