import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { findGlossaryTerm } from '../data/glossary';

export type CardType = 'item' | 'glossary' | 'ability';

export interface FrozenCard {
  id: string; // unique instance ID
  type: CardType;
  title: string;
  category?: string;
  x: number;
  y: number;
  zIndex: number;
  data: any;
}

export interface ActiveHoverTarget {
  id: string;
  type: CardType;
  title: string;
  category?: string;
  data: any;
  getCoords: () => { x: number; y: number };
  onFreeze?: () => void;
}

interface PinnedCardContextType {
  frozenCards: FrozenCard[];
  activeHoverTarget: ActiveHoverTarget | null;
  registerHover: (target: ActiveHoverTarget) => void;
  unregisterHover: (id: string) => void;
  freezeActiveHover: () => void;
  freezeGlossaryTerm: (termId: string, position?: { x: number; y: number }) => void;
  closeCard: (id: string) => void;
  closeAllCards: () => void;
  bringToFront: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
}

const PinnedCardContext = createContext<PinnedCardContextType | undefined>(undefined);

let zIndexCounter = 100;

export const PinnedCardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [frozenCards, setFrozenCards] = useState<FrozenCard[]>([]);
  const [activeHoverTarget, setActiveHoverTarget] = useState<ActiveHoverTarget | null>(null);
  const activeHoverRef = useRef<ActiveHoverTarget | null>(null);
  activeHoverRef.current = activeHoverTarget;

  const bringToFront = useCallback((id: string) => {
    zIndexCounter += 1;
    setFrozenCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, zIndex: zIndexCounter } : card))
    );
  }, []);

  const closeCard = useCallback((id: string) => {
    setFrozenCards((prev) => prev.filter((card) => card.id !== id));
  }, []);

  const closeAllCards = useCallback(() => {
    setFrozenCards([]);
  }, []);

  const updatePosition = useCallback((id: string, x: number, y: number) => {
    setFrozenCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, x, y } : card))
    );
  }, []);

  const registerHover = useCallback((target: ActiveHoverTarget) => {
    setActiveHoverTarget(target);
  }, []);

  const unregisterHover = useCallback((id: string) => {
    setActiveHoverTarget((prev) => (prev?.id === id ? null : prev));
  }, []);

  // Freezes the EXACT card currently being hovered at its EXACT position
  const freezeActiveHover = useCallback(() => {
    const target = activeHoverRef.current;
    if (!target) return;

    // Call the parent component's callback to dismiss the hover state
    if (target.onFreeze) {
      target.onFreeze();
    }

    const coords = target.getCoords();
    zIndexCounter += 1;

    const newFrozenCard: FrozenCard = {
      id: `frozen-${target.type}-${target.id}-${Date.now()}`,
      type: target.type,
      title: target.title,
      category: target.category,
      x: coords.x,
      y: coords.y,
      zIndex: zIndexCounter,
      data: target.data
    };

    setFrozenCards((prev) => [...prev, newFrozenCard]);
    setActiveHoverTarget(null);
  }, []);

  // Spawns a frozen glossary card directly on keyword click
  const freezeGlossaryTerm = useCallback((termId: string, position?: { x: number; y: number }) => {
    const term = findGlossaryTerm(termId);
    if (!term) return;

    zIndexCounter += 1;
    const defaultX = position?.x ?? Math.max(40, window.innerWidth / 2 - 160);
    const defaultY = position?.y ?? Math.max(80, window.innerHeight / 2 - 140);

    const clampedX = Math.min(Math.max(20, defaultX), window.innerWidth - 340);
    const clampedY = Math.min(Math.max(60, defaultY), window.innerHeight - 300);

    const newFrozenCard: FrozenCard = {
      id: `frozen-glossary-${termId}-${Date.now()}`,
      type: 'glossary',
      title: term.term,
      category: term.category,
      x: clampedX,
      y: clampedY,
      zIndex: zIndexCounter,
      data: term
    };

    setFrozenCards((prev) => [...prev, newFrozenCard]);
  }, []);

  // Global Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Tab Key: Freeze whatever card is currently hovered in place!
      if (e.key === 'Tab') {
        if (activeHoverRef.current) {
          e.preventDefault();
          freezeActiveHover();
        }
      }

      // 2. Escape Key: Close topmost frozen card
      if (e.key === 'Escape') {
        setFrozenCards((prev) => {
          if (prev.length === 0) return prev;
          const sorted = [...prev].sort((a, b) => b.zIndex - a.zIndex);
          const topCard = sorted[0];
          return prev.filter((c) => c.id !== topCard.id);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [freezeActiveHover]);

  return (
    <PinnedCardContext.Provider
      value={{
        frozenCards,
        activeHoverTarget,
        registerHover,
        unregisterHover,
        freezeActiveHover,
        freezeGlossaryTerm,
        closeCard,
        closeAllCards,
        bringToFront,
        updatePosition
      }}
    >
      {children}
    </PinnedCardContext.Provider>
  );
};

export const usePinnedCards = () => {
  const context = useContext(PinnedCardContext);
  if (!context) {
    throw new Error('usePinnedCards must be used within a PinnedCardProvider');
  }
  return context;
};
