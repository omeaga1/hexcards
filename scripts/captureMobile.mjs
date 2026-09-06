import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  if (!fs.existsSync('scratch')) fs.mkdirSync('scratch');
  
  // 1. Capture initial mobile view with bottom tab bar
  await page.screenshot({ path: 'scratch/mobile_viewport_new.png' });
  console.log('1. Captured mobile_viewport_new.png');

  // 2. Click an item card to test Mobile Bottom Sheet Item Inspector
  const firstCard = await page.$('[data-card-id]');
  if (firstCard) {
    await firstCard.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'scratch/mobile_item_inspector.png' });
    console.log('2. Captured mobile_item_inspector.png');

    // Dismiss bottom sheet
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close Inspector'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 400));
  }

  // 3. Test Stage Filter on Mobile
  await page.evaluate(() => {
    const stage2Btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('2: Core 1-2'));
    if (stage2Btn) stage2Btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/mobile_stage_filter.png' });
  console.log('3. Captured mobile_stage_filter.png');

  // 4. Test Abilities Tab from Bottom Dock
  await page.evaluate(() => {
    const abilitiesBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent.includes('Abilities'));
    if (abilitiesBtn) abilitiesBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'scratch/mobile_abilities_tab.png' });
  console.log('4. Captured mobile_abilities_tab.png');

  // 5. Test Champion Selector Drawer with Role Filter Pills
  await page.evaluate(() => {
    const champsBtn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('CHAMPS'));
    if (champsBtn) champsBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'scratch/mobile_champion_selector.png' });
  console.log('5. Captured mobile_champion_selector.png');

  await browser.close();
  console.log('All mobile tests completed successfully!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
