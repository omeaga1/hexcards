import fs from 'fs';

const filePath = 'src/components/ChampionCard/DeadlockItemDeck.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!content.includes("import { useDevice }")) {
  content = content.replace(
    "import { usePinnedCards } from '../../context/PinnedCardContext';",
    "import { usePinnedCards } from '../../context/PinnedCardContext';\nimport { useDevice } from '../../hooks/useDevice';"
  );
}

// 2. Add state
if (!content.includes("showMobileDrawer")) {
  content = content.replace(
    "const [selectedCard, setSelectedCard] = useState<TacticalCard | null>(null);",
    `const [selectedCard, setSelectedCard] = useState<TacticalCard | null>(null);
  const { isMobile, isTouch } = useDevice();
  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);
  const [mobileStageFilter, setMobileStageFilter] = useState<'all' | 'stage_1' | 'stage_2' | 'stage_3' | 'stage_4' | 'counters'>('all');`
  );
}

// 3. Update onClick in renderCardNode
const oldOnClick = `        onClick={() => {
          setSelectedCard(card);
          setShowInspector(true);
          setHoveredCard(prev => (prev?.id === card.id ? null : card));
        }}`;

const newOnClick = `        onClick={() => {
          setSelectedCard(card);
          setHoveredCard(card);
          if (isMobile) {
            setShowMobileDrawer(true);
          } else {
            setShowInspector(true);
          }
        }}`;

if (content.includes(oldOnClick)) {
  content = content.replace(oldOnClick, newOnClick);
}

// 4. Update onMouseEnter & onMouseLeave
const oldMouseEnter = `        onMouseEnter={(e) => {
          setHoveredCard(card);`;

const newMouseEnter = `        onMouseEnter={(e) => {
          if (isMobile || isTouch) return;
          setHoveredCard(card);`;

if (content.includes(oldMouseEnter)) {
  content = content.replace(oldMouseEnter, newMouseEnter);
}

const oldMouseLeave = `        onMouseLeave={() => {
          setHoveredCard(null);
          unregisterHover(card.id);
        }}`;

const newMouseLeave = `        onMouseLeave={() => {
          if (isMobile || isTouch) return;
          setHoveredCard(null);
          unregisterHover(card.id);
        }}`;

if (content.includes(oldMouseLeave)) {
  content = content.replace(oldMouseLeave, newMouseLeave);
}

// 5. Add mobile stage filter pills under Utility Control Bar
const oldUtilityBarEnd = `        {/* Inspector Toggle */}
        <button
          onClick={() => setShowInspector(!showInspector)}
          className={\`px-2 py-0.5 rounded border text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer \${
            showInspector
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
              : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
          }\`}
        >
          {showInspector ? 'Inspector: On' : 'Inspector: Off'}
        </button>
      </div>`;

const newUtilityBarEnd = `        {/* Inspector Toggle */}
        <button
          onClick={() => setShowInspector(!showInspector)}
          className={\`px-2 py-0.5 rounded border text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer \${
            showInspector
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
              : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
          }\`}
        >
          {showInspector ? 'Inspector: On' : 'Inspector: Off'}
        </button>
      </div>

      {/* Mobile Stage Filter Tabs */}
      {isMobile && subView === 'canvas' && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 mb-1 border-b border-slate-100">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'stage_1', label: '1: Early' },
            { id: 'stage_2', label: '2: Core 1-2' },
            { id: 'stage_3', label: '3: Spike' },
            { id: 'stage_4', label: '4: Capstone' },
            { id: 'counters', label: 'Counters' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileStageFilter(tab.id as any)}
              className={\`px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all touch-manipulation \${
                mobileStageFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }\`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}`;

if (content.includes(oldUtilityBarEnd)) {
  content = content.replace(oldUtilityBarEnd, newUtilityBarEnd);
}

// 6. Stage filtering in Canvas view
const oldChronoMap = `{chronoStages.map((stage) => (`;
const newChronoMap = `{chronoStages
            .filter((stage) => {
              if (!isMobile || mobileStageFilter === 'all') return true;
              if (mobileStageFilter === 'counters') return false;
              return stage.id === mobileStageFilter;
            })
            .map((stage) => (`;

if (content.includes(oldChronoMap)) {
  content = content.replace(oldChronoMap, newChronoMap);
}

// 7. Situational counters section mobile filtering
const oldSituationalSection = `{/* TIER 2: SITUATIONAL COUNTERS & PIVOTS */}
          <div className="relative z-10 rounded-lg bg-white border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">`;

const newSituationalSection = `{/* TIER 2: SITUATIONAL COUNTERS & PIVOTS */}
          {(!isMobile || mobileStageFilter === 'all' || mobileStageFilter === 'counters') && (
          <div className="relative z-10 rounded-lg bg-white border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">`;

if (content.includes(oldSituationalSection)) {
  content = content.replace(oldSituationalSection, newSituationalSection);
}

// And close the bracket after situational pods
const oldSituationalClose = `              {situationalPods.map((pod, idx) => (
                <div
                  key={idx}
                  className="rounded bg-white border border-slate-200 p-1.5 flex flex-col justify-between shadow-2xs"
                >
                  <div className="pb-0.5 mb-1 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                      {pod.title}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 justify-start">
                    {pod.cards.map(renderCardNode)}
                  </div>
                </div>
              ))}
            </div>
          </div>`;

const newSituationalClose = `              {situationalPods.map((pod, idx) => (
                <div
                  key={idx}
                  className="rounded bg-white border border-slate-200 p-1.5 flex flex-col justify-between shadow-2xs"
                >
                  <div className="pb-0.5 mb-1 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                      {pod.title}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 justify-start">
                    {pod.cards.map(renderCardNode)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}`;

