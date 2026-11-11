import React from 'react';
import { ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { PatchChange, ChangeType } from '../../services/patchNotesService';

const TYPE_LABEL: Record<ChangeType, string> = {
  buff: 'Buffed',
  nerf: 'Nerfed',
  adjusted: 'Adjusted',
};

export const TypePill: React.FC<{ type: ChangeType; className?: string }> = ({ type, className = '' }) => (
  <span
    className={`patch-tone-${type} patch-tone-pill inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider leading-none ${className}`}
  >
    {type === 'buff' ? <TrendingUp className="w-3 h-3" /> : type === 'nerf' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
    {TYPE_LABEL[type]}
  </span>
);

interface PatchChangeRowProps {
  change: PatchChange;
  /** Small square shown at the left, e.g. an ability icon */
  icon?: React.ReactNode;
}

export const PatchChangeRow: React.FC<PatchChangeRowProps> = ({ change, icon }) => {
  const Arrow = change.direction === 'buff' ? TrendingUp : change.direction === 'nerf' ? TrendingDown : Minus;
  return (
    <div className={`patch-tone-${change.direction} patch-row flex items-center gap-2.5 rounded-lg px-2.5 py-2 min-w-0`}>
      {icon}
      <div className="min-w-0 flex-1">
        <p className="patch-text-cream text-[13px] font-bold uppercase tracking-wide leading-tight truncate" title={change.label}>
          {change.label}
        </p>
        <p className="font-sans text-xs leading-snug mt-0.5 flex flex-wrap items-center gap-x-1.5">
          <span className="patch-text-muted line-through decoration-1">{change.from}</span>
          <ArrowRight className="w-3 h-3 patch-text-muted flex-shrink-0" />
          <span className="patch-tone-text font-semibold">{change.to}</span>
        </p>
      </div>
      <Arrow className="patch-tone-text w-4 h-4 flex-shrink-0" aria-label={change.direction} />
    </div>
  );
};

export const SlotBadge: React.FC<{ slot: string; iconUrl?: string }> = ({ slot, iconUrl }) => (
  <div className="relative w-8 h-8 flex-shrink-0 rounded-md overflow-hidden patch-surface flex items-center justify-center">
    {iconUrl ? (
      <img src={iconUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
    ) : (
      <span className="patch-text-muted text-[10px] font-black uppercase">{slot === 'Stats' ? 'STAT' : slot}</span>
    )}
    {iconUrl && slot.length === 1 && (
      <span className="absolute bottom-0 right-0 px-1 text-[9px] font-black leading-tight bg-black/75 text-white rounded-tl">
        {slot}
      </span>
    )}
  </div>
);
