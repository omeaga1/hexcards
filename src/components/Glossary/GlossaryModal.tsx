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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-['Barlow_Condensed'] cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="deadlock-frame relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-xl text-slate-900 bg-white border border-slate-200 shadow-2xl overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="deadlock-badge px-2 py-0.5 text-xs text-emerald-800 bg-emerald-50 border-emerald-300">
              <span>GLOSSARY</span>
            </span>
            <div>
              <h2 className="text-lg font-black uppercase text-slate-900 tracking-wide">
                LoL Terminology Demystifier
              </h2>
              <p className="text-[11px] text-slate-500 font-sans">
                Plain-English explanations for complex game mechanics.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search terms (e.g., Grievous Wounds, Tenacity, Lethality, Suppression)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors font-sans shadow-2xs"
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
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Term List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-bold uppercase">No matching terms found.</p>
            </div>
          ) : (
            filteredTerms.map(term => (
              <div 
                key={term.id}
                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-emerald-400/60 shadow-2xs transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <h3 className="text-base font-black uppercase text-slate-900 tracking-wide">
                    {term.term}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase bg-slate-100 text-emerald-800 border border-slate-200 self-start sm:self-auto">
                    {term.category}
                  </span>
                </div>

                <p className="text-xs text-emerald-700 font-bold mb-1.5 leading-snug font-sans">
                  {term.shortDef}
                </p>

                <p className="text-xs text-slate-700 leading-relaxed mb-2 font-sans">
                  {term.fullExplanation}
                </p>

                <div className="p-2 rounded bg-amber-50/60 border border-amber-200 text-xs font-sans">
                  <span className="font-bold text-amber-900 block mb-0.5">
                    Why it matters to you:
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {term.whyItMatters}
                  </p>
                  {term.exampleItemOrChamp && (
                    <p className="text-[11px] text-emerald-800 mt-1 pt-1 border-t border-amber-200/60">
                      <span className="text-slate-500">Examples:</span> {term.exampleItemOrChamp}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="font-sans">Showing {filteredTerms.length} of {GLOSSARY_TERMS.length} terms</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
