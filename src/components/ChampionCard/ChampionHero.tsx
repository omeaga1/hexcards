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
    <div className="deadlock-frame retro-futuristic-card relative w-full rounded-xl px-4 py-3 sm:py-2.5 shadow-md flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 font-['Barlow_Condensed']">
      {/* Left: Avatar + Identity */}
      <div className="flex items-center gap-3 sm:gap-3.5 overflow-hidden flex-shrink-0">
        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl border-2 border-emerald-500 overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
          <img
            src={getChampionIconUrl(version, champion.image.full)}
            alt={champion.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 truncate">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-wide uppercase leading-none truncate">
            {champion.name}
          </h2>
          {onToggleFavorite && (
            <button
              onClick={(e) => onToggleFavorite(champion.id, e)}
              title={isFavorite ? "Remove from quick deck" : "Pin to quick deck"}
              className={`p-1 rounded transition-colors cursor-pointer touch-manipulation active:scale-95 ${
                isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
              }`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
          )}
          <span className="deadlock-badge px-3 py-1 text-xs sm:text-sm font-black">
            <span>{tactics.role}</span>
          </span>
          <span className="hidden xs:inline px-2.5 py-1 rounded-md text-xs sm:text-[13px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            {tactics.playstyle}
          </span>
          <span className="hidden sm:inline px-2.5 py-1 rounded-md text-xs sm:text-[13px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            {tactics.damageType}
          </span>
        </div>
      </div>

      {/* Center/Right: 30s Champ Select Quick-Glance Ribbon */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        {/* Quick Skill Max Order */}
        {tactics.skillMaxOrder && (
          <div className="flex items-center gap-2 bg-emerald-50/90 border border-emerald-300 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-xs font-black uppercase text-emerald-800 tracking-wider font-sans">
              MAX:
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black text-emerald-950">
              {tactics.skillMaxOrder.split(/\s*>\s*/).map((key, idx, arr) => (
                <React.Fragment key={idx}>
                  <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded text-xs sm:text-sm shadow-2xs">
                    {key}
                  </span>
                  {idx < arr.length - 1 && <span className="text-emerald-400 text-xs sm:text-sm font-bold">›</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Quick Keystone Badge */}
        {tactics.runeKit?.keystone?.name && (
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-xs font-black uppercase text-slate-500 font-sans">
              KEY:
            </span>
            <span className="text-xs sm:text-sm font-black uppercase text-slate-900 font-['Barlow_Condensed'] tracking-wide">
              {tactics.runeKit.keystone.name}
            </span>
            <span className="text-xs text-slate-500 font-sans font-bold">
              ({tactics.runeKit.secondaryTree || 'Resolve'})
            </span>
          </div>
        )}

        {/* Spikes Ribbon */}
        <div className="hidden lg:flex items-center gap-2 text-xs overflow-x-auto no-scrollbar py-0.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase flex-shrink-0">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black">Spikes:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {tactics.powerSpikes.map((spike, idx) => {
              const cleanSpike = spike
                .replace(/Level\s*/i, 'Lvl ')
                .replace(/\s*\([^)]*\)/g, '');
              return (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold whitespace-nowrap shadow-2xs"
                >
                  {cleanSpike}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
