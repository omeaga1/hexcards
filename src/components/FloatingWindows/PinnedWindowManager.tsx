import React from 'react';
import { usePinnedCards } from '../../context/PinnedCardContext';
import { PinnedCardWindow } from './PinnedCardWindow';
import { ActiveHoverCardWindow } from './ActiveHoverCardWindow';
import { useDevice } from '../../hooks/useDevice';

export const PinnedWindowManager: React.FC = () => {
  const { frozenCards, closeAllCards, activeHoverTarget } = usePinnedCards();
  const { isMobile, isTouch } = useDevice();

  if (frozenCards.length === 0 && (!activeHoverTarget || isMobile || isTouch)) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* 1. Live Floating Hover Card Preview (desktop only - touch devices use bottom sheet) */}
      {!isMobile && !isTouch && activeHoverTarget && !frozenCards.some((c) => c.id.includes(activeHoverTarget.id)) && (
        <ActiveHoverCardWindow target={activeHoverTarget} />
      )}

      {/* 2. Floating Frozen Card Windows */}
      <div className="pointer-events-auto">
        {frozenCards.map((card) => (
          <PinnedCardWindow key={card.id} card={card} />
        ))}
      </div>

      {/* Floating Clear All Badge if 2+ windows open */}
      {frozenCards.length >= 2 && (
        <div className="fixed bottom-4 right-4 pointer-events-auto">
          <button
            onClick={closeAllCards}
            className="px-3 py-1 rounded bg-[#18231c]/90 hover:bg-rose-950/80 border border-[#2f4234] hover:border-rose-500 text-xs font-black uppercase text-[#cbdad0] hover:white shadow-xl transition-all font-['Barlow_Condensed'] flex items-center gap-1.5 backdrop-blur-sm cursor-pointer"
          >
            <span>Close All ({frozenCards.length})</span>
            <span className="text-[10px] text-[#86998b] font-sans">[Esc]</span>
          </button>
        </div>
      )}
    </div>
  );
};
