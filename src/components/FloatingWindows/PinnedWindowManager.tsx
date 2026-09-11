import React from 'react';
import { usePinnedCards } from '../../context/PinnedCardContext';
import { PinnedCardWindow } from './PinnedCardWindow';
import { ActiveHoverCardWindow } from './ActiveHoverCardWindow';
import { useDevice } from '../../hooks/useDevice';

export const PinnedWindowManager: React.FC = () => {
  const { frozenCards, closeAllCards, activeHoverTarget } = usePinnedCards();
  const { isMobile, isTouch } = useDevice();

  if (frozenCards.length === 0 && (!activeHoverTarget || isMobile || isTouch)) return null;

  const isTargetAlreadyPinned = Boolean(
    activeHoverTarget &&
      frozenCards.some((c) => {
        // 1. Check ID inclusion
        if (c.id.includes(activeHoverTarget.id) || activeHoverTarget.id.includes(c.id)) return true;
        // 2. Check Item ID match
        const activeItemId = activeHoverTarget.data?.card?.id || activeHoverTarget.id;
        const pinnedItemId = c.data?.card?.id || c.id;
        if (activeItemId && pinnedItemId && (activeItemId === pinnedItemId || String(pinnedItemId).includes(String(activeItemId)))) {
          return true;
        }
        // 3. Check Title & Type match (e.g. same ability or glossary term)
        if (c.type === activeHoverTarget.type && c.title === activeHoverTarget.title) return true;
        return false;
      })
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* 1. Live Floating Hover Card Preview (desktop only - touch devices use bottom sheet) */}
      {!isMobile && !isTouch && activeHoverTarget && !isTargetAlreadyPinned && (
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
            className="px-3 py-1 rounded bg-[#13221c]/90 hover:bg-[#2b181e] border border-[#26433a] hover:border-[#d2689c] text-xs font-black uppercase text-[#c1c497] hover:text-[#e2e5b8] shadow-xl transition-all font-['Barlow_Condensed'] flex items-center gap-1.5 backdrop-blur-sm cursor-pointer"
          >
            <span>Close All ({frozenCards.length})</span>
            <span className="text-[10px] text-[#769382] font-sans">[Esc]</span>
          </button>
        </div>
      )}
    </div>
  );
};
