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
    <div className="deadlock-frame relative w-full rounded-lg px-2.5 py-1 shadow-xs flex items-center justify-between gap-2 font-['Barlow_Condensed'] border border-slate-200 bg-white">
      {/* Left: Avatar + Identity */}
      <div className="flex items-center gap-2 overflow-hidden flex-shrink-0">
        <div className="w-7 h-7 rounded border border-emerald-500 overflow-hidden bg-slate-100 flex-shrink-0 shadow-xs">
          <img
            src={getChampionIconUrl(version, champion.image.full)}
            alt={champion.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <h2 className="text-base font-black text-slate-900 tracking-wide uppercase leading-none truncate">
            {champion.name}
          </h2>
          {onToggleFavorite && (
            <button
              onClick={(e) => onToggleFavorite(champion.id, e)}
              title={isFavorite ? "Remove from quick deck" : "Pin to quick deck"}
              className={`p-0.5 rounded transition-colors cursor-pointer ${
                isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
              }`}
            >
              <Star className={`w-3 h-3 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
          )}
          <span className="deadlock-badge px-1.5 py-0 text-[9px]">
            <span>{tactics.role}</span>
          </span>
          <span className="hidden sm:inline px-1.5 py-0 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            {tactics.playstyle}
          </span>
          <span className="hidden md:inline px-1.5 py-0 rounded text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            {tactics.damageType}
          </span>
        </div>
      </div>

      {/* Right: Spikes Ribbon */}
      <div className="flex items-center gap-1.5 text-xs overflow-hidden truncate">
        <div className="flex items-center gap-1 text-slate-500 font-bold text-[10px] uppercase flex-shrink-0">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Spikes:</span>
        </div>
        <div className="flex items-center gap-1 truncate">
          {tactics.powerSpikes.map((spike, idx) => {
            // Condense verbose spikes (e.g. "Level 1 Cheese (W or Q brawl)" -> "Lvl 1 Cheese")
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
