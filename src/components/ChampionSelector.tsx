import React from 'react';
import { ChampionSummary } from '../types';
import { getChampionIconUrl } from '../services/ddragon';
import { Star } from 'lucide-react';

interface ChampionSelectorProps {
  version: string;
  champions: ChampionSummary[];
  selectedChampionId: string;
  onSelectChampion: (champId: string) => void;
  favorites: string[];
  onToggleFavorite: (champId: string, e: React.MouseEvent) => void;
  selectedRole?: string;
  onSelectRole?: (role: string) => void;
}

const ROLES = [
  { id: 'All', label: 'All' },
  { id: 'Top', label: 'Top' },
  { id: 'Jungle', label: 'Jgl' },
  { id: 'Mid', label: 'Mid' },
  { id: 'ADC', label: 'ADC' },
  { id: 'Support', label: 'Supp' }
];

export const ChampionSelector: React.FC<ChampionSelectorProps> = ({
  version,
  champions,
  selectedChampionId,
  onSelectChampion,
  favorites,
  onToggleFavorite,
  selectedRole = 'All',
  onSelectRole
}) => {
  return (
    <div className="deadlock-frame retro-futuristic-card w-full rounded-lg p-2.5 sm:p-3 font-['Barlow_Condensed'] shadow-md">
      {/* Top Header & Role Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-[#26433a] text-xs">
        <div className="flex items-center justify-between">
          <span className="deadlock-badge px-2 py-0.5 text-[10px] text-[#2dd5b7] bg-[#163026] border-[#2dd5b7]/50">
            <span>SELECT CHAMPION ({champions.length})</span>
          </span>
          <span className="text-[11px] text-[#769382] uppercase tracking-wider sm:inline hidden">
            Tap champion to view tactical deck
          </span>
        </div>

        {/* Mobile/Desktop Quick Role Filter Bar */}
        {onSelectRole && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelectRole(r.id)}
                className={`px-2.5 py-1 sm:py-0.5 rounded text-[11px] font-black uppercase transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
                  selectedRole === r.id
                    ? 'bg-[#2dd5b7] text-[#07120e] shadow-xs'
                    : 'bg-[#162821] hover:bg-[#192e26] text-[#c1c497] hover:text-[#e2e5b8] border border-[#26433a]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {champions.length === 0 ? (
        <div className="deadlock-frame text-center py-8 text-[#769382] rounded-lg">
          <p className="text-xs font-bold uppercase tracking-wider">No champions found matching filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2 sm:gap-2.5 max-h-72 sm:max-h-80 overflow-y-auto pr-1 overscroll-contain">
          {champions.map((champ) => {
            const isSelected = champ.id === selectedChampionId;
            const isFav = favorites.includes(champ.id);

            return (
              <div
                key={champ.id}
                onClick={() => onSelectChampion(champ.id)}
                className={`group relative flex flex-col items-center p-1.5 sm:p-2 rounded-xl cursor-pointer transition-all touch-manipulation active:scale-95 ${
                  isSelected
                    ? 'bg-[#1a352a] border-2 border-[#2dd5b7] shadow-md shadow-[#2dd5b7]/20 scale-105 z-10'
                    : 'bg-[#14251f] hover:bg-[#192e26] border border-[#26433a] hover:border-[#2dd5b7]/60'
                }`}
              >
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg overflow-hidden bg-[#0f1c17] shadow-xs">
                  <img
                    src={getChampionIconUrl(version, champ.image.full)}
                    alt={champ.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-150"
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => onToggleFavorite(champ.id, e)}
                    title={isFav ? "Remove from deck" : "Pin to deck"}
                    className={`absolute top-0 right-0 p-1.5 rounded-bl transition-opacity touch-manipulation ${
                      isFav 
                        ? 'text-amber-400 opacity-100 bg-[#0f1c17]/90 shadow-2xs' 
                        : 'text-[#769382] opacity-0 group-hover:opacity-100 hover:text-amber-400 bg-[#0f1c17]/80'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                <span className={`text-[11px] sm:text-xs mt-1.5 text-center font-black uppercase truncate w-full tracking-tight ${
                  isSelected ? 'text-[#2dd5b7] font-black' : 'text-[#c1c497] group-hover:text-[#e2e5b8] font-bold'
                }`}>
                  {champ.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
