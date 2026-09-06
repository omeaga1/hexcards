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
    <div className="deadlock-frame w-full rounded-lg p-2.5 sm:p-3 font-['Barlow_Condensed'] bg-white border border-slate-200 shadow-md">
      {/* Top Header & Role Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 text-xs">
        <div className="flex items-center justify-between">
          <span className="deadlock-badge px-2 py-0.5 text-[10px] text-emerald-700">
            <span>SELECT CHAMPION ({champions.length})</span>
          </span>
          <span className="text-[11px] text-slate-500 uppercase tracking-wider sm:inline hidden">
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
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {champions.length === 0 ? (
        <div className="deadlock-frame text-center py-8 text-slate-500 rounded-lg">
          <p className="text-xs font-bold uppercase tracking-wider">No champions found matching filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1.5 sm:gap-2 max-h-60 sm:max-h-56 overflow-y-auto pr-1 overscroll-contain">
          {champions.map((champ) => {
            const isSelected = champ.id === selectedChampionId;
            const isFav = favorites.includes(champ.id);

            return (
              <div
                key={champ.id}
                onClick={() => onSelectChampion(champ.id)}
                className={`group relative flex flex-col items-center p-1 sm:p-1.5 rounded-lg cursor-pointer transition-all touch-manipulation active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-50 border-2 border-emerald-600 shadow-xs scale-105 z-10'
                    : 'bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-400'
                }`}
              >
                <div className="relative w-11 h-11 sm:w-11 sm:h-11 rounded-md overflow-hidden bg-slate-200">
                  <img
                    src={getChampionIconUrl(version, champ.image.full)}
                    alt={champ.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-150"
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => onToggleFavorite(champ.id, e)}
                    title={isFav ? "Remove from deck" : "Pin to deck"}
                    className={`absolute top-0 right-0 p-1 rounded-bl transition-opacity touch-manipulation ${
                      isFav 
                        ? 'text-amber-500 opacity-100 bg-white/90 shadow-2xs' 
                        : 'text-slate-400 opacity-0 group-hover:opacity-100 sm:hover:text-amber-500 bg-white/80'
                    }`}
                  >
                    <Star className={`w-2.5 h-2.5 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                <span className={`text-[10px] mt-1 text-center font-black uppercase truncate w-full tracking-tight ${
                  isSelected ? 'text-emerald-700' : 'text-slate-700 group-hover:text-slate-950 font-bold'
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
