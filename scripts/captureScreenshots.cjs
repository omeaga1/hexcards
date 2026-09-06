const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    webPreferences: {
      offscreen: true
    }
  });

  const scratchDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  console.log('Loading dev server...');
  await win.loadURL('http://127.0.0.1:5173');
  await new Promise(r => setTimeout(r, 2500));

  // 1. Items View (Desktop)
  let img = await win.capturePage();
  fs.writeFileSync(path.join(scratchDir, 'updated_items_desktop.png'), img.toPNG());
  console.log('Saved updated_items_desktop.png');

  // 2. Click Runes Tab
  await win.webContents.executeJavaScript(`
    const buttons = Array.from(document.querySelectorAll('button'));
    const runesBtn = buttons.find(b => b.textContent && b.textContent.includes('RUNES'));
    if (runesBtn) runesBtn.click();
  `);
  await new Promise(r => setTimeout(r, 1000));

  // 3. Runes View (Desktop)
  img = await win.capturePage();
  fs.writeFileSync(path.join(scratchDir, 'updated_runes_desktop.png'), img.toPNG());
  console.log('Saved updated_runes_desktop.png');

  // 4. Mobile Viewport
  win.setSize(390, 844);
  await new Promise(r => setTimeout(r, 500));
  img = await win.capturePage();
  fs.writeFileSync(path.join(scratchDir, 'updated_runes_mobile.png'), img.toPNG());
  console.log('Saved updated_runes_mobile.png');

  // 5. Back to Items on Mobile
  await win.webContents.executeJavaScript(`
    const buttons = Array.from(document.querySelectorAll('button'));
    const itemsBtn = buttons.find(b => b.textContent && b.textContent.includes('ITEMS'));
    if (itemsBtn) itemsBtn.click();
  `);
  await new Promise(r => setTimeout(r, 1000));
  img = await win.capturePage();
  fs.writeFileSync(path.join(scratchDir, 'updated_items_mobile.png'), img.toPNG());
  console.log('Saved updated_items_mobile.png');

  app.quit();
});
