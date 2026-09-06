import React, { useState, useRef } from 'react';
import { GLOSSARY_TERMS, findGlossaryTerm } from '../../data/glossary';
import { GlossaryTerm } from '../../types';
import { BookOpen } from 'lucide-react';
import { usePinnedCards } from '../../context/PinnedCardContext';

interface BG3TooltipProps {
  termId: string;
  displayText?: string;
  children?: React.ReactNode;
}

export const BG3Tooltip: React.FC<BG3TooltipProps> = ({ termId, displayText, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [openBelow, setOpenBelow] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const termData = findGlossaryTerm(termId);
  const { registerHover, unregisterHover, freezeGlossaryTerm } = usePinnedCards();

  const handleMouseEnter = () => {
    if (anchorRef.current && termData) {
      const rect = anchorRef.current.getBoundingClientRect();
      const isBelow = rect.top < 260;
      setOpenBelow(isBelow);

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
        },
        onFreeze: () => {
          setIsHovered(false);
        }
      });
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
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

      {/* Baldur's Gate 3 Style Nested Subpanel Tooltip */}
      {isHovered && (
        <span
          className={`absolute z-50 left-1/2 -translate-x-1/2 w-72 sm:w-80 p-3 rounded-lg bg-white border-2 border-emerald-500 shadow-xl text-left pointer-events-none transition-all duration-100 animate-in fade-in zoom-in-95 block font-sans ${
            openBelow ? 'top-full mt-2' : 'bottom-full mb-2'
          }`}
        >
          {/* Subpanel Header */}
          <span className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 block">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 font-['Barlow_Condensed'] flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-emerald-600" />
              {termData.term}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-bold uppercase tracking-wider border border-emerald-200">
              {termData.category}
            </span>
          </span>

          {/* Definition */}
          <span className="text-xs text-emerald-700 font-bold mb-1.5 block leading-snug">
            {termData.shortDef}
          </span>

          {/* Full explanation */}
          <span className="text-[11px] text-slate-700 mb-2 block leading-relaxed">
            {termData.fullExplanation}
          </span>

          {/* Why It Matters */}
          <span className="p-2 rounded bg-amber-50/60 border border-amber-200 text-[11px] block">
            <span className="font-bold text-amber-900 block mb-0.5">
              Why you care:
            </span>
            <span className="text-slate-700 leading-snug block">
              {termData.whyItMatters}
            </span>
          </span>

          {/* Tab to Pin / Click Hint */}
          <span className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-slate-200 text-[9.5px] text-slate-500 block font-sans">
            <span className="text-emerald-700 font-medium">Click or hit <strong>[Tab]</strong> to Pin</span>
            <span className="text-slate-400">Draggable window</span>
          </span>

          {/* Arrow */}
          {openBelow ? (
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-[1px] border-4 border-transparent border-b-emerald-500 block" />
          ) : (
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-emerald-500 block" />
          )}
        </span>
      )}
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
