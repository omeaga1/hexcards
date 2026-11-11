import React, { useMemo, useState } from 'react';
import { History, ChevronDown, CheckCircle2, ListChecks } from 'lucide-react';
import { ChampionDetail, TacticalGuide, ItemData } from '../../types';
import { PatchNotes, PatchEntry, shortPatch } from '../../services/patchNotesService';
import { getSpellIconUrl, getItemIconUrl } from '../../services/ddragon';
import { PatchChangeRow, SlotBadge, TypePill } from './PatchChangeRow';

interface PatchChangesPanelProps {
  version: string;
  champion: ChampionDetail;
  tactics: TacticalGuide;
  allItems: Record<string, ItemData>;
  notes: PatchNotes;
  onOpenOverview: () => void;
}

const SLOT_INDEX: Record<string, number> = { Q: 0, W: 1, E: 2, R: 3 };

/** Item ids the champion's recommended build uses (core items, boots, starters). */
function buildItemIds(tactics: TacticalGuide): string[] {
  const b = tactics.coreBuild;
  const ids = [
    b.firstItem?.itemId,
    b.secondItem?.itemId,
    b.thirdItem?.itemId,
    b.bootsRecommendation?.defaultId,
    ...(b.starterIds || []),
  ].filter((id): id is string => Boolean(id));
  return Array.from(new Set(ids));
}

export const PatchChangesPanel: React.FC<PatchChangesPanelProps> = ({
  version,
  champion,
  tactics,
  allItems,
  notes,
  onOpenOverview,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const patch = shortPatch(notes.version);
  const champEntry = notes.champions[champion.id];

  const changedBuildItems = useMemo<PatchEntry[]>(
    () => buildItemIds(tactics).map((id) => notes.items[id]).filter((e): e is PatchEntry => Boolean(e)),
    [tactics, notes]
  );

  // Long lists (e.g. a champion rework) get trimmed so the build stays close to the top.
  const MAX_ROWS = 6;
  const champChanges = champEntry?.changes || [];
  const itemRows = changedBuildItems.flatMap((entry) => entry.changes.map((c) => ({ entry, change: c })));
  const hiddenCount = showAll ? 0 : Math.max(0, champChanges.length + itemRows.length - MAX_ROWS);
  const visibleChamp = showAll ? champChanges : champChanges.slice(0, MAX_ROWS);
  const visibleItems = showAll ? itemRows : itemRows.slice(0, Math.max(0, MAX_ROWS - visibleChamp.length));

  const totalChanges = (champEntry?.changes.length || 0) + changedBuildItems.reduce((n, e) => n + e.changes.length, 0);
  const overviewButton = (
    <button
      onClick={onOpenOverview}
      className="patch-link-button inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider cursor-pointer whitespace-nowrap"
    >
      <ListChecks className="w-3.5 h-3.5" />
      <span>All {patch} changes</span>
    </button>
  );

  // Nothing touched this champion or their build: keep it to a single reassuring line.
  if (totalChanges === 0) {
    return (
      <div className="deadlock-frame retro-futuristic-card rounded-xl px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 font-['Barlow_Condensed']">
        <div className="relative z-10 flex items-center gap-2 min-w-0">
          <CheckCircle2 className="w-4 h-4 patch-accent flex-shrink-0" />
          <p className="patch-text-cream text-sm font-bold tracking-wide">
            <span className="patch-text-main uppercase">Patch {patch}:</span>{' '}
            no changes to {champion.name} or the items in this build.
          </p>
        </div>
        <div className="relative z-10">{overviewButton}</div>
      </div>
    );
  }

  return (
    <section className="deadlock-frame retro-futuristic-card rounded-xl px-3 sm:px-4 py-2.5 font-['Barlow_Condensed']">
      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 min-w-0 cursor-pointer text-left"
            aria-expanded={expanded}
          >
            <History className="w-4.5 h-4.5 patch-accent flex-shrink-0" />
            <h3 className="patch-text-main text-base sm:text-lg font-black uppercase tracking-wider leading-none">
              Patch {patch} changes
            </h3>
            {champEntry && <TypePill type={champEntry.type} />}
            <span className="patch-text-muted text-xs font-sans whitespace-nowrap">
              {totalChanges} change{totalChanges === 1 ? '' : 's'}
            </span>
            <ChevronDown className={`w-4 h-4 patch-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          {overviewButton}
        </div>

        {expanded && (
          <div className="mt-2.5 space-y-3">
            {visibleChamp.length > 0 && (
              <div>
                <p className="patch-text-muted text-[11px] font-black uppercase tracking-[0.12em] mb-1.5">{champion.name}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1.5">
                  {visibleChamp.map((c, i) => {
                    const spell = champion.spells[SLOT_INDEX[c.slot]];
                    return (
                      <PatchChangeRow
                        key={`${c.slot}-${c.label}-${i}`}
                        change={c}
                        icon={<SlotBadge slot={c.slot} iconUrl={spell ? getSpellIconUrl(version, spell.image.full) : undefined} />}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {visibleItems.length > 0 && (
              <div>
                <p className="patch-text-muted text-[11px] font-black uppercase tracking-[0.12em] mb-1.5">
                  Items in this build
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1.5">
                  {visibleItems.map(({ entry, change: c }, i) => (
                    <PatchChangeRow
                      key={`${entry.id}-${c.label}-${i}`}
                      change={{ ...c, label: `${allItems[entry.id]?.name || entry.name} · ${c.label}` }}
                      icon={<SlotBadge slot="Item" iconUrl={getItemIconUrl(version, entry.id)} />}
                    />
                  ))}
                </div>
              </div>
            )}

            {(hiddenCount > 0 || showAll) && champChanges.length + itemRows.length > MAX_ROWS && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="patch-accent text-xs font-black uppercase tracking-wider cursor-pointer hover:underline underline-offset-2"
              >
                {showAll ? 'Show fewer' : `Show ${hiddenCount} more change${hiddenCount === 1 ? '' : 's'}`}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
