import React, { useEffect, useRef } from 'react';
import { FrozenCard, usePinnedCards } from '../../context/PinnedCardContext';
import { getItemIconUrl, getSpellIconUrl } from '../../services/ddragon';
import { GlossaryText } from '../Glossary/BG3Tooltip';
import { X, GripHorizontal, BookOpen, Lock } from 'lucide-react';

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

    const cardWidth = card.type === 'glossary' ? 320 : 340;
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

    const cardWidth = card.type === 'glossary' ? 320 : 340;
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
      className={`fixed top-0 left-0 rounded-lg p-3 text-left font-sans select-none will-change-transform bg-white border-2 shadow-xl ${
        card.type === 'glossary'
          ? 'w-72 sm:w-80 border-amber-400'
          : card.type === 'ability'
          ? 'w-72 sm:w-84 border-emerald-500'
          : 'w-72 sm:w-84 border-emerald-500'
      }`}
      style={{
        zIndex: card.zIndex,
        transform: `translate3d(${card.x}px, ${card.y}px, 0)`
      }}
    >
      {/* 1. ITEM CARD */}
      {card.type === 'item' && (() => {
        const itemCard = card.data.card || card.data;
        const gold = card.data.gold;
        const version = card.data.version || '16.17.1';

        return (
          <div>
            {/* Draggable Header */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 cursor-grab active:cursor-grabbing bg-slate-50 -mx-3 -mt-3 p-2.5 rounded-t-md touch-none"
            >
              <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
                <GripHorizontal className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <div className="w-7 h-7 rounded border border-emerald-500 overflow-hidden bg-slate-100 flex-shrink-0">
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
                  <span className="text-[9px] text-emerald-700 font-bold uppercase block leading-none">
                    {itemCard.isCore ? (itemCard.coreOrder ? `Core #${itemCard.coreOrder}` : 'Core Item') : itemCard.tag || 'Situational'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {gold && (
                  <span className="deadlock-badge px-2 py-0.5 text-xs text-amber-800 bg-amber-50 border-amber-300">
                    <span>{gold}g</span>
                  </span>
                )}
                <button
                  onClick={() => closeCard(card.id)}
                  title="Close (Esc)"
                  className="w-5 h-5 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* WHAT IT DOES */}
            <div className="mb-2">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block mb-0.5 font-['Barlow_Condensed']">
                What It Does:
              </span>
              <p className="text-[11px] text-slate-800 leading-snug">
                <GlossaryText text={itemCard.whatItDoes} />
              </p>
            </div>

            {/* WHEN TO BUY IT */}
            <div className="p-2 rounded bg-slate-50 border border-slate-200 mb-1.5">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block mb-0.5 font-['Barlow_Condensed']">
                When To Buy It:
              </span>
              <p className="text-[11px] text-slate-700 leading-snug">
                <GlossaryText text={itemCard.whenToBuy} />
              </p>
            </div>

            {/* TIMING */}
            {itemCard.timing && (
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                <strong className="text-slate-900">Timing:</strong> {itemCard.timing}
              </div>
            )}

            {/* Recipe Components (Builds From) */}
            {itemCard.components && itemCard.components.length > 0 && (
              <div className="pt-1.5 mt-1 border-t border-slate-200 text-xs">
                <span className="text-[9.5px] font-black uppercase text-slate-500 font-['Barlow_Condensed'] tracking-wider block mb-1">
                  Builds From:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {itemCard.components.map((comp: any) => (
                    <div
                      key={comp.id}
                      title={`${comp.name} (${comp.gold}g)`}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px]"
                    >
                      <img
                        src={getItemIconUrl(version, comp.id)}
                        alt={comp.name}
                        className="w-3.5 h-3.5 rounded object-cover"
                      />
                      <span className="text-slate-800 font-bold">{comp.name}</span>
                      <span className="text-amber-800 font-sans text-[9px]">{comp.gold}g</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Footer Drag Indicator */}
            <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-200 text-[9.5px] text-slate-500">
              <span className="text-emerald-700 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> PINNED</span>
              <span className="text-slate-400">Click keywords to open sub-cards • Drag header</span>
            </div>
          </div>
        );
      })()}

      {/* 2. GLOSSARY TERM CARD */}
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
              className="flex items-center justify-between pb-1.5 mb-2 border-b border-amber-200 cursor-grab active:cursor-grabbing bg-amber-50/70 -mx-3 -mt-3 p-2.5 rounded-t-md touch-none"
            >
              <div className="flex items-center gap-2 pointer-events-none">
                <GripHorizontal className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 font-['Barlow_Condensed'] flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-amber-600" />
                  {termData.term}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white text-emerald-800 font-bold uppercase tracking-wider border border-emerald-200">
                  {termData.category}
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

            {/* Definition */}
            <span className="text-xs text-slate-900 font-bold mb-1.5 block leading-snug">
              {termData.shortDef}
            </span>

            {/* Full explanation */}
            <span className="text-[11px] text-slate-700 mb-2 block leading-relaxed">
              {termData.fullExplanation}
            </span>

            {/* Why It Matters */}
            <div className="p-2 rounded bg-amber-50/50 border border-amber-200 text-[11px] mb-1.5">
              <span className="font-bold text-amber-900 block mb-0.5">
                Why you care:
              </span>
              <span className="text-slate-700 leading-snug block">
                {termData.whyItMatters}
              </span>
            </div>

            {/* Bottom Footer Drag Indicator */}
            <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-200 text-[9.5px] text-slate-500">
              <span className="text-amber-700 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> PINNED</span>
              <span className="text-slate-400">Drag header to move • [Esc] or Close</span>
            </div>
          </div>
        );
      })()}

      {/* 3. ABILITY CARD */}
      {card.type === 'ability' && (() => {
        const { spell, abilityTactics, key, version } = card.data;

        return (
          <div>
            {/* Draggable Header */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="flex items-center justify-between pb-1.5 mb-2 border-b border-emerald-200 cursor-grab active:cursor-grabbing bg-emerald-50/70 -mx-3 -mt-3 p-2.5 rounded-t-md touch-none"
            >
              <div className="flex items-center gap-2 pointer-events-none">
                <GripHorizontal className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <div className="w-7 h-7 rounded border border-emerald-500 overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={getSpellIconUrl(version || '16.17.1', spell.image?.full || '')}
                    alt={spell.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-sm font-black text-slate-900 font-['Barlow_Condensed'] uppercase tracking-wide">
                  [{key}] {spell.name}
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

            <div className="mb-2">
              <span className="text-[10px] font-black uppercase text-emerald-700 block mb-0.5 font-['Barlow_Condensed']">
                What it does:
              </span>
              <p className="text-[11px] text-slate-800 leading-snug">
                <GlossaryText text={abilityTactics.tldr} />
              </p>
            </div>

            <div className="p-2 rounded bg-emerald-50/50 border border-emerald-200 mb-1.5">
              <span className="text-[10px] font-black uppercase text-amber-800 block mb-0.5 font-['Barlow_Condensed']">
                When to press:
              </span>
              <p className="text-[11px] text-slate-700 leading-snug">
                <GlossaryText text={abilityTactics.whenToUse} />
              </p>
            </div>

            <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-200 text-[9.5px] text-slate-500">
              <span className="text-emerald-700 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> PINNED</span>
              <span className="text-slate-400">Drag header to move • [Esc] or Close</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
