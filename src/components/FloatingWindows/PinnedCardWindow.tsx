import React, { useEffect, useRef } from 'react';
import { FrozenCard, usePinnedCards } from '../../context/PinnedCardContext';
import { getItemIconUrl, getSpellIconUrl } from '../../services/ddragon';
import { GlossaryText } from '../Glossary/BG3Tooltip';
import { X, GripHorizontal, BookOpen, Lock, Sparkles, ArrowLeftRight, ArrowRight } from 'lucide-react';

interface PinnedCardWindowProps {
  card: FrozenCard;
}

export const PinnedCardWindow: React.FC<PinnedCardWindowProps> = ({ card }) => {
  const { closeCard, bringToFront, updatePosition } = usePinnedCards();
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: card.x,
    currentY: card.y
  });

  // Initialize and synchronize position via GPU translate3d
  useEffect(() => {
    dragRef.current.currentX = card.x;
    dragRef.current.currentY = card.y;
    if (windowRef.current) {
      windowRef.current.style.transform = `translate3d(${card.x}px, ${card.y}px, 0)`;
    }
  }, [card.x, card.y]);

  // Dynamic category border color matching ActiveHoverCardWindow
  const getBorderColor = () => {
    if (card.type === 'glossary') return 'border-amber-400 shadow-xl';
    const cat = (card.category || '').toLowerCase();
    if (cat.includes('weapon') || cat.includes('ad')) return 'border-orange-500 shadow-xl';
    if (cat.includes('spirit') || cat.includes('ap') || cat.includes('magic')) return 'border-purple-500 shadow-xl';
    if (cat.includes('vitality') || cat.includes('tank') || cat.includes('defense')) return 'border-emerald-500 shadow-xl';
    if (cat.includes('utility') || cat.includes('movement') || cat.includes('support')) return 'border-sky-500 shadow-xl';
    return 'border-emerald-500 shadow-xl';
  };

  // Pointer event handlers with native setPointerCapture for 120fps fluid dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;

    bringToFront(card.id);
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;

    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging || !windowRef.current) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    const cardWidth = card.type === 'glossary' ? 320 : 360;
    const newX = Math.max(8, Math.min(window.innerWidth - cardWidth, dragRef.current.currentX + deltaX));
    const newY = Math.max(16, Math.min(window.innerHeight - 140, dragRef.current.currentY + deltaY));

    // Direct hardware-accelerated GPU transform without triggering React state re-render
    windowRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;

    dragRef.current.isDragging = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    const cardWidth = card.type === 'glossary' ? 320 : 360;
    const finalX = Math.max(8, Math.min(window.innerWidth - cardWidth, dragRef.current.currentX + deltaX));
    const finalY = Math.max(16, Math.min(window.innerHeight - 140, dragRef.current.currentY + deltaY));

    dragRef.current.currentX = finalX;
    dragRef.current.currentY = finalY;

    // Commit final position to React context on release
    updatePosition(card.id, finalX, finalY);
  };

  return (
    <div
      ref={windowRef}
      onClick={() => bringToFront(card.id)}
      className={`fixed top-0 left-0 rounded-lg p-3 text-left font-sans select-none will-change-transform bg-white border-2 ${getBorderColor()} shadow-xl max-h-[88vh] overflow-y-auto text-slate-900`}
      style={{
        zIndex: card.zIndex,
        width: card.type === 'glossary' ? '320px' : '360px',
        transform: `translate3d(${card.x}px, ${card.y}px, 0)`
      }}
    >
      {/* 1. ITEM CARD */}
      {card.type === 'item' && (() => {
        const itemCard = card.data?.card || card.data;
        const gold = card.data?.gold;
        const version = card.data?.version || '16.17.1';
        const components = card.data?.components || itemCard?.components || [];

        return (
          <div>
            {/* Draggable Header */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200 cursor-grab active:cursor-grabbing bg-slate-50 -mx-3 -mt-3 p-3 rounded-t-md touch-none select-none"
            >
              <div className="flex items-center gap-2.5 overflow-hidden pointer-events-none">
                <GripHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="w-10 h-10 rounded-lg border-2 border-emerald-500 overflow-hidden bg-slate-100 flex-shrink-0 shadow-xs">
                  <img
                    src={getItemIconUrl(version, itemCard.id)}
                    alt={itemCard.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate">
                  <h4 className="text-base font-black text-slate-900 leading-tight font-['Barlow_Condensed'] uppercase tracking-wide truncate">
                    {itemCard.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200 font-sans">
                      {itemCard.category || 'Item'}
                    </span>
                    {itemCard.isCore && (
                      <span className="text-[9.5px] text-sky-700 font-bold uppercase font-mono">
                        {itemCard.coreOrder ? `Core #${itemCard.coreOrder}` : 'Core'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {gold && (
                  <span className="text-sm font-black text-amber-900 font-['Barlow_Condensed'] bg-amber-50 px-2 py-0.5 rounded border border-amber-300 shadow-2xs">
                    {gold}g
                  </span>
                )}
                <button
                  onClick={() => closeCard(card.id)}
                  title="Close (Esc)"
                  className="w-6 h-6 rounded-md hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* What It Does */}
            {itemCard.whatItDoes && (
              <div className="mb-2.5">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block mb-0.5 font-['Barlow_Condensed']">
                  What It Does:
                </span>
                <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-sans">
                  <GlossaryText text={itemCard.whatItDoes} />
                </p>
              </div>
            )}

            {/* When To Buy / Purchase Trigger */}
            {(itemCard.whenToBuy || itemCard.swapReason) && (
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 mb-2 font-sans">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wider font-['Barlow_Condensed'] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    When To Buy:
                  </span>
                  {itemCard.replacesItemName && (
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                      Sub for {itemCard.replacesItemName}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-[12.5px] text-slate-800 leading-relaxed">
                  <GlossaryText text={itemCard.swapReason || itemCard.whenToBuy} />
                </p>
              </div>
            )}

            {/* Build Lineage & Upgrade Plan */}
            {(itemCard.buildsIntoName || itemCard.buildsFromName || itemCard.finalSwapItemName) && (
              <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-300 mb-2 font-sans">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-xs font-black text-emerald-900 uppercase tracking-wider font-['Barlow_Condensed']">
                    Build Lineage & Swap Plan
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 flex-wrap text-xs bg-white p-2 rounded border border-emerald-200 font-sans">
                  {itemCard.buildsIntoName && (
                    <>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-amber-700 font-mono">1. Early Buy</span>
                        <span className="font-bold text-slate-900">{itemCard.name}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-emerald-700 font-mono">2. Late Upgrade</span>
                        <span className="font-bold text-slate-900">{itemCard.buildsIntoName}</span>
                      </div>
                    </>
                  )}
                  {itemCard.buildsFromName && (
                    <>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-amber-700 font-mono">1. Built From</span>
                        <span className="font-bold text-slate-900">{itemCard.buildsFromName}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-emerald-700 font-mono">2. Full Upgrade</span>
                        <span className="font-bold text-slate-900">{itemCard.name}</span>
                      </div>
                    </>
                  )}
                  {itemCard.finalSwapItemName && (
                    <>
                      <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-rose-700 font-mono">3. Swaps Out</span>
                        <span className="font-bold text-rose-800">{itemCard.finalSwapItemName} ({itemCard.finalSwapSlot || 'Core'})</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Timing */}
            {itemCard.timing && (
              <div className="text-xs text-slate-600 pt-1.5 border-t border-slate-200 flex items-center justify-between font-sans">
                <span><strong className="text-slate-900 font-bold">Timing:</strong> {itemCard.timing}</span>
                {itemCard.isActive && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase">
                    ACTIVE ITEM
                  </span>
                )}
              </div>
            )}

            {/* Recipe Components */}
            {components.length > 0 && (
              <div className="pt-2 mt-1.5 border-t border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-500 font-['Barlow_Condensed'] tracking-wider block mb-1">
                  Builds From:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {components.map((comp: any) => (
                    <div
                      key={comp.id}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-xs"
                    >
                      <img
                        src={getItemIconUrl(version, comp.id)}
                        alt={comp.name}
                        className="w-4 h-4 rounded object-cover"
                      />
                      <span className="text-slate-800 font-bold font-sans">{comp.name}</span>
                      {comp.gold && <span className="text-amber-900 font-mono text-[10.5px]">{comp.gold}g</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pinned Window Footer */}
            <div className="flex items-center justify-between pt-1.5 mt-2 border-t border-slate-200 text-[9.5px] text-slate-500 font-sans">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> PINNED
              </span>
              <span className="text-slate-400">Drag header to reposition • [Esc] to close</span>
            </div>
          </div>
        );
      })()}

      {/* 2. ABILITY CARD */}
      {card.type === 'ability' && (() => {
        const abilityData = card.data;
        const abilityTactics = abilityData?.abilityTactics || {};

        return (
          <div>
            {/* Draggable Header */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="flex items-center justify-between pb-1.5 mb-2 border-b border-emerald-200 cursor-grab active:cursor-grabbing bg-emerald-50/60 -mx-3 -mt-3 p-2.5 rounded-t-md touch-none select-none"
            >
              <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
                <GripHorizontal className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-[10px] px-1.5 py-0.5 rounded font-black uppercase bg-emerald-600 text-white">
                  {abilityData?.key || 'SKILL'}
                </span>
                <h4 className="text-sm font-black text-slate-900 leading-tight font-['Barlow_Condensed'] uppercase tracking-wide truncate">
                  {abilityData?.spell?.name || card.title}
                </h4>
              </div>

              <button
                onClick={() => closeCard(card.id)}
                title="Close (Esc)"
                className="w-5 h-5 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {abilityTactics.tldr && (
              <div className="mb-2 text-xs sm:text-[13px] text-slate-800 leading-relaxed font-sans">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block mb-0.5 font-['Barlow_Condensed']">
                  What It Does:
                </span>
                <GlossaryText text={abilityTactics.tldr} />
              </div>
            )}

            {abilityTactics.whenToUse && (
              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs sm:text-[13px] text-slate-800 leading-relaxed font-sans">
                <span className="text-xs font-black text-amber-900 uppercase tracking-wider block mb-0.5 font-['Barlow_Condensed']">
                  When To Press:
                </span>
                <GlossaryText text={abilityTactics.whenToUse} />
              </div>
            )}

            {/* Pinned Window Footer */}
            <div className="flex items-center justify-between pt-1.5 mt-2 border-t border-slate-200 text-[9.5px] text-slate-500 font-sans">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> PINNED
              </span>
              <span className="text-slate-400">Drag header to reposition • [Esc] to close</span>
            </div>
          </div>
        );
      })()}

      {/* 3. GLOSSARY TERM CARD */}
      {card.type === 'glossary' && (() => {
        const termData = card.data;

        return (
          <div>
            {/* Draggable Header */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200 cursor-grab active:cursor-grabbing bg-amber-50/60 -mx-3 -mt-3 p-2.5 rounded-t-md touch-none select-none"
            >
              <div className="flex items-center gap-1.5 overflow-hidden pointer-events-none">
                <GripHorizontal className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <h4 className="text-base font-black text-amber-900 uppercase tracking-wide font-['Barlow_Condensed'] truncate">
                  {termData?.term || card.title}
                </h4>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded bg-white text-emerald-800 font-bold uppercase tracking-wider border border-emerald-200 font-sans">
                  {termData?.category}
                </span>
                <button
                  onClick={() => closeCard(card.id)}
                  title="Close (Esc)"
                  className="w-5 h-5 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-emerald-800 font-bold mb-1.5 leading-snug font-sans">
              {termData?.shortDef}
            </p>

            <p className="text-xs sm:text-[12.5px] text-slate-700 leading-relaxed font-sans">
              {termData?.fullExplanation}
            </p>

            {termData?.whyItMatters && (
              <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200 text-xs sm:text-[12px] text-slate-700 font-sans mt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 font-['Barlow_Condensed'] block mb-0.5">
                  Why It Matters:
                </span>
                <p className="leading-snug">{termData.whyItMatters}</p>
              </div>
            )}

            {/* Pinned Window Footer */}
            <div className="flex items-center justify-between pt-1.5 mt-2 border-t border-slate-200 text-[9.5px] text-slate-500 font-sans">
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> PINNED
              </span>
              <span className="text-slate-400">Drag header to reposition • [Esc] to close</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
