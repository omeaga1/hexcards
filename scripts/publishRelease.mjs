import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'omeaga1';
const REPO = 'hexcards';
const TAG = 'v1.0.0';

const installerPath = path.resolve('dist-electron/HexCards Setup 1.0.0.exe');
const portablePath = path.resolve('dist-electron/HexCards 1.0.0.exe');

async function main() {
  if (!fs.existsSync(installerPath)) {
    console.error('Installer file not found at:', installerPath);
    process.exit(1);
  }

  const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'HexCards-Release-Uploader',
    'Accept': 'application/vnd.github+json'
  };

  console.log(`Checking existing releases for ${OWNER}/${REPO}...`);
  const getRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/${TAG}`, { headers });
  let releaseData = null;

  if (getRes.ok) {
    releaseData = await getRes.json();
    console.log(`Found existing release: ${releaseData.name} (id: ${releaseData.id})`);
  } else {
    console.log(`Creating new release ${TAG}...`);
    const createRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tag_name: TAG,
        target_commitish: 'main',
        name: `HexCards v1.0.0 - Windows Desktop Companion`,
        body: `### HexCards Tactical League Companion v1.0.0\n\n- **Zero Slop & Zero RAM Bloat**: High performance, responsive companion.\n- **Direct Riot LCU Integration**: Auto-detects locked-in champions in Champion Select, identifies lane opponents, and injects item sets & rune pages with 1 click.\n- **100% Vanguard Safe**: Uses official Riot LCU local loopback REST API (no memory hooks, no overlays).\n\n#### Downloads:\n- **[HexCards-Setup-1.0.0.exe](https://github.com/omeaga1/hexcards/releases/download/${TAG}/HexCards-Setup-1.0.0.exe)** (Windows Installer with Desktop shortcut)\n- **[HexCards-1.0.0-portable.exe](https://github.com/omeaga1/hexcards/releases/download/${TAG}/HexCards-1.0.0-portable.exe)** (Portable executable - no installation required)`,
        draft: false,
        prerelease: false
      })
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('Failed to create release:', createRes.status, err);
      process.exit(1);
    }
    releaseData = await createRes.json();
    console.log(`Release created successfully! (id: ${releaseData.id})`);
  }

  // Upload assets
  const assetsToUpload = [
    { name: 'HexCards-Setup-1.0.0.exe', filePath: installerPath },
    { name: 'HexCards-1.0.0-portable.exe', filePath: portablePath }
  ];

  for (const asset of assetsToUpload) {
    if (!fs.existsSync(asset.filePath)) {
      console.warn(`File ${asset.filePath} does not exist, skipping.`);
      continue;
    }

    // Check if asset already uploaded
    const existing = releaseData.assets?.find(a => a.name === asset.name);
    if (existing) {
      console.log(`Asset ${asset.name} already exists (id: ${existing.id}). Deleting old asset first...`);
      await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/assets/${existing.id}`, {
        method: 'DELETE',
        headers
      });
      console.log(`Old asset deleted.`);
    }

    const fileSize = fs.statSync(asset.filePath).size;
    console.log(`Uploading ${asset.name} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)...`);

    const fileStream = fs.createReadStream(asset.filePath);
    const uploadUrl = `https://uploads.github.com/repos/${OWNER}/${REPO}/releases/${releaseData.id}/assets?name=${encodeURIComponent(asset.name)}`;

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'HexCards-Release-Uploader',
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileSize.toString()
      },
      body: fileStream,
      duplex: 'half'
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error(`Failed to upload ${asset.name}:`, uploadRes.status, errText);
    } else {
      const uploadedData = await uploadRes.json();
      console.log(`Successfully uploaded ${asset.name}! Direct download URL: ${uploadedData.browser_download_url}`);
    }
  }

  console.log('\nAll release assets processed successfully!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
