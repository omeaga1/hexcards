import React, { useState } from 'react';
import { 
  Shield, 
  Download, 
  Zap, 
  Sparkles, 
  Laptop, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Eye, 
  Compass, 
  BookOpen, 
  Lock,
  ArrowLeftRight,
  HelpCircle
} from 'lucide-react';
import { getItemIconUrl } from '../../services/ddragon';

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

interface LandingPageProps {
  version: string;
  onLaunchWeb: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ version, onLaunchWeb }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const downloadUrl = 'https://github.com/omeaga1/hexcards/releases/download/v1.0.11/HexCards-Setup-1.0.11.exe';

  const faqs = [
    {
      q: 'Will Riot Vanguard ban or flag me for using HexCards?',
      a: 'Absolutely not. HexCards strictly communicates via Riot Games official out-of-game League Client Update (LCU) REST API (the exact same local API used by Riot own client and plugins). It performs ZERO in-game memory reading, ZERO DLL injection, and ZERO DirectX overlay hooking. It is 100% compliant with Riot Games Terms of Service and Vanguard anti-cheat.'
    },
    {
      q: 'Why can\'t the Web Version automatically import builds into my game?',
      a: 'Modern web browsers enforce strict security sandboxing (CORS and local network isolation), which prevents websites from directly connecting to your local League client socket without third-party browser extensions. The HexCards Desktop Companion runs natively on your PC with an embedded local bridge, allowing 1-click in-game shop and rune export.'
    },
    {
      q: 'How do updates work for the Desktop App?',
      a: 'HexCards includes a built-in background updater connected to our official GitHub releases. When a new League patch or HexCards release drops, the desktop companion downloads the update silently and notifies you with a "Update Ready • Restart" button. One click applies the update seamlessly with zero setup wizards.'
    },
    {
      q: 'How is HexCards completely ad-free and free to use?',
      a: 'HexCards was built by competitive players frustrated with legacy companion apps that force 30-second unskippable video ads and hog 1.5 GB of RAM via Overwolf. HexCards is free, open-source, and engineered for pure tactical clarity.'
    },
    {
      q: 'Why does Windows SmartScreen show "Windows protected your PC"?',
      a: 'This is standard Windows Defender behavior for newly released open-source apps that do not pay thousands of dollars annually for EV corporate signing certificates. HexCards is 100% open-source, safe, and transparent. To install: simply click "More info" and then "Run anyway". You can inspect the entire codebase and automated GitHub release builds anytime on our public GitHub repository.'
    },
    {
      q: 'Can I run HexCards on a second monitor or while alt-tabbed?',
      a: 'Yes! HexCards is designed to sit comfortably on a secondary monitor, in a side-by-side window, or alt-tabbed. It also includes an Always-On-Top toggle in the title bar if you prefer to keep your tactical matrix pinned over your client.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 deadlock-hatched flex flex-col font-['Barlow_Condensed'] selection:bg-emerald-500 selection:text-white">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-slate-950 text-slate-300 px-4 py-1.5 text-xs text-center border-b border-slate-800 flex items-center justify-center gap-2 font-mono flex-wrap">
        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>v1.0.11 Live</span>
        </span>
        <span className="text-slate-500">•</span>
        <span>Synced with Riot Data Dragon Patch {version}</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400">Zero Ads • Zero Overwolf Bloat • 100% Vanguard Safe</span>
      </div>

      {/* 2. STICKY NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center shadow-xs">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider uppercase leading-none">
                HEX<span className="text-emerald-600">CARDS</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[9px] font-mono font-bold uppercase border border-emerald-200">
                Desktop Companion
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-wider text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#desktop-vs-web" className="hover:text-emerald-600 transition-colors">Desktop vs Web</a>
            <a href="#comparison" className="hover:text-emerald-600 transition-colors">Comparison</a>
            <a href="#setup" className="hover:text-emerald-600 transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
            <a 
              href="https://github.com/omeaga1/hexcards" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={onLaunchWeb}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Launch HexCards directly in your browser (manual reference mode)"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Web Version</span>
            </button>

            <a
              href={downloadUrl}
              className="px-3.5 sm:px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow active:scale-95 group"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>Download .exe</span>
            </a>
          </div>

        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-[#f8fafc]">
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          
          {/* Vanguard Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black uppercase tracking-wider shadow-2xs animate-in fade-in duration-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Riot Vanguard Compliant • Out-of-Game LCU REST API Only</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-slate-950 leading-[0.95] max-w-4xl mx-auto">
            ITEMIZE LIKE A CHALLENGER. <br />
            <span className="text-emerald-600">WITHOUT THE AD BLOAT & CPU LAG.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-sans leading-relaxed">
            HexCards replaces bloated 1.5GB overlay apps with a high-performance tactical companion. Get instant Deadlock-style visual item matrices, connected build lineages, and 1-click Riot Client shop injection.
          </p>

          {/* Dual Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            
            <a
              href={downloadUrl}
              className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base sm:text-lg font-black uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all cursor-pointer active:scale-95 group"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              <span>Download 1-Click Installer</span>
            </a>

            <button
              onClick={onLaunchWeb}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border-2 border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 text-slate-800 hover:text-emerald-900 text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>Use Web Version</span>
            </button>

          </div>

          {/* Quick Install Reassurance */}
          <div className="pt-1 flex flex-col items-center justify-center gap-1.5 text-xs text-slate-500 font-sans">
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600 flex-wrap justify-center">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ⚡ 1-Click Silent Install (3s)
              </span>
              <span>•</span>
              <span>No Account or Sign-Up Needed</span>
              <span>•</span>
              <a 
                href="https://github.com/omeaga1/hexcards/releases" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-500 hover:text-emerald-600 underline decoration-slate-300"
              >
                All Releases (v1.0.11)
              </a>
            </div>
            <p className="text-[11px] text-slate-400 max-w-md text-center leading-tight">
              Windows SmartScreen: Click <span className="font-semibold text-slate-600">"More info"</span> &rarr; <span className="font-semibold text-slate-600">"Run anyway"</span> (Safe & Open Source).
            </p>
          </div>

          {/* Technical Specs Callout */}
          <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-500 font-mono flex-wrap">
            <span>Version: <strong>v1.0.11</strong></span>
            <span>•</span>
            <span>OS: <strong>Windows 10 / 11 (64-bit)</strong></span>
            <span>•</span>
            <span>Footprint: <strong>~60 MB RAM</strong></span>
            <span>•</span>
            <span>Updates: <strong>Silent Auto-Update</strong></span>
          </div>

          {/* Key Differentiators / Stat Counters */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-3xl font-black text-slate-900 font-['Barlow_Condensed'] block leading-none">
                ~60 MB
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mt-1">
                Zero RAM Bloat
              </span>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5 leading-tight">
                vs 1.2GB+ on Overwolf & Blitz
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-3xl font-black text-emerald-600 font-['Barlow_Condensed'] block leading-none">
                0 ADS
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mt-1">
                Never Interrupted
              </span>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5 leading-tight">
                No unskippable 30s video ads
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-3xl font-black text-slate-900 font-['Barlow_Condensed'] block leading-none">
                1-CLICK
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mt-1">
                Riot Client Sync
              </span>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5 leading-tight">
                Injects custom shop & runes
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-3xl font-black text-emerald-600 font-['Barlow_Condensed'] block leading-none">
                100%
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mt-1">
                Vanguard Safe
              </span>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5 leading-tight">
                Out-of-game LCU REST API only
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* 4. DESKTOP VS WEB VERSION COMPARISON SECTION */}
      <section id="desktop-vs-web" className="py-14 max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="deadlock-badge px-2.5 py-0.5 text-xs text-emerald-800 bg-emerald-50 border-emerald-300">
            <span>CHOOSE YOUR EXPERIENCE</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
            DESKTOP COMPANION VS. WEB VERSION
          </h2>
          <p className="text-sm text-slate-600 font-sans">
            Need in-game client auto-imports and Champ Select detection? Download the Desktop Companion. Just want to review builds on your phone or second browser? The Web Version has you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Card 1: Desktop Companion (Featured) */}
          <div className="relative rounded-2xl bg-white border-2 border-emerald-500 p-6 shadow-xl flex flex-col justify-between">
            <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs">
              RECOMMENDED FOR PLAYERS
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-xs">
                  <Laptop className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase text-slate-900 leading-tight">
                    HexCards Desktop Companion
                  </h3>
                  <span className="text-xs font-mono text-emerald-700 font-bold">
                    Native Windows 10/11 Executable (.exe)
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                The ultimate hands-off experience. Automatically connects to your League of Legends client during Champ Select and injects complete shop pages and runes with a single click.
              </p>

              <div className="space-y-2.5 pt-2 font-sans text-xs">
                <div className="flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>1-Click Riot Client Auto-Import:</strong> Instantly injects item sets directly into your in-game shop tabs.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Automatic Champ Select Detection:</strong> Detects locked-in champions and direct lane opponents automatically.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>[Tab] Pinning Inspection Windows:</strong> Pin draggable hover cards anywhere on your monitors.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Always-on-Top Companion Mode:</strong> Pin seamlessly beside your game without overlay lag.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Silent Auto-Updates:</strong> Always synced with the latest League patch seamlessly.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <a
                href={downloadUrl}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download HexCards Setup (.exe)</span>
              </a>
              <span className="block text-center text-[10px] text-slate-400 font-mono mt-2">
                112 MB • Fast, self-contained NSIS installer
              </span>
            </div>
          </div>

          {/* Card 2: Web Version */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase text-slate-900 leading-tight">
                    HexCards Web Version
                  </h3>
                  <span className="text-xs font-mono text-slate-500 font-bold">
                    Runs in Any Modern Browser
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Quick reference mode for players who want to explore builds, study item lineages, or browse on phones, tablets, or Mac without installing anything.
              </p>

              <div className="space-y-2.5 pt-2 font-sans text-xs">
                <div className="flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Full Champion Item Decks:</strong> Complete chronological rush highways and situational threat pods.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Connected Build Lineage:</strong> View component-to-upgrade diagrams (e.g. Executioner's to Mortal Reminder).</span>
                </div>
                <div className="flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Baldur's Gate 3 Tooltips:</strong> Interactive plain-English glossary definitions for all mechanics.</span>
                </div>
                <div className="flex items-start gap-2 text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <XCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span><strong>No Client Auto-Import:</strong> Browser security restrictions prevent direct connection to local League client. In-game shop export requires the Desktop app.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                onClick={onLaunchWeb}
                className="w-full py-3 px-4 rounded-xl border-2 border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-white text-slate-800 hover:text-emerald-900 font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Launch Web Companion (Online)</span>
              </button>
              <span className="block text-center text-[10px] text-slate-400 font-mono mt-2">
                Works on Chrome, Edge, Firefox, Safari & Mobile
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* 5. INTERACTIVE LIVE DECK SHOWCASE */}
      <section id="features" className="py-14 bg-slate-900 text-white border-y border-slate-800">
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700 text-xs font-mono font-bold uppercase tracking-wider">
              TACTICAL INTERFACE PREVIEW
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              BUILT FOR SPLIT-SECOND IN-GAME DECISIONS
            </h2>
            <p className="text-sm text-slate-400 font-sans">
              No walls of text. Every champion deck organizes items into clean chronological spikes, situational threat pods, and clear swap lineages.
            </p>
          </div>

          {/* Mock Deck Showcase Card: Jinx Tactical Deck */}
          <div className="rounded-2xl bg-[#141e17] border-2 border-emerald-500/80 p-5 sm:p-7 shadow-2xl space-y-6">
            
            {/* Header: Champion + Patch */}
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://ddragon.leagueoflegends.com/cdn/16.17.1/img/champion/Jinx.png"
                  alt="Jinx"
                  className="w-12 h-12 rounded-xl border-2 border-emerald-500 shadow-md object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black uppercase tracking-wide text-white">Jinx</h3>
                    <span className="px-2 py-0.2 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700 text-[10px] font-mono font-bold uppercase">
                      HYPERCARRY ADC
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-sans">
                    Core Spike: Attack Speed & Critical Scaling • Patch {version} Synced
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1-Click LCU Shop Export Ready</span>
                </span>
              </div>
            </div>

            {/* Showcase Grid: Core Rush + Anti-Heal Pod */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Core Highway (2 cols) */}
              <div className="lg:col-span-2 rounded-xl bg-[#18231c] border border-[#2f4234] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-[#2a3c30] mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300">
                      Primary Core Rush Highway (Standard Order)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">3 Legendaries</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1">
                  {/* Item 1 */}
                  <div className="rounded-lg bg-[#212f25] border border-emerald-600/60 p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono font-black uppercase text-emerald-400 bg-emerald-950/80 px-1 rounded">RUSH #1</span>
                      <span className="text-[10px] font-mono text-amber-400">3000g</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={getItemIconUrl(version, '3032')} alt="Yun Tal" className="w-9 h-9 rounded border border-emerald-500" />
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">Yun Tal Wildarrows</span>
                        <span className="text-[9px] text-slate-400 block font-sans">Crit Bleed On-Hit</span>
                      </div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="rounded-lg bg-[#212f25] border border-emerald-600/60 p-2.5 flex flex-col justify-between ring-2 ring-emerald-500/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono font-black uppercase text-emerald-400 bg-emerald-950/80 px-1 rounded">CORE #2</span>
                      <span className="text-[10px] font-mono text-amber-400">3400g</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={getItemIconUrl(version, '3031')} alt="Infinity Edge" className="w-9 h-9 rounded border border-emerald-500" />
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">Infinity Edge</span>
                        <span className="text-[9px] text-emerald-300 block font-sans">Peak Crit Damage</span>
                      </div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="rounded-lg bg-[#212f25] border border-emerald-600/60 p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono font-black uppercase text-emerald-400 bg-emerald-950/80 px-1 rounded">CORE #3</span>
                      <span className="text-[10px] font-mono text-amber-400">3000g</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={getItemIconUrl(version, '3302')} alt="Terminus" className="w-9 h-9 rounded border border-emerald-500" />
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">Terminus</span>
                        <span className="text-[9px] text-slate-400 block font-sans">30% Dual Pen</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#2a3c30] text-[11px] text-slate-400 font-sans flex items-center justify-between">
                  <span>Power Spike: Highest sustained DPS in teamfights upon hitting Core #2 (Infinity Edge).</span>
                  <span className="text-emerald-400 font-mono text-[10px]">100% Winrate Path</span>
                </div>
              </div>

              {/* Connected Lineage Anti-Heal Pod (1 col) */}
              <div className="rounded-xl bg-[#18231c] border-2 border-rose-500/60 p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-[#2a3c30] mb-2">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-300">
                    Connected Lineage & Swap
                  </span>
                  <span className="text-[9px] font-mono font-bold uppercase text-rose-400 bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-800">
                    ANTI-HEAL
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 py-1">
                  {/* Executioner's */}
                  <div className="p-2 rounded bg-[#212f25] border border-amber-500/50 text-center flex-1">
                    <span className="text-[8px] font-mono font-black uppercase text-amber-400 block mb-1">EARLY BUY</span>
                    <img src={getItemIconUrl(version, '3123')} alt="Executioner's" className="w-8 h-8 rounded mx-auto mb-1 border border-amber-400" />
                    <span className="text-[10px] font-bold text-slate-200 block leading-tight">Executioner's</span>
                    <span className="text-[9px] font-mono text-amber-300">800g</span>
                  </div>

                  {/* Connection Arrow */}
                  <div className="flex flex-col items-center justify-center px-1">
                    <span className="text-[8px] font-mono font-black text-rose-400 uppercase">BUILDS</span>
                    <ArrowRight className="w-4 h-4 text-rose-400 animate-pulse" />
                  </div>

                  {/* Mortal Reminder */}
                  <div className="p-2 rounded bg-[#212f25] border border-rose-500/70 text-center flex-1">
                    <span className="text-[8px] font-mono font-black uppercase text-rose-400 block mb-1">LATE UPGRADE</span>
                    <img src={getItemIconUrl(version, '3033')} alt="Mortal Reminder" className="w-8 h-8 rounded mx-auto mb-1 border border-rose-400" />
                    <span className="text-[10px] font-bold text-slate-200 block leading-tight">Mortal Reminder</span>
                    <span className="text-[9px] font-mono text-amber-300">3000g</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-[#2a3c30] text-[10.5px] text-rose-300 font-sans text-center leading-snug">
                  Buy <strong>Executioner's (800g)</strong> early ➔ Upgrade late to swap <strong>Infinity Edge</strong> against heavy healing comps.
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* 6. COMPETITOR COMPARISON TABLE */}
      <section id="comparison" className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="deadlock-badge px-2.5 py-0.5 text-xs text-emerald-800 bg-emerald-50 border-emerald-300">
            <span>THE RAW TRUTH</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
            HEXCARDS VS. THE LEGACY OVERLAY CLUTTER
          </h2>
          <p className="text-sm text-slate-600 font-sans">
            Compare HexCards side-by-side with mainstream League companion apps.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-['Barlow_Condensed'] font-black uppercase text-xs sm:text-sm tracking-wider">
                <th className="py-3 px-4 sm:px-6">Feature / Capability</th>
                <th className="py-3 px-4 text-emerald-700 bg-emerald-50/70 border-x border-emerald-200 text-center">HexCards Companion</th>
                <th className="py-3 px-4 text-slate-600 text-center">Blitz.gg</th>
                <th className="py-3 px-4 text-slate-600 text-center">Porofessor</th>
                <th className="py-3 px-4 text-slate-600 text-center">Mobalytics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">Video Ads & Popups</td>
                <td className="py-3 px-4 bg-emerald-50/40 border-x border-emerald-200 text-center font-bold text-emerald-700">
                  ❌ NEVER (0 Ads)
                </td>
                <td className="py-3 px-4 text-center text-rose-600">30s Unskippable</td>
                <td className="py-3 px-4 text-center text-rose-600">Heavy Banner Ads</td>
                <td className="py-3 px-4 text-center text-rose-600">Subscription Ads</td>
              </tr>

              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">Memory / RAM Overhead</td>
                <td className="py-3 px-4 bg-emerald-50/40 border-x border-emerald-200 text-center font-bold text-emerald-700">
                  🟢 ~60 MB
                </td>
                <td className="py-3 px-4 text-center text-slate-600">1,200 MB+</td>
                <td className="py-3 px-4 text-center text-slate-600">800 MB+</td>
                <td className="py-3 px-4 text-center text-slate-600">950 MB+</td>
              </tr>

              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">Overwolf Engine Required?</td>
                <td className="py-3 px-4 bg-emerald-50/40 border-x border-emerald-200 text-center font-bold text-emerald-700">
                  ❌ NO (Standalone)
                </td>
                <td className="py-3 px-4 text-center text-rose-600">Yes (Heavy Layer)</td>
                <td className="py-3 px-4 text-center text-rose-600">Yes (Overwolf)</td>
                <td className="py-3 px-4 text-center text-rose-600">Yes (Overwolf)</td>
              </tr>

              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">1-Click Shop & Rune Sync</td>
                <td className="py-3 px-4 bg-emerald-50/40 border-x border-emerald-200 text-center font-bold text-emerald-700">
                  ✅ Direct LCU REST API
                </td>
                <td className="py-3 px-4 text-center text-emerald-700">Yes</td>
                <td className="py-3 px-4 text-center text-emerald-700">Yes</td>
                <td className="py-3 px-4 text-center text-emerald-700">Yes</td>
              </tr>

              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">Item Build Intelligence</td>
                <td className="py-3 px-4 bg-emerald-50/40 border-x border-emerald-200 text-center font-bold text-emerald-700">
                  Tactical Pods + Lineages
                </td>
                <td className="py-3 px-4 text-center text-slate-500">Static Autopilot</td>
                <td className="py-3 px-4 text-center text-slate-500">Static Autopilot</td>
                <td className="py-3 px-4 text-center text-slate-500">Static Autopilot</td>
              </tr>

              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">In-Game FPS Drops / Lag</td>
                <td className="py-3 px-4 bg-emerald-50/40 border-x border-emerald-200 text-center font-bold text-emerald-700">
                  🟢 0% Impact (External)
                </td>
                <td className="py-3 px-4 text-center text-amber-600">Frequent Microstutter</td>
                <td className="py-3 px-4 text-center text-amber-600">Noticeable Drops</td>
                <td className="py-3 px-4 text-center text-amber-600">Occasional Drops</td>
              </tr>

              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">Price & Licensing</td>
                <td className="py-3 px-4 bg-emerald-50/40 border-x border-emerald-200 text-center font-bold text-emerald-700">
                  100% Free & Open Source
                </td>
                <td className="py-3 px-4 text-center text-slate-600">$4.99/mo for No Ads</td>
                <td className="py-3 px-4 text-center text-slate-600">$3.99/mo for Premium</td>
                <td className="py-3 px-4 text-center text-slate-600">$5.99/mo Plus Tier</td>
              </tr>

            </tbody>
          </table>
        </div>

      </section>

      {/* 7. QUICK 3-STEP SETUP GUIDE */}
      <section id="setup" className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="deadlock-badge px-2.5 py-0.5 text-xs text-emerald-800 bg-emerald-50 border-emerald-300">
              <span>ZERO CONFIGURATION</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
              GET READY IN 3 SIMPLE STEPS
            </h2>
            <p className="text-sm text-slate-600 font-sans">
              No account creation, no Discord logins, no terminal scripts. Just install and queue up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-base flex items-center justify-center font-['Barlow_Condensed']">
                1
              </span>
              <h3 className="text-lg font-black uppercase text-slate-900">
                Download HexCards
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Download the lightweight <strong className="text-slate-800">HexCards-Setup-1.0.11.exe</strong> installer. It takes about 3 seconds to install silently. If Windows SmartScreen pops up, click <em>"More info" &rarr; "Run anyway"</em>.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-base flex items-center justify-center font-['Barlow_Condensed']">
                2
              </span>
              <h3 className="text-lg font-black uppercase text-slate-900">
                Launch League of Legends
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Open League. HexCards immediately detects your client and lights up green with <strong className="text-emerald-700">"Connected to Summoner"</strong>.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-base flex items-center justify-center font-['Barlow_Condensed']">
                3
              </span>
              <h3 className="text-lg font-black uppercase text-slate-900">
                1-Click Export to Shop
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                In Champ Select, click <strong className="text-emerald-700">"Export"</strong> to inject custom shop tabs and rune pages directly into your in-game client!
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section id="faq" className="py-14 max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="deadlock-badge px-2.5 py-0.5 text-xs text-emerald-800 bg-emerald-50 border-emerald-300">
            <span>TRANSPARENCY</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
            FREQUENTLY ASKED QUESTIONS
          </h2>
        </div>

        <div className="space-y-3 font-sans">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 sm:px-5 py-3.5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 font-['Barlow_Condensed'] uppercase tracking-wide">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* 9. BOTTOM CTA BANNER */}
      <section className="py-14 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
            STOP LETTING OVERLAYS LAG YOUR MATCHES.
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-xl mx-auto font-sans">
            Download the standalone HexCards companion app today. 100% free, zero ads, zero bloat.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={downloadUrl}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black uppercase tracking-wider text-base flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-5 h-5 text-emerald-400" />
              <span>Download for Windows (v1.0.11)</span>
            </a>

            <button
              onClick={onLaunchWeb}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-black uppercase tracking-wider text-base flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Globe className="w-5 h-5" />
              <span>Browse Web Version</span>
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-800 font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-950 border border-emerald-700 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-['Barlow_Condensed'] font-black uppercase tracking-wider text-slate-200 text-sm">
              HEX<span className="text-emerald-500">CARDS</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-[11px] text-slate-500">v1.0.11</span>
          </div>

          <p className="text-[11px] text-slate-500 text-center sm:text-left max-w-xl">
            HexCards isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
          </p>

          <div className="flex items-center gap-4 text-xs font-['Barlow_Condensed'] font-bold uppercase">
            <a 
              href="https://github.com/omeaga1/hexcards" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <button 
              onClick={onLaunchWeb}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Web Version
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
};