if (content.includes(oldSituationalClose)) {
  content = content.replace(oldSituationalClose, newSituationalClose);
}

// 8. Update status bar text
const oldStatusBarText = `Tactical Item Deck • Hover items to highlight swap options`;
const newStatusBarText = `{isMobile ? 'Tactical Item Deck • Tap items to inspect synergy & swaps' : 'Tactical Item Deck • Hover items to highlight swap options'}`;

if (content.includes(oldStatusBarText)) {
  content = content.replace(oldStatusBarText, newStatusBarText);
}

// 9. Add Mobile Drawer Sheet before closing </div>
const oldEnd = `      ) : (
        <PivotSwapGuide
          version={version}
          tactics={tactics}
          allItems={allItems}
        />
      )}
    </div>
  );
};`;

const newEnd = `      ) : (
        <PivotSwapGuide
          version={version}
          tactics={tactics}
          allItems={allItems}
        />
      )}

      {/* MOBILE BOTTOM SHEET ITEM INSPECTOR */}
      {isMobile && showMobileDrawer && activeInspectorCard && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 animate-in fade-in duration-150"
          onClick={() => setShowMobileDrawer(false)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-t-2xl p-4 shadow-2xl border-t-2 border-emerald-500 max-h-[85vh] overflow-y-auto font-sans animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

            {/* Header with Item Icon, Name, Category & Gold */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-lg border-2 border-emerald-500 overflow-hidden bg-white flex-shrink-0 shadow-sm">
                  <img
                    src={getItemIconUrl(version, activeInspectorCard.id)}
                    alt={activeInspectorCard.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-base font-black text-slate-900 leading-none uppercase tracking-wide font-['Barlow_Condensed']">
                      {activeInspectorCard.name}
                    </h3>
                    {inspectedGold && (
                      <span className="text-amber-800 font-bold text-xs bg-amber-50 px-1.5 py-0.2 rounded border border-amber-300 font-mono">
                        {inspectedGold}g
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-1 flex-wrap font-['Barlow_Condensed']">
                    {activeInspectorCard.isCore ? (
                      <span className="deadlock-badge px-1.5 py-0 text-[9.5px] text-emerald-700 bg-emerald-50 border-emerald-300">
                        <span>CORE #{activeInspectorCard.coreOrder || '1'}</span>
                      </span>
                    ) : activeInspectorCard.replacesSlot ? (
                      <span className="deadlock-badge px-1.5 py-0 text-[9.5px] text-rose-700 border-rose-300 bg-rose-50">
                        <span>REPLACES {activeInspectorCard.replacesSlot}</span>
                      </span>
                    ) : (
                      <span className="deadlock-badge px-1.5 py-0 text-[9.5px] text-slate-700">
                        <span>{activeInspectorCard.tag || 'SITUATIONAL'}</span>
                      </span>
                    )}
                    {activeInspectorCard.isActive && (
                      <span className="deadlock-active-tag text-[8px] py-0 px-1">
                        ACTIVE
                      </span>
                    )}
                    <span className="text-[9.5px] uppercase font-bold text-slate-500">
                      {activeInspectorCard.category}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowMobileDrawer(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors touch-manipulation cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipe Components (if any) */}
            {inspectedItemData?.from && inspectedItemData.from.length > 0 && (
              <div className="mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-500 block mb-1 font-['Barlow_Condensed']">
                  Recipe Components
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {inspectedItemData.from.map((compId) => {
                    const comp = allItems[compId];
                    if (!comp) return null;
                    return (
                      <div key={compId} className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                        <img src={getItemIconUrl(version, compId)} alt={comp.name} className="w-4 h-4 rounded object-cover" />
                        <span className="text-[10.5px] font-bold text-slate-800">{comp.name}</span>
                        {comp.gold?.total && (
                          <span className="text-[9.5px] font-mono font-bold text-amber-700">{comp.gold.total}g</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Kit Synergy & Purchase Trigger */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-800 block mb-0.5 font-['Barlow_Condensed']">
                  Kit Synergy & Function
                </span>
                <p className="text-slate-800 leading-relaxed text-[12px]">
                  <GlossaryText text={activeInspectorCard.whatItDoes} />
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-amber-800 block mb-0.5 font-['Barlow_Condensed']">
                  Tactical Purchase Trigger
                </span>
                <p className="text-slate-800 leading-relaxed text-[12px]">
                  <GlossaryText text={activeInspectorCard.whenToBuy} />
                </p>
                {activeInspectorCard.timing && (
                  <span className="inline-block mt-1 text-amber-700 text-[11px] font-semibold italic">
                    ⏱ {activeInspectorCard.timing}
                  </span>
                )}
              </div>

              {/* Situational Swap Info */}
              {activeInspectorCard.replacesSlot && (
                <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-rose-800 block mb-0.5 font-['Barlow_Condensed']">
                    Swap Pivot Target
                  </span>
                  <p className="text-slate-800 text-[11.5px]">
                    Replaces <strong>{activeInspectorCard.replacesSlot}</strong> ({activeInspectorCard.replacesItemName}).
                  </p>
                  {activeInspectorCard.swapReason && (
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {activeInspectorCard.swapReason}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Action Button */}
            <div className="mt-3 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowMobileDrawer(false)}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider text-xs shadow-xs font-['Barlow_Condensed'] transition-colors touch-manipulation cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};`;

if (content.includes(oldEnd)) {
  content = content.replace(oldEnd, newEnd);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('DeadlockItemDeck.tsx successfully updated for mobile!');
