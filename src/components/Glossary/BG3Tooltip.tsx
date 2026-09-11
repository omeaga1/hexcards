import React, { useRef } from 'react';
import { findGlossaryTerm } from '../../data/glossary';
import { usePinnedCards } from '../../context/PinnedCardContext';

interface BG3TooltipProps {
  termId: string;
  displayText?: string;
  children?: React.ReactNode;
}

export const BG3Tooltip: React.FC<BG3TooltipProps> = ({ termId, displayText, children }) => {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const termData = findGlossaryTerm(termId);
  const { registerHover, unregisterHover, freezeGlossaryTerm } = usePinnedCards();

  const handleMouseEnter = () => {
    if (anchorRef.current && termData) {
      registerHover({
        id: termId,
        type: 'glossary',
        title: termData.term,
        category: termData.category,
        data: termData,
        getCoords: () => {
          const r = anchorRef.current?.getBoundingClientRect();
          const curBelow = (r?.top || 0) < 260;
          const y = curBelow ? (r?.bottom || 0) + 8 : (r?.top || 0) - 270;
          const x = Math.min(Math.max(20, (r?.left || 0) - 100), window.innerWidth - 340);
          return { x, y: Math.max(40, y) };
        }
      });
    }
  };

  const handleMouseLeave = () => {
    unregisterHover(termId);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = anchorRef.current?.getBoundingClientRect();
    const isBelow = (rect?.top || 0) < 260;
    const y = isBelow ? (rect?.bottom || 0) + 8 : (rect?.top || 0) - 270;
    const x = Math.min(Math.max(20, (rect?.left || 0) - 100), window.innerWidth - 340);
    freezeGlossaryTerm(termId, { x, y: Math.max(40, y) });
  };

  if (!termData) {
    return <span className="font-semibold text-[#2dd5b7]">{children || displayText || termId}</span>;
  }

  return (
    <span
      ref={anchorRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block cursor-pointer group font-semibold text-[#2dd5b7] hover:text-[#9eebb3] transition-colors border-b border-dotted border-[#2dd5b7]/60 hover:border-[#2dd5b7] px-0.5"
    >
      <span>{children || displayText || termData.term}</span>
    </span>
  );
};

// Precompiled module-level keyword rules & regex to avoid per-render recompilation
const KEYWORD_RULES: { pattern: string; termId: string; regex: RegExp }[] = [
  { pattern: 'Grievous Wounds', termId: 'grievous_wounds', regex: /^(?:Grievous Wounds)$/i },
  { pattern: 'Anti-Heal', termId: 'grievous_wounds', regex: /^(?:Anti-Heal)$/i },
  { pattern: 'Armor Penetration', termId: 'armor_penetration', regex: /^(?:Armor Penetration)$/i },
  { pattern: 'Armor Pen', termId: 'armor_penetration', regex: /^(?:Armor Pen)$/i },
  { pattern: 'Magic Penetration', termId: 'magic_penetration', regex: /^(?:Magic Penetration)$/i },
  { pattern: 'Magic Pen', termId: 'magic_penetration', regex: /^(?:Magic Pen)$/i },
  { pattern: 'Magic Resist', termId: 'magic_penetration', regex: /^(?:Magic Resist)$/i },
  { pattern: 'Tenacity', termId: 'tenacity', regex: /^(?:Tenacity)$/i },
  { pattern: 'Lethality', termId: 'lethality', regex: /^(?:Lethality)$/i },
  { pattern: 'Omnivamp', termId: 'omnivamp_vs_lifesteal', regex: /^(?:Omnivamp)$/i },
  { pattern: 'Lifesteal', termId: 'omnivamp_vs_lifesteal', regex: /^(?:Lifesteal)$/i },
  { pattern: 'Adaptive Force', termId: 'adaptive_force', regex: /^(?:Adaptive Force)$/i },
  { pattern: 'Suppression', termId: 'suppression', regex: /^(?:Suppression)$/i },
  { pattern: 'True Damage', termId: 'true_damage', regex: /^(?:True Damage)$/i },
  { pattern: 'Spell Shield', termId: 'spell_shield', regex: /^(?:Spell Shield)$/i },
  { pattern: 'Shield Reave|Anti-Shield', termId: 'shield_reduction', regex: /^(?:Shield Reave|Anti-Shield)$/i },
  { pattern: 'Ability Haste', termId: 'ability_haste', regex: /^(?:Ability Haste)$/i },
  { pattern: 'Rooted|Root|Snare', termId: 'root_vs_stun', regex: /^(?:Rooted|Root|Snare)$/i },
  { pattern: 'Stunned|Stun', termId: 'root_vs_stun', regex: /^(?:Stunned|Stun)$/i },
  { pattern: 'Knocked up|Knockup|Airborne', termId: 'airborne', regex: /^(?:Knocked up|Knockup|Airborne)$/i },
  { pattern: 'Crowd Control', termId: 'tenacity', regex: /^(?:Crowd Control)$/i }
];

const COMBINED_PATTERN = new RegExp(
  `\\b(${KEYWORD_RULES.map(k => `(?:${k.pattern})`).join('|')})\\b`,
  'gi'
);

/**
 * Automatically parses plain text and wraps recognized LoL keywords
 * with interactive Baldur's Gate 3 style hover & clickable subpanels!
 */
export const GlossaryText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  const parts = text.split(COMBINED_PATTERN);

  return (
    <span>
      {parts.map((part, index) => {
        const matched = KEYWORD_RULES.find(k => k.regex.test(part));
        if (matched) {
          return (
            <BG3Tooltip key={index} termId={matched.termId} displayText={part} />
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
