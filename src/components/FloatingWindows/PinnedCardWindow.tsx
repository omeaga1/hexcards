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
      className={`fixed top-0 left-0 rounded-lg p-3 text-left font-sans select-none will-change-transform deadlock-frame retro-futuristic-card bg-[#13221c] border-2 ${getBorderColor()} shadow-2xl max-h-[88vh] overflow-y-auto text-[#e2e5b8]`}
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
              className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#26433a] cursor-grab active:cursor-grabbing bg-[#0f1c17] -mx-3 -mt-3 p-3 rounded-t-md touch-none select-none"
            >
              <div className="flex items-center gap-2.5 overflow-hidden pointer-events-none">
                <GripHorizontal className="w-4 h-4 text-[#769382] flex-shrink-0" />
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
                    {itemCard.isCore && (
                      <span className="text-[9.5px] text-[#2dd5b7] font-bold uppercase font-mono">
                        {itemCard.coreOrder ? `Core #${itemCard.coreOrder}` : 'Core'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {gold && (
                  <span className="text-sm font-black text-[#e5c736] font-['Barlow_Condensed'] bg-[#262413] px-2 py-0.5 rounded border border-[#e5c736]/40 shadow-2xs">
                    {gold}g
                  </span>
                )}
                <button
                  onClick={() => closeCard(card.id)}
                  title="Close (Esc)"
                  className="w-6 h-6 rounded-md hover:bg-[#2b181e] text-[#769382] hover:text-[#d2689c] flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-[#d2689c]/40"
                >
                  <X className="w-4 h-4" />
                </button>
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

            {/* When To Buy / Purchase Trigger */}
            {(itemCard.whenToBuy || itemCard.swapReason) && (
              <div className="p-2.5 rounded-lg bg-[#262413] border border-[#e5c736]/40 mb-2 font-sans">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-black text-[#e5c736] uppercase tracking-wider font-['Barlow_Condensed'] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#e5c736]" />
                    When To Buy:
                  </span>
                  {itemCard.replacesItemName && (
                    <span className="text-[11px] font-bold text-[#d2689c] bg-[#2b181e] px-1.5 py-0.2 rounded border border-[#d2689c]/40">
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
              <div className="p-2.5 rounded-lg bg-[#162821] border border-[#26433a] mb-2 font-sans">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-[#2dd5b7]" />
                  <span className="text-xs font-black text-[#9eebb3] uppercase tracking-wider font-['Barlow_Condensed']">
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
                        <span className="text-[9px] font-bold uppercase text-[#9eebb3] font-mono">2. Late Upgrade</span>
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
                        <span className="text-[9px] font-bold uppercase text-[#9eebb3] font-mono">2. Full Upgrade</span>
                        <span className="font-bold text-[#e2e5b8]">{itemCard.name}</span>
                      </div>
                    </>
                  )}
                  {itemCard.finalSwapItemName && (
                    <>
                      <ArrowRight className="w-3.5 h-3.5 text-[#d2689c]" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-[#d2689c] font-mono">3. Swaps Out</span>
                        <span className="font-bold text-[#d2689c]">{itemCard.finalSwapItemName} ({itemCard.finalSwapSlot || 'Core'})</span>
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

            {/* Pinned Window Footer */}
            <div className="flex items-center justify-between pt-1.5 mt-2 border-t border-[#26433a] text-[9.5px] text-[#769382] font-sans">
              <span className="text-[#2dd5b7] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> PINNED
              </span>
              <span className="text-[#53685b]">Drag header to reposition • [Esc] to close</span>
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
              className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#26433a] cursor-grab active:cursor-grabbing bg-[#0f1c17] -mx-3 -mt-3 p-2.5 rounded-t-md touch-none select-none"
            >
              <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
                <GripHorizontal className="w-4 h-4 text-[#769382] flex-shrink-0" />
                <span className="text-[10px] px-1.5 py-0.5 rounded font-black uppercase bg-[#2dd5b7] text-[#07120e]">
                  {abilityData?.key || 'SKILL'}
                </span>
                <h4 className="text-sm font-black text-[#e2e5b8] leading-tight font-['Barlow_Condensed'] uppercase tracking-wide truncate">
                  {abilityData?.spell?.name || card.title}
                </h4>
              </div>

              <button
                onClick={() => closeCard(card.id)}
                title="Close (Esc)"
                className="w-5 h-5 rounded hover:bg-[#2b181e] text-[#769382] hover:text-[#d2689c] flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-[#d2689c]/40"
              >
                <X className="w-3.5 h-3.5" />
              </button>
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

            {/* Pinned Window Footer */}
            <div className="flex items-center justify-between pt-1.5 mt-2 border-t border-[#26433a] text-[9.5px] text-[#769382] font-sans">
              <span className="text-[#2dd5b7] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> PINNED
              </span>
              <span className="text-[#53685b]">Drag header to reposition • [Esc] to close</span>
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
              className="flex items-center justify-between pb-2 mb-2 border-b border-[#26433a] cursor-grab active:cursor-grabbing bg-[#0f1c17] -mx-3 -mt-3 p-2.5 rounded-t-md touch-none select-none"
            >
              <div className="flex items-center gap-1.5 overflow-hidden pointer-events-none">
                <GripHorizontal className="w-4 h-4 text-[#e5c736] flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-[#e5c736] flex-shrink-0" />
                <h4 className="text-base font-black text-[#e5c736] uppercase tracking-wide font-['Barlow_Condensed'] truncate">
                  {termData?.term || card.title}
                </h4>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#162821] text-[#2dd5b7] font-bold uppercase tracking-wider border border-[#26433a] font-sans">
                  {termData?.category}
                </span>
                <button
                  onClick={() => closeCard(card.id)}
                  title="Close (Esc)"
                  className="w-5 h-5 rounded hover:bg-[#2b181e] text-[#769382] hover:text-[#d2689c] flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-[#d2689c]/40"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-[#9eebb3] font-bold mb-1.5 leading-snug font-sans">
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

            {/* Pinned Window Footer */}
            <div className="flex items-center justify-between pt-1.5 mt-2 border-t border-[#26433a] text-[9.5px] text-[#769382] font-sans">
              <span className="text-[#e5c736] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> PINNED
              </span>
              <span className="text-[#53685b]">Drag header to reposition • [Esc] to close</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
