import React, { useState } from 'react';
import { TacticalGuide, ItemData } from '../../types';
import { getPivotSwapsForChampion, PivotSwapRule } from '../../data/pivotSwaps';
import { getItemIconUrl } from '../../services/ddragon';
import { GlossaryText } from '../Glossary/BG3Tooltip';
import { usePinnedCards } from '../../context/PinnedCardContext';
import { ArrowRight, RefreshCw, AlertTriangle, Clock, Footprints, ShieldAlert, Filter } from 'lucide-react';

interface PivotSwapGuideProps {
  version: string;
  tactics: TacticalGuide;
  allItems: Record<string, ItemData>;
}

export const PivotSwapGuide: React.FC<PivotSwapGuideProps> = ({
  version,
  tactics,
  allItems
}) => {
  const { registerHover, unregisterHover } = usePinnedCards();
  const [selectedThreatFilter, setSelectedThreatFilter] = useState<string>('all');
  const swaps = getPivotSwapsForChampion(tactics);

  const filteredSwaps = swaps.filter((rule) => {
    if (selectedThreatFilter === 'all') return true;
    return rule.threatId === selectedThreatFilter;
  });

  return (
    <div className="deadlock-frame w-full rounded-xl p-2.5 sm:p-3 shadow-xs flex flex-col gap-2 font-['Barlow_Condensed'] bg-white border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="deadlock-badge px-2 py-0.5 text-xs text-emerald-800 bg-emerald-50 border-emerald-300">
            <span>PIVOT MATRIX</span>
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-wide">
              What Do We Replace? (Item Pivot Logic)
            </h2>
            <p className="text-[10.5px] text-slate-500 font-sans">
              When facing specific enemy threats, here is the exact standard slot you sacrifice and what you buy instead.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10.5px] text-slate-500 uppercase tracking-wider font-bold">
            Interactive Keywords (BG3 Style)
          </span>
        </div>
      </div>

      {/* Threat Quick Filter Chips */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 border-b border-slate-200">
        <span className="text-[9.5px] uppercase font-bold text-slate-500 flex items-center gap-1 mr-1 flex-shrink-0">
          <Filter className="w-3 h-3 text-emerald-600" />
          <span>Threat Filter:</span>
        </span>
        <button
          onClick={() => {
            setSelectedThreatFilter('all');
          }}
          className={`px-2 py-0.5 rounded text-[11px] font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
            selectedThreatFilter === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          All Threats ({swaps.length})
        </button>
        {swaps.map((rule) => (
          <button
            key={rule.threatId}
            onClick={() => {
              setSelectedThreatFilter(rule.threatId);
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-black uppercase transition-all whitespace-nowrap cursor-pointer border ${
              selectedThreatFilter === rule.threatId
                ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            {rule.threatLabel.split(' ')[0]} {rule.threatLabel.split(' ')[1] || ''}
          </button>
        ))}
      </div>

      {/* Swaps Rows */}
      <div className="space-y-2">
        {filteredSwaps.map((rule) => {
          const repItem = allItems[rule.replacementItem.id];
          const earlyComp = rule.earlyComponent ? allItems[rule.earlyComponent.id] : null;

          return (
            <div
              key={rule.threatId}
              className="p-2.5 sm:p-3 rounded-lg bg-white border border-slate-200 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col gap-2"
            >
              {/* Row Top: Threat Badge & Trigger Champs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-black uppercase border ${rule.threatColor}`}>
                    {rule.threatLabel}
                  </span>
                  <span className="text-[11px] text-slate-500 font-sans">
                    Enemies: <strong className="text-slate-800">{rule.triggerChamps}</strong>
                  </span>
                </div>

                {rule.bootsSwap && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-sans">
                    <Footprints className="w-3.5 h-3.5 text-amber-600" />
                    <span>Boots: {rule.bootsSwap.from} ➔ <strong>{rule.bootsSwap.to}</strong></span>
                  </div>
                )}
              </div>

              {/* The Swap Visualizer: [Standard Item] ➔ [Replacement Item] */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 p-2 rounded bg-slate-50 border border-slate-200">
                
                {/* Standard / Replaced Item */}
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-9 h-9 rounded border border-slate-300 bg-white flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-400">
                    {rule.standardItem.id ? (
                      <img
                        src={getItemIconUrl(version, rule.standardItem.id)}
                        alt={rule.standardItem.name}
                        className="w-full h-full object-cover rounded opacity-60 grayscale"
                      />
                    ) : (
                      <span>SLOT</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-rose-600 block tracking-wider">
                      REPLACE:
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-600 line-through block leading-tight">
                      {rule.standardItem.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-sans">
                      {rule.standardItem.slot}
                    </span>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="flex items-center justify-center text-emerald-700 font-black px-2">
                  <span className="deadlock-badge px-2 py-0.5 text-[10px] text-emerald-800 bg-emerald-50 border-emerald-300">
                    <ArrowRight className="w-3 h-3 inline mr-1" />
                    <span>SWAP FOR</span>
                  </span>
                </div>

                {/* Replacement Pivot Item */}
                <div
                  onMouseEnter={(e) => {
                    const mouseX = e.clientX;
                    const mouseY = e.clientY;
                    const pivotComponents = repItem?.from?.map(compId => ({
                      id: compId,
                      name: allItems[compId]?.name || compId,
                      gold: allItems[compId]?.gold?.total
                    })).filter(Boolean) || [];

                    registerHover({
                      id: `pivot-${rule.threatId}-${rule.replacementItem.id}`,
                      type: 'item',
                      title: rule.replacementItem.name,
                      category: 'Weapon',
                      data: {
                        card: {
                          id: rule.replacementItem.id,
                          name: rule.replacementItem.name,
                          category: 'Weapon',
                          whatItDoes: rule.swapRationale,
                          whenToBuy: `Pivot swap against ${rule.threatLabel} (${rule.triggerChamps})`,
                          timing: rule.earlyComponent
                            ? `Buy early component: ${rule.earlyComponent.name} (${rule.earlyComponent.cost}g)`
                            : 'Mid-to-late game situational swap',
                          tag: rule.threatLabel,
                          isCore: false,
                          components: pivotComponents
                        },
                        gold: repItem?.gold?.total || rule.replacementItem.cost,
                        version,
                        components: pivotComponents
                      },
                      getCoords: () => ({
                        x: Math.min(window.innerWidth - 340, Math.max(20, mouseX + 16)),
                        y: Math.min(window.innerHeight - 260, Math.max(20, mouseY - 20))
                      })
                    });
                  }}
                  onMouseLeave={() => unregisterHover(`pivot-${rule.threatId}-${rule.replacementItem.id}`)}
                  className="flex items-center gap-2.5 flex-1 p-1 rounded hover:bg-white transition-colors relative group cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[8.5px] px-1.5 py-0.5 rounded bg-slate-900 text-white font-bold border border-slate-800 font-sans absolute top-1 right-1 shadow-xs">
                    [Tab] to Pin
                  </span>
                  <div className="w-10 h-10 rounded border-2 border-emerald-600 bg-white overflow-hidden flex-shrink-0 shadow-xs">
                    <img
                      src={getItemIconUrl(version, rule.replacementItem.id)}
                      alt={rule.replacementItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-700 block tracking-wider">
                      BUY INSTEAD:
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 block leading-tight">
                      {rule.replacementItem.name}
                    </span>
                    <span className="text-[10px] text-amber-800 font-bold block font-sans">
                      {repItem?.gold?.total || rule.replacementItem.cost} Gold
                    </span>
                  </div>
                </div>

              </div>

              {/* Early Component Window & Rationale */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-start text-xs font-sans">
                {rule.earlyComponent && (
                  <div className="p-2 rounded bg-emerald-50/50 border border-emerald-200 text-[11px] sm:w-64 flex-shrink-0">
                    <span className="text-emerald-800 font-bold block mb-0.5 font-['Barlow_Condensed'] uppercase tracking-wide">
                      Early Buy: {rule.earlyComponent.name} ({rule.earlyComponent.cost}g)
                    </span>
                    <span className="text-slate-700 leading-snug block">
                      {rule.earlyComponent.buyWindow}
                    </span>
                  </div>
                )}

                <div className="flex-1 p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                  <span className="font-bold text-emerald-800 block mb-0.5 font-['Barlow_Condensed'] uppercase tracking-wider">
                    Why this swap works:
                  </span>
                  <GlossaryText text={rule.swapRationale} />
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
