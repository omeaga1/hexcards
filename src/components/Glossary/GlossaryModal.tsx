import React, { useState } from 'react';
import { GLOSSARY_TERMS } from '../../data/glossary';
import { X, Search, BookOpen } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Trap Escape key in capture phase so it closes Glossary before closing any background pinned cards
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['All', 'Combat Mechanics', 'Stats & Ratios', 'Crowd Control', 'Item Concepts'];

  const filteredTerms = GLOSSARY_TERMS.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = query.trim() === '' || 
      item.term.toLowerCase().includes(query.toLowerCase()) ||
      item.shortDef.toLowerCase().includes(query.toLowerCase()) ||
      item.fullExplanation.toLowerCase().includes(query.toLowerCase()) ||
      item.whyItMatters.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 font-['Barlow_Condensed'] cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="deadlock-frame retro-futuristic-card relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-xl text-[#e2e5b8] bg-[#13221c] border border-[#26433a] shadow-2xl overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#26433a] bg-[#13221c]">
          <div className="flex items-center gap-2.5">
            <span className="deadlock-badge px-2 py-0.5 text-xs text-[#2dd5b7] bg-[#163026] border-[#2dd5b7]/50">
              <span>GLOSSARY</span>
            </span>
            <div>
              <h2 className="text-lg font-black uppercase text-[#e2e5b8] tracking-wide">
                LoL Terminology Demystifier
              </h2>
              <p className="text-[11px] text-[#769382] font-sans">
                Plain-English explanations for complex game mechanics.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-[#162821] text-[#769382] hover:text-[#e2e5b8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-3 border-b border-[#26433a] bg-[#0f1c17] flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#769382]" />
            <input 
              type="text"
              placeholder="Search terms (e.g., Grievous Wounds, Tenacity, Lethality, Suppression)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded bg-[#13221c] border border-[#26433a] text-[#e2e5b8] placeholder-[#53685b] focus:outline-none focus:border-[#2dd5b7] transition-colors font-sans shadow-2xs"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-black uppercase rounded transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-[#2dd5b7] text-[#07120e] shadow-xs' 
                    : 'bg-[#162821] hover:bg-[#192e26] text-[#c1c497] hover:text-[#e2e5b8] border border-[#26433a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Term List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0d1713]/80">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12 text-[#769382]">
              <p className="text-sm font-bold uppercase">No matching terms found.</p>
            </div>
          ) : (
            filteredTerms.map(term => (
              <div 
                key={term.id}
                className="p-3 rounded-lg bg-[#14251f] border border-[#26433a] hover:border-[#2dd5b7]/60 shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <h3 className="text-base font-black uppercase text-[#e2e5b8] tracking-wide">
                    {term.term}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase bg-[#162821] text-[#2dd5b7] border border-[#26433a] self-start sm:self-auto">
                    {term.category}
                  </span>
                </div>

                <p className="text-xs text-[#2dd5b7] font-bold mb-1.5 leading-snug font-sans">
                  {term.shortDef}
                </p>

                <p className="text-xs text-[#c1c497] leading-relaxed mb-2 font-sans">
                  {term.fullExplanation}
                </p>

                <div className="p-2 rounded bg-[#262413] border border-[#e5c736]/40 text-xs font-sans">
                  <span className="font-bold text-[#e5c736] block mb-0.5">
                    Why it matters to you:
                  </span>
                  <p className="text-[#c1c497] leading-relaxed">
                    {term.whyItMatters}
                  </p>
                  {term.exampleItemOrChamp && (
                    <p className="text-[11px] text-[#2dd5b7] mt-1 pt-1 border-t border-[#e5c736]/30">
                      <span className="text-[#769382]">Examples:</span> {term.exampleItemOrChamp}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[#26433a] bg-[#13221c] flex items-center justify-between text-xs text-[#769382]">
          <span className="font-sans">Showing {filteredTerms.length} of {GLOSSARY_TERMS.length} terms</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#162821] hover:bg-[#192e26] font-bold text-[#e2e5b8] border border-[#26433a] transition-colors uppercase tracking-wider cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
