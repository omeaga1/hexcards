# HexCards: LoL Champion Quick Cards & Pivot Matrix ⚔️🛡️

A high-performance, distraction-free companion web app for League of Legends players. Designed to eliminate the overwhelming clutter of overlays like Blitz and Mobalytics, **HexCards** gives you actionable, plain-English tactical intelligence, teaches you *why* items and runes are chosen, and dynamically guides your **situational item pivoting** against enemy threats.

---

## 🌟 Key Features

### 1. The "If / Then" Item Pivot Matrix (Core Feature)
- **Stops the Auto-Pilot Problem**: Auto-import overlays keep players on rigid build paths, causing them to lose against heavy healing, armor stackers, or fed assassins.
- **Dynamic Threat Rules**:
  - 🩸 **Healing Threat** (Aatrox, Soraka, Warwick, Vlad, Briar) ➔ Highlights *Mortal Reminder / Chempunk Chainsword / Morellonomicon / Bramble Vest* with recommended timing (800g early component!).
  - 🛡️ **Armor Stacking / 2+ Tanks** (Malphite, Rammus, K'Sante) ➔ Highlights *Lord Dominik's Regards / Black Cleaver / Void Staff*.
  - 💥 **Burst Magic AP Threat** (Akali, Syndra, Evelynn) ➔ Highlights *Kaenic Rookern / Maw of Malmortius / Banshee's Veil*.
  - 🗡️ **Burst Physical AD Assassin** (Zed, Talon, Rengar) ➔ Highlights *Death's Dance / Zhonya's / Guardian Angel / Plated Steelcaps*.
  - 🧲 **Suppression & Chain CC** (Malzahar, Warwick, Skarner) ➔ Highlights *Quicksilver Sash (QSS)*.
  - 🛡️ **Excessive Shields** (Sett, Tahm Kench, Karma, Lulu) ➔ Highlights *Serpent's Fang*.
  - 👟 **Boots Decision Guide**: Swift 3-second comparison of Plated Steelcaps vs. Mercury's Treads vs. Swifties vs. Lucidity.

### 2. Interactive Matchup Simulator ("Who Are You Playing Against?")
- Pick up to 5 enemy champions or toggle common team comp threats (*Heavy Healing*, *Armor Tanks*, *Burst AP*, etc.).
- The app dynamically evaluates the enemy team comp and **lights up active pivot cards** with glowing alert badges so you know what to build before you even leave base.

### 3. Abilities in Plain English ("What It Does & When to Press It")
- Replaces Riot's 5-paragraph mathematical formulas with clear, human-translated cards:
  - **What it actually does**: 1-2 bullet points.
  - **When to press it**: Real tactical triggers (e.g. *"Save E to cancel dashes or escape over thin walls"*).
  - **Skill Max Order**: Visual path (`Q > E > W`) with reasoning.
  - **Bread-and-Butter Combos**: Sequence chips with execution tips.

### 4. LoL Terminology Demystifier (Integrated Glossary)
- Instant hover popovers and a full searchable dictionary for confusing game jargon:
  - **Grievous Wounds**: How 40% healing reduction works and why ignoring it loses games.
  - **Tenacity**: What CC it reduces (stuns, roots, silences) and what it DOES NOT reduce (knockups, suppression!).
  - **Lethality vs. % Armor Pen**: Flat reduction (good vs squishies) vs Percentage shred (mandatory vs tanks).
  - **Omnivamp vs. Lifesteal**: Basic attacks only vs all damage healing.
  - **Suppression vs. Stun**: Why Cleanse fails against Suppression and why only QSS works.
  - **Adaptive Force, Spell Shields, True Damage, and more**.

### 5. Always Up to Date with Live Riot Patches
- Automatically queries Riot's official Data Dragon API on launch (`https://ddragon.leagueoflegends.com/api/versions.json`).
- Automatically syncs the latest patch (currently `v16.17.1`), champion assets, item stats, and spell icons with **zero API keys required**.
- Built-in local caching for instantaneous sub-second loading.

---

## 🚀 Getting Started (Run Locally)

### Prerequisites
- Node.js (v18+)

### Development Server
Run the local dev server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
To create an optimized production build:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 🌐 Deploying to the Web

Because HexCards is a pure client-side static web application with direct Riot CDN integration, you can host it for free in minutes:

- **GitHub Pages**: Build with `npm run build` and publish the `dist/` directory.
- **Vercel / Netlify**: Link your GitHub repository and set the build command to `npm run build` with publish directory `dist`.

---

## 🎨 Hextech Design System
- Built with **Tailwind CSS v4** and **Lucide Icons**.
- Obsidian Navy (`#091428`, `#0a1428`), Hextech Gold (`#c8aa6e`, `#785a28`), Hextech Cyan (`#0ac8b9`), and Ruby Alert accents (`#e84057`).
- High-contrast typography designed for quick glances during loading screens or shop visits.
