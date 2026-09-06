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
}

export const ChampionSelector: React.FC<ChampionSelectorProps> = ({
  version,
  champions,
  selectedChampionId,
  onSelectChampion,
  favorites,
  onToggleFavorite
}) => {
  if (champions.length === 0) {
    return (
      <div className="deadlock-frame text-center py-10 text-[#86998b] rounded-lg">
        <p className="text-sm font-bold uppercase tracking-wider">No champions found matching filter.</p>
      </div>
    );
  }

  return (
    <div className="deadlock-frame w-full rounded-lg p-3 font-['Barlow_Condensed'] bg-white border border-slate-200 shadow-md">
      <div className="flex items-center justify-between px-1 pb-2 mb-2 border-b border-slate-200 text-xs">
        <span className="deadlock-badge px-2 py-0.2 text-[10px] text-emerald-700">
          <span>SELECT CHAMPION ({champions.length})</span>
        </span>
        <span className="text-[11px] text-slate-500 uppercase tracking-wider">
          Click to select champion
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1.5 max-h-56 overflow-y-auto pr-1">
        {champions.map((champ) => {
          const isSelected = champ.id === selectedChampionId;
          const isFav = favorites.includes(champ.id);

          return (
            <div
              key={champ.id}
              onClick={() => onSelectChampion(champ.id)}
              className={`group relative flex flex-col items-center p-1 rounded cursor-pointer transition-all ${
                isSelected
                  ? 'bg-emerald-50 border-2 border-emerald-600 shadow-xs scale-105 z-10'
                  : 'bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-400'
              }`}
            >
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded overflow-hidden bg-slate-200">
                <img
                  src={getChampionIconUrl(version, champ.image.full)}
                  alt={champ.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-150"
                  loading="lazy"
                />
                <button
                  onClick={(e) => onToggleFavorite(champ.id, e)}
                  title={isFav ? "Remove from deck" : "Pin to deck"}
                  className={`absolute top-0 right-0 p-0.5 rounded transition-opacity ${
                    isFav 
                      ? 'text-amber-500 opacity-100 bg-white/90 shadow-2xs' 
                      : 'text-slate-400 opacity-0 group-hover:opacity-100 bg-white/80 hover:text-amber-500'
                  }`}
                >
                  <Star className={`w-2.5 h-2.5 ${isFav ? 'fill-amber-400' : ''}`} />
                </button>
              </div>

              <span className={`text-[10px] mt-0.5 text-center font-black uppercase truncate w-full tracking-tight ${
                isSelected ? 'text-emerald-700' : 'text-slate-700 group-hover:text-slate-950 font-bold'
              }`}>
                {champ.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
