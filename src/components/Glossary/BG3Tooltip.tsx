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
    return <span className="font-semibold text-emerald-700">{children || displayText || termId}</span>;
  }

  return (
    <span
      ref={anchorRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block cursor-pointer group font-semibold text-emerald-700 hover:text-emerald-800 transition-colors border-b border-dotted border-emerald-500 hover:border-emerald-700 px-0.5"
    >
      <span>{children || displayText || termData.term}</span>
    </span>
  );
};

/**
 * Automatically parses plain text and wraps recognized LoL keywords
 * with interactive Baldur's Gate 3 style hover & clickable subpanels!
 */
export const GlossaryText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Build mapping with non-capturing groups, longer terms sorted first
  const KEYWORD_RULES: { pattern: string; termId: string }[] = [
    { pattern: 'Grievous Wounds', termId: 'grievous_wounds' },
    { pattern: 'Anti-Heal', termId: 'grievous_wounds' },
    { pattern: 'Armor Penetration', termId: 'armor_penetration' },
    { pattern: 'Armor Pen', termId: 'armor_penetration' },
    { pattern: 'Magic Penetration', termId: 'magic_penetration' },
    { pattern: 'Magic Pen', termId: 'magic_penetration' },
    { pattern: 'Magic Resist', termId: 'magic_penetration' },
    { pattern: 'Tenacity', termId: 'tenacity' },
    { pattern: 'Lethality', termId: 'lethality' },
    { pattern: 'Omnivamp', termId: 'omnivamp_vs_lifesteal' },
    { pattern: 'Lifesteal', termId: 'omnivamp_vs_lifesteal' },
    { pattern: 'Adaptive Force', termId: 'adaptive_force' },
    { pattern: 'Suppression', termId: 'suppression' },
    { pattern: 'True Damage', termId: 'true_damage' },
    { pattern: 'Spell Shield', termId: 'spell_shield' },
    { pattern: 'Shield Reave|Anti-Shield', termId: 'shield_reduction' },
    { pattern: 'Ability Haste', termId: 'ability_haste' },
    { pattern: 'Rooted|Root|Snare', termId: 'root_vs_stun' },
    { pattern: 'Stunned|Stun', termId: 'root_vs_stun' },
    { pattern: 'Knocked up|Knockup|Airborne', termId: 'airborne' },
    { pattern: 'Crowd Control', termId: 'tenacity' }
  ];

  // Exactly ONE outer capturing group, non-capturing inner groups
  const combinedPattern = new RegExp(
    `\\b(${KEYWORD_RULES.map(k => `(?:${k.pattern})`).join('|')})\\b`,
    'gi'
  );

  const parts = text.split(combinedPattern);

  return (
    <span>
      {parts.map((part, index) => {
        const matched = KEYWORD_RULES.find(k =>
          new RegExp(`^(?:${k.pattern})$`, 'i').test(part)
        );
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
