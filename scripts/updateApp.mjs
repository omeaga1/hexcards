import fs from 'fs';

const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!content.includes("import { useDevice }")) {
  content = content.replace(
    "import { Loader2, AlertCircle, ShoppingBag, Sparkles, Compass, Layers } from 'lucide-react';",
    "import { Loader2, AlertCircle, ShoppingBag, Sparkles, Compass, Layers } from 'lucide-react';\nimport { useDevice } from './hooks/useDevice';"
  );
}

// 2. Add hook inside AppContent
if (!content.includes("const { isMobile } = useDevice();")) {
  content = content.replace(
    "const [detailLoading, setDetailLoading] = useState<boolean>(false);",
    "const [detailLoading, setDetailLoading] = useState<boolean>(false);\n  const { isMobile } = useDevice();"
  );
}

// 3. Update main class
const oldMain = "className={`flex-1 w-full mx-auto py-1.5 sm:py-2 space-y-2 ${activeTab === 'items' ? 'max-w-[99vw] px-2 sm:px-3 lg:px-5' : 'max-w-7xl px-3 sm:px-4'}`}";
const newMain = "className={`flex-1 w-full mx-auto py-1.5 sm:py-2 space-y-2 ${isMobile ? 'pb-16 px-1.5' : activeTab === 'items' ? 'max-w-[99vw] px-2 sm:px-3 lg:px-5' : 'max-w-7xl px-3 sm:px-4'}`}";

if (content.includes(oldMain)) {
  content = content.replace(oldMain, newMain);
}

// 4. Update ChampionSelector props
const oldChampSelector = `<ChampionSelector
            version={version}
            champions={filteredChampions}
            selectedChampionId={selectedChampionId}
            onSelectChampion={(champId) => {
              setSelectedChampionId(champId);
              setIsSelectorExpanded(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />`;

const newChampSelector = `<ChampionSelector
            version={version}
            champions={filteredChampions}
            selectedChampionId={selectedChampionId}
            onSelectChampion={(champId) => {
              setSelectedChampionId(champId);
              setIsSelectorExpanded(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            selectedRole={selectedRole}
            onSelectRole={(role) => setSelectedRole(role)}
          />`;

if (content.includes(oldChampSelector)) {
  content = content.replace(oldChampSelector, newChampSelector);
}

// 5. Add mobile bottom navigation bar before </footer>
const oldFooter = `      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-2 text-center text-[11px] text-slate-500 font-['Barlow_Condensed']">`;

const newFooter = `      {/* Mobile Sticky Bottom Tab Bar (Thumb Navigation) */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg select-none font-['Barlow_Condensed']">
          <button
            onClick={() => {
              setActiveTab('items');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={\`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all touch-manipulation active:scale-95 cursor-pointer \${
              activeTab === 'items'
                ? 'text-emerald-600 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }\`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Items</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('abilities');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={\`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all touch-manipulation active:scale-95 cursor-pointer \${
              activeTab === 'abilities'
                ? 'text-emerald-600 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }\`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Abilities</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('runes');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={\`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all touch-manipulation active:scale-95 cursor-pointer \${
              activeTab === 'runes'
                ? 'text-emerald-600 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }\`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Runes</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={\`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all touch-manipulation active:scale-95 cursor-pointer \${
              activeTab === 'all'
                ? 'text-emerald-600 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }\`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">All-in-One</span>
          </button>
        </nav>
      )}

      {/* Footer */}
      <footer className={\`border-t border-slate-200 bg-white py-2 text-center text-[11px] text-slate-500 font-['Barlow_Condensed'] \${isMobile ? 'pb-14' : ''}\`}>`;

if (content.includes(oldFooter)) {
  content = content.replace(oldFooter, newFooter);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('App.tsx successfully updated with mobile bottom bar & role props!');
