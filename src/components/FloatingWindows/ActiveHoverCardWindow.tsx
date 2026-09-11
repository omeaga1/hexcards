import React from 'react';
import { ActiveHoverTarget } from '../../context/PinnedCardContext';
import { getItemIconUrl } from '../../services/ddragon';
import { GlossaryText } from '../Glossary/BG3Tooltip';
import { BookOpen, Sparkles, ArrowLeftRight, ArrowRight } from 'lucide-react';

interface ActiveHoverCardWindowProps {
  target: ActiveHoverTarget;
}

export const ActiveHoverCardWindow: React.FC<ActiveHoverCardWindowProps> = ({ target }) => {
  const coords = target.getCoords();

  const getBorderColor = () => {
    if (target.type === 'glossary') return 'border-amber-400 shadow-md';
    const cat = (target.category || '').toLowerCase();
    if (cat.includes('weapon') || cat.includes('ad')) return 'border-orange-500 shadow-md';
    if (cat.includes('spirit') || cat.includes('ap') || cat.includes('magic')) return 'border-purple-500 shadow-md';
    if (cat.includes('vitality') || cat.includes('tank') || cat.includes('defense')) return 'border-emerald-500 shadow-md';
    if (cat.includes('utility') || cat.includes('movement') || cat.includes('support')) return 'border-sky-500 shadow-md';
    return 'border-emerald-500 shadow-md';
  };

  return (
    <div
      className={`fixed z-50 rounded-lg p-3 text-left font-sans select-none pointer-events-none transition-all duration-75 animate-in fade-in zoom-in-95 deadlock-frame retro-futuristic-card bg-[#13221c] border-2 ${getBorderColor()} shadow-2xl max-h-[88vh] overflow-y-auto text-[#e2e5b8]`}
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        width: target.type === 'glossary' ? '320px' : '360px'
      }}
    >
      {/* 1. ITEM HOVER CARD */}
      {target.type === 'item' && (() => {
        const itemCard = target.data?.card || target.data;
        const gold = target.data?.gold;
        const version = target.data?.version || '16.17.1';
        const components = target.data?.components || itemCard?.components || [];

        return (
          <div>
            {/* Header Row */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#26433a] -mx-3 -mt-3 p-3 rounded-t-md bg-[#0f1c17]">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-10 h-10 rounded-lg border-2 border-[#2dd5b7] overflow-hidden bg-slate-900 flex-shrink-0 shadow-xs">
                  <img
                    src={getItemIconUrl(version, itemCard.id)}
                    alt={itemCard.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate">
                  <h4 className="text-base font-black text-[#e2e5b8] leading-tight font-['Barlow_Condensed'] uppercase tracking-wide truncate">
                    {itemCard.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-[#162821] text-[#769382] border border-[#26433a] font-sans">
                      {itemCard.category || 'Item'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end flex-shrink-0 gap-1">
                {gold && (
                  <span className="text-sm font-black text-[#e5c736] font-['Barlow_Condensed'] bg-[#262413] px-2 py-0.5 rounded border border-[#e5c736]/40 shadow-2xs">
                    {gold}g
                  </span>
                )}
                <span className="text-[9px] font-black uppercase text-[#769382] bg-[#162821] px-1.5 py-0.2 rounded border border-[#26433a] tracking-wider">
                  [Tab] to Pin
                </span>
              </div>
            </div>

            {/* What It Does */}
            {itemCard.whatItDoes && (
              <div className="mb-2.5">
                <span className="text-xs font-black text-[#2dd5b7] uppercase tracking-wider block mb-0.5 font-['Barlow_Condensed']">
                  What It Does:
                </span>
                <p className="text-xs sm:text-[13px] text-[#c1c497] leading-relaxed font-sans">
                  <GlossaryText text={itemCard.whatItDoes} />
                </p>
              </div>
            )}

            {/* When To Buy / Purchase Trigger (Unified single section) */}
            {(itemCard.whenToBuy || itemCard.swapReason) && (
              <div className="p-2.5 rounded-lg bg-[#262413] border border-[#e5c736]/40 mb-2 font-sans">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-black text-[#e5c736] uppercase tracking-wider font-['Barlow_Condensed'] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#e5c736]" />
                    When To Buy:
                  </span>
                  {itemCard.replacesItemName && (
                    <span className="text-[11px] font-bold text-[#f43f5e] bg-[#28131a] px-1.5 py-0.2 rounded border border-[#f43f5e]/40">
                      Sub for {itemCard.replacesItemName}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-[12.5px] text-[#c1c497] leading-relaxed">
                  <GlossaryText text={itemCard.swapReason || itemCard.whenToBuy} />
                </p>
              </div>
            )}

            {/* Build Lineage & Upgrade Plan */}
            {(itemCard.buildsIntoName || itemCard.buildsFromName || itemCard.finalSwapItemName) && (
              <div className="p-2.5 rounded-lg bg-[#162821] border border-[#2dd5b7]/40 mb-2 font-sans">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-[#2dd5b7]" />
                  <span className="text-xs font-black text-[#2dd5b7] uppercase tracking-wider font-['Barlow_Condensed']">
                    Build Lineage & Swap Plan
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 flex-wrap text-xs bg-[#0f1c17] p-2 rounded border border-[#26433a] font-sans">
                  {itemCard.buildsIntoName && (
                    <>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-[#e5c736] font-mono">1. Early Buy</span>
                        <span className="font-bold text-[#e2e5b8]">{itemCard.name}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#2dd5b7] animate-pulse" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-[#2dd5b7] font-mono">2. Late Upgrade</span>
                        <span className="font-bold text-[#e2e5b8]">{itemCard.buildsIntoName}</span>
                      </div>
                    </>
                  )}
                  {itemCard.buildsFromName && (
                    <>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-[#e5c736] font-mono">1. Built From</span>
                        <span className="font-bold text-[#e2e5b8]">{itemCard.buildsFromName}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#2dd5b7] animate-pulse" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-[#2dd5b7] font-mono">2. Full Upgrade</span>
                        <span className="font-bold text-[#e2e5b8]">{itemCard.name}</span>
                      </div>
                    </>
                  )}
                  {itemCard.finalSwapItemName && (
                    <>
                      <ArrowRight className="w-3.5 h-3.5 text-[#f43f5e]" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-[#f43f5e] font-mono">3. Swaps Out</span>
                        <span className="font-bold text-[#f43f5e]">{itemCard.finalSwapItemName} ({itemCard.finalSwapSlot || 'Core'})</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Timing */}
            {itemCard.timing && (
              <div className="text-xs text-[#769382] pt-1.5 border-t border-[#26433a] flex items-center justify-between font-sans">
                <span><strong className="text-[#e2e5b8] font-bold">Timing:</strong> {itemCard.timing}</span>
                {itemCard.isActive && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#163026] text-[#2dd5b7] border border-[#2dd5b7]/50 uppercase">
                    ACTIVE ITEM
                  </span>
                )}
              </div>
            )}

            {/* Recipe Components */}
            {components.length > 0 && (
              <div className="pt-2 mt-1.5 border-t border-[#26433a]">
                <span className="text-[10px] font-black uppercase text-[#769382] font-['Barlow_Condensed'] tracking-wider block mb-1">
                  Builds From:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {components.map((comp: any) => (
                    <div
                      key={comp.id}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0f1c17] border border-[#26433a] text-xs"
                    >
                      <img
                        src={getItemIconUrl(version, comp.id)}
                        alt={comp.name}
                        className="w-4 h-4 rounded object-cover"
                      />
                      <span className="text-[#c1c497] font-bold font-sans">{comp.name}</span>
                      {comp.gold && <span className="text-[#e5c736] font-mono text-[10.5px]">{comp.gold}g</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 2. ABILITY HOVER CARD */}
      {target.type === 'ability' && (() => {
        const abilityData = target.data;
        const abilityTactics = abilityData?.abilityTactics || {};

        return (
          <div>
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#26433a] -mx-3 -mt-3 p-2.5 rounded-t-md bg-[#0f1c17]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded font-black uppercase bg-[#2dd5b7] text-[#07120e]">
                  {abilityData?.key || 'SKILL'}
                </span>
                <h4 className="text-sm font-black text-[#e2e5b8] leading-tight font-['Barlow_Condensed'] uppercase tracking-wide">
                  {abilityData?.spell?.name || target.title}
                </h4>
              </div>
              <span className="text-[8px] font-black uppercase text-[#769382] bg-[#162821] px-1 py-0.2 rounded border border-[#26433a] tracking-wider">
                [Tab] to Pin
              </span>
            </div>

            {abilityTactics.tldr && (
              <div className="mb-2 text-xs sm:text-[13px] text-[#c1c497] leading-relaxed font-sans">
                <span className="text-xs font-black text-[#2dd5b7] uppercase tracking-wider block mb-0.5 font-['Barlow_Condensed']">
                  What It Does:
                </span>
                <GlossaryText text={abilityTactics.tldr} />
              </div>
            )}

            {abilityTactics.whenToUse && (
              <div className="p-2.5 rounded-lg bg-[#262413] border border-[#e5c736]/40 text-xs sm:text-[13px] text-[#c1c497] leading-relaxed font-sans">
                <span className="text-xs font-black text-[#e5c736] uppercase tracking-wider block mb-0.5 font-['Barlow_Condensed']">
                  When To Press:
                </span>
                <GlossaryText text={abilityTactics.whenToUse} />
              </div>
            )}
          </div>
        );
      })()}

      {/* 3. GLOSSARY TERM HOVER CARD */}
      {target.type === 'glossary' && (() => {
        const termData = target.data;

        return (
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#26433a] -mx-3 -mt-3 p-2.5 rounded-t-md bg-[#0f1c17]">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#e5c736]" />
                <h4 className="text-base font-black text-[#e5c736] uppercase tracking-wide font-['Barlow_Condensed']">
                  {termData?.term || target.title}
                </h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#162821] text-[#2dd5b7] font-bold uppercase tracking-wider border border-[#26433a] font-sans">
                {termData?.category}
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-[#2dd5b7] font-bold mb-1.5 leading-snug font-sans">
              {termData?.shortDef}
            </p>

            <p className="text-xs sm:text-[12.5px] text-[#c1c497] leading-relaxed font-sans">
              {termData?.fullExplanation}
            </p>

            {termData?.whyItMatters && (
              <div className="p-2 rounded-lg bg-[#262413] border border-[#e5c736]/40 text-xs sm:text-[12px] text-[#c1c497] font-sans mt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#e5c736] font-['Barlow_Condensed'] block mb-0.5">
                  Why It Matters:
                </span>
                <p className="leading-snug">{termData.whyItMatters}</p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
