import React from 'react';
import { ChampionDetail, TacticalGuide } from '../../types';
import { getChampionIconUrl } from '../../services/ddragon';
import { Zap, Star } from 'lucide-react';

interface ChampionHeroProps {
  version: string;
  champion: ChampionDetail;
  tactics: TacticalGuide;
  compact?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (champId: string, e: React.MouseEvent) => void;
}

export const ChampionHero: React.FC<ChampionHeroProps> = ({
  version,
  champion,
  tactics,
  isFavorite = false,
  onToggleFavorite
}) => {
  return (
    <div className="deadlock-frame relative w-full rounded-xl px-3 py-2 sm:py-1.5 shadow-xs flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-2.5 font-['Barlow_Condensed'] border border-slate-200 bg-white">
      {/* Left: Avatar + Identity */}
      <div className="flex items-center gap-2.5 overflow-hidden flex-shrink-0">
        <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg border-2 border-emerald-500 overflow-hidden bg-slate-100 flex-shrink-0 shadow-xs">
          <img
            src={getChampionIconUrl(version, champion.image.full)}
            alt={champion.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center gap-2 truncate">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-wide uppercase leading-none truncate">
            {champion.name}
          </h2>
          {onToggleFavorite && (
            <button
              onClick={(e) => onToggleFavorite(champion.id, e)}
              title={isFavorite ? "Remove from quick deck" : "Pin to quick deck"}
              className={`p-1 sm:p-0.5 rounded transition-colors cursor-pointer touch-manipulation active:scale-95 ${
                isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
              }`}
            >
              <Star className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
          )}
          <span className="deadlock-badge px-2 py-0.5 text-xs">
            <span>{tactics.role}</span>
          </span>
          <span className="hidden xs:inline px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            {tactics.playstyle}
          </span>
          <span className="hidden sm:inline px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            {tactics.damageType}
          </span>
        </div>
      </div>

      {/* Right: Spikes Ribbon */}
      <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar py-0.5 max-w-full flex-shrink-0">
        <div className="flex items-center gap-1 text-slate-500 font-bold text-[10px] uppercase flex-shrink-0">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Spikes:</span>
        </div>
        <div className="flex items-center gap-1 flex-nowrap">
          {tactics.powerSpikes.map((spike, idx) => {
            const cleanSpike = spike
              .replace(/Level\s*/i, 'Lvl ')
              .replace(/\s*\([^)]*\)/g, '');
            return (
              <span
                key={idx}
                className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[9.5px] font-bold whitespace-nowrap shadow-2xs"
              >
                {cleanSpike}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
