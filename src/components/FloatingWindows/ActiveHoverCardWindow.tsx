import React from 'react';
import { ActiveHoverTarget } from '../../context/PinnedCardContext';
import { getItemIconUrl } from '../../services/ddragon';
import { GlossaryText } from '../Glossary/BG3Tooltip';
import { BookOpen, Sparkles, ArrowLeftRight } from 'lucide-react';

interface ActiveHoverCardWindowProps {
  target: ActiveHoverTarget;
}

export const ActiveHoverCardWindow: React.FC<ActiveHoverCardWindowProps> = ({ target }) => {
  const coords = target.getCoords();

  const getBorderColor = () => {
    const cat = (target.category || '').toLowerCase();
    if (cat.includes('weapon') || cat.includes('ad')) return 'border-orange-500 shadow-md';
    if (cat.includes('spirit') || cat.includes('ap') || cat.includes('magic')) return 'border-purple-500 shadow-md';
    if (cat.includes('vitality') || cat.includes('tank') || cat.includes('defense')) return 'border-emerald-500 shadow-md';
    if (cat.includes('utility') || cat.includes('movement') || cat.includes('support')) return 'border-sky-500 shadow-md';
    return 'border-emerald-500 shadow-md';
  };

  return (
    <div
      className={`fixed z-50 rounded-lg p-3 text-left font-sans select-none pointer-events-none transition-all duration-75 animate-in fade-in zoom-in-95 bg-white border-2 ${getBorderColor()} shadow-xl max-h-[88vh] overflow-y-auto text-slate-900`}
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        width: target.type === 'glossary' ? '300px' : '330px'
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
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 -mx-3 -mt-3 p-2.5 rounded-t-md bg-slate-50">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded border-2 border-emerald-500 overflow-hidden bg-slate-100 flex-shrink-0 shadow-xs">
                  <img
                    src={getItemIconUrl(version, itemCard.id)}
                    alt={itemCard.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-black text-slate-900 leading-tight font-['Barlow_Condensed'] uppercase tracking-wide truncate">
                    {itemCard.name}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[8.5px] px-1 py-0.2 rounded font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {itemCard.category || 'Item'}
                    </span>
                    {itemCard.buyOrderBadge && (
                      <span className="text-[8.5px] px-1 py-0.2 rounded font-black uppercase bg-emerald-600 text-white">
                        {itemCard.buyOrderBadge}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end flex-shrink-0 gap-1">
                {gold && (
                  <span className="text-xs font-black text-amber-800 font-['Barlow_Condensed'] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
                    {gold}g
                  </span>
                )}
                <span className="text-[8px] font-black uppercase text-slate-500 bg-white px-1 py-0.2 rounded border border-slate-300 tracking-wider">
                  [Tab] to Pin
                </span>
              </div>
            </div>

            {/* Tactical Swap Route (if pivot item) */}
            {itemCard.replacesSlot && (
              <div className="p-1.5 rounded bg-rose-50 border border-rose-200 mb-2 text-[11px] text-rose-800">
                <div className="flex items-center gap-1 font-bold font-['Barlow_Condensed'] uppercase text-rose-900 mb-0.5">
                  <ArrowLeftRight className="w-3 h-3 text-rose-600" />
                  <span>Replaces {itemCard.replacesSlot} ({itemCard.replacesItemName})</span>
                </div>
                {itemCard.swapReason && (
                  <p className="text-[10.5px] leading-snug italic text-rose-700">
                    Trigger: {itemCard.swapReason}
                  </p>
                )}
              </div>
            )}

            {/* What It Does */}
            {itemCard.whatItDoes && (
              <div className="mb-2">
                <span className="text-[9.5px] font-black text-emerald-700 uppercase tracking-wider block mb-0.5 font-['Barlow_Condensed']">
                  What It Does:
                </span>
                <p className="text-[11.5px] text-slate-800 leading-snug">
                  <GlossaryText text={itemCard.whatItDoes} />
                </p>
              </div>
            )}

            {/* When To Buy */}
            {itemCard.whenToBuy && (
              <div className="p-2 rounded bg-amber-50/60 border border-amber-200 mb-1.5">
                <span className="text-[9.5px] font-black text-amber-900 uppercase tracking-wider block mb-0.5 font-['Barlow_Condensed']">
                  Tactical Purchase Trigger:
                </span>
                <p className="text-[11px] text-slate-700 leading-snug">
                  <GlossaryText text={itemCard.whenToBuy} />
                </p>
              </div>
            )}

            {/* Timing */}
            {itemCard.timing && (
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                <span><strong className="text-slate-800">Timing:</strong> {itemCard.timing}</span>
                {itemCard.isActive && (
                  <span className="text-[8px] font-black px-1 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase">
                    ACTIVE ITEM
                  </span>
                )}
              </div>
            )}

            {/* Recipe Components */}
            {components.length > 0 && (
              <div className="pt-1.5 mt-1 border-t border-slate-200">
                <span className="text-[9px] font-black uppercase text-slate-500 font-['Barlow_Condensed'] tracking-wider block mb-1">
                  Builds From:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {components.map((comp: any) => (
                    <div
                      key={comp.id}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[9.5px]"
                    >
                      <img
                        src={getItemIconUrl(version, comp.id)}
                        alt={comp.name}
                        className="w-3.5 h-3.5 rounded object-cover"
                      />
                      <span className="text-slate-800 font-bold">{comp.name}</span>
                      {comp.gold && <span className="text-amber-800 font-sans text-[8.5px]">{comp.gold}g</span>}
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
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-emerald-200 -mx-3 -mt-3 p-2.5 rounded-t-md bg-emerald-50/60">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded font-black uppercase bg-emerald-600 text-white">
                  {abilityData?.key || 'SKILL'}
                </span>
                <h4 className="text-sm font-black text-slate-900 leading-tight font-['Barlow_Condensed'] uppercase tracking-wide">
                  {abilityData?.spell?.name || target.title}
                </h4>
              </div>
              <span className="text-[8px] font-black uppercase text-slate-500 bg-white px-1 py-0.2 rounded border border-slate-300 tracking-wider">
                [Tab] to Pin
              </span>
            </div>

            {abilityTactics.tldr && (
              <div className="mb-2 text-xs text-slate-800 leading-snug">
                <span className="text-[9.5px] font-black text-emerald-700 uppercase tracking-wider block mb-0.5 font-['Barlow_Condensed']">
                  What It Does:
                </span>
                <GlossaryText text={abilityTactics.tldr} />
              </div>
            )}

            {abilityTactics.whenToUse && (
              <div className="p-2 rounded bg-amber-50/60 border border-amber-200 text-xs text-slate-700 leading-snug">
                <span className="text-[9.5px] font-black text-amber-900 uppercase tracking-wider block mb-0.5 font-['Barlow_Condensed']">
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
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-amber-200 -mx-3 -mt-3 p-2.5 rounded-t-md bg-amber-50/60">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-wide font-['Barlow_Condensed']">
                  {termData?.term || target.title}
                </h4>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white text-emerald-800 font-bold uppercase tracking-wider border border-emerald-200">
                {termData?.category}
              </span>
            </div>

            <p className="text-xs text-emerald-800 font-bold mb-1.5 leading-snug">
              {termData?.shortDef}
            </p>

            <p className="text-[11px] text-slate-700 leading-relaxed">
              {termData?.fullExplanation}
            </p>
          </div>
        );
      })()}
    </div>
  );
};
