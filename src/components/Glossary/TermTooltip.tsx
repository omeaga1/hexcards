import React, { useState } from 'react';
import { findGlossaryTerm } from '../../data/glossary';
import { HelpCircle } from 'lucide-react';

interface TermTooltipProps {
  termId: string;
  children?: React.ReactNode;
  fallbackText?: string;
}

export const TermTooltip: React.FC<TermTooltipProps> = ({ termId, children, fallbackText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const termData = findGlossaryTerm(termId);

  if (!termData) {
    return <span>{children || fallbackText || termId}</span>;
  }

  return (
    <span 
      className="relative inline-block cursor-pointer group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span className="underline decoration-dotted decoration-[#c8aa6e] hover:text-[#f0e6d2] font-medium transition-colors inline-flex items-center gap-1">
        {children || termData.term}
        <HelpCircle className="w-3.5 h-3.5 text-[#c8aa6e] opacity-70 group-hover:opacity-100 transition-opacity inline" />
      </span>

      {isOpen && (
        <div 
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3.5 rounded-lg bg-[#0a1428] border border-[#c8aa6e] shadow-2xl text-left pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
          style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(200, 170, 110, 0.25)' }}
        >
          <div className="flex items-center justify-between border-b border-[#1e2e4a] pb-1.5 mb-2">
            <span className="text-xs font-bold text-[#c8aa6e] uppercase tracking-wider">{termData.term}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2e4a] text-cyan-300">{termData.category}</span>
          </div>
          <p className="text-xs text-[#f0e6d2] font-semibold mb-1.5 leading-relaxed">
            {termData.shortDef}
          </p>
          <p className="text-[11px] text-[#a09b8c] leading-relaxed mb-2">
            <strong className="text-amber-400">Why it matters:</strong> {termData.whyItMatters}
          </p>
          {termData.exampleItemOrChamp && (
            <div className="text-[10px] text-cyan-400/90 pt-1 border-t border-[#1e2e4a]/60">
              <span className="text-[#a09b8c]">Examples:</span> {termData.exampleItemOrChamp}
            </div>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-[#c8aa6e]" />
        </div>
      )}
    </span>
  );
};
