import React, { useEffect, useMemo, useState } from 'react';
import { X, History, ChevronRight, Sparkles } from 'lucide-react';
import { ChampionSummary } from '../../types';
import { PatchNotes, PatchEntry, ChangeType, shortPatch } from '../../services/patchNotesService';
import { getChampionIconUrl, getItemIconUrl } from '../../services/ddragon';
import { PatchChangeRow, SlotBadge, TypePill } from './PatchChangeRow';
import { useZoom } from '../../context/ZoomContext';

interface PatchOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: PatchNotes;
  version: string;
  allChampions: Record<string, ChampionSummary>;
  onSelectChampion: (id: string) => void;
}

type Filter = 'all' | ChangeType;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'buff', label: 'Buffs' },
  { id: 'nerf', label: 'Nerfs' },
  { id: 'adjusted', label: 'Adjusted' },
];

const sortEntries = (a: PatchEntry, b: PatchEntry) => a.name.localeCompare(b.name);

export const PatchOverviewModal: React.FC<PatchOverviewModalProps> = ({
  isOpen,
  onClose,
  notes,
  version,
  allChampions,
  onSelectChampion,
}) => {
  const [filter, setFilter] = useState<Filter>('all');
  const { zoomLevel } = useZoom();
  // In the browser the app is scaled with CSS zoom, which also scales vh units; undo that so the dialog fits the screen.
  const cssZoom = typeof window !== 'undefined' && !window.electronAPI?.setZoomFactor ? zoomLevel : 1;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const champions = useMemo(
    () => Object.values(notes.champions).filter((e) => filter === 'all' || e.type === filter).sort(sortEntries),
    [notes, filter]
  );
  const items = useMemo(
    () => Object.values(notes.items).filter((e) => filter === 'all' || e.type === filter).sort(sortEntries),
    [notes, filter]
  );
  const newChampions = (notes.newChampions || []).filter((id) => allChampions[id]);

  if (!isOpen) return null;
  const patch = shortPatch(notes.version);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 font-['Barlow_Condensed']"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Patch ${patch} changes`}
        style={{ maxHeight: `calc(92dvh / ${cssZoom})` }}
        className="patch-modal relative w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="patch-modal-header px-4 sm:px-6 py-3.5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="patch-link-button w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                <History className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h3 className="patch-text-main text-xl sm:text-2xl font-black uppercase tracking-wider leading-none">
                  Patch {patch} changes
                </h3>
                <p className="patch-text-muted text-xs font-sans mt-1">
                  Compared with {shortPatch(notes.previousVersion)} · {notes.summary}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg patch-text-muted hover:opacity-80 cursor-pointer"
              aria-label="Close patch changes"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                data-active={filter === f.id}
                onClick={() => setFilter(f.id)}
                className="patch-tab px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
          {newChampions.length > 0 && (
            <div className="patch-surface rounded-xl px-3 py-2.5 flex flex-wrap items-center gap-2">
              <Sparkles className="w-4 h-4 patch-accent" />
              <span className="patch-text-main text-sm font-black uppercase tracking-wider">New champion</span>
              {newChampions.map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    onSelectChampion(id);
                    onClose();
                  }}
                  className="patch-link-button px-2 py-0.5 rounded-md text-xs font-bold cursor-pointer"
                >
                  {allChampions[id].name}
                </button>
              ))}
            </div>
          )}

          <section>
            <h4 className="patch-text-muted text-xs font-black uppercase tracking-[0.14em] mb-2">
              Champions · {champions.length}
            </h4>
            {champions.length === 0 ? (
              <p className="patch-text-muted text-sm font-sans">No champion changes match this filter.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {champions.map((entry) => {
                  const summary = allChampions[entry.id];
                  return (
                    <button
                      key={entry.id}
                      onClick={() => {
                        onSelectChampion(entry.id);
                        onClose();
                      }}
                      className="patch-surface patch-surface-interactive rounded-xl p-2.5 text-left cursor-pointer flex flex-col justify-start gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        {summary && (
                          <img
                            src={getChampionIconUrl(version, summary.image.full)}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                            loading="lazy"
                          />
                        )}
                        <span className="patch-text-main text-lg font-black uppercase tracking-wide leading-none flex-1 truncate">
                          {entry.name}
                        </span>
                        <TypePill type={entry.type} />
                        <ChevronRight className="w-4 h-4 patch-text-muted flex-shrink-0" />
                      </div>
                      <div className="space-y-1">
                        {entry.changes.slice(0, 3).map((c, i) => (
                          <PatchChangeRow key={i} change={{ ...c, label: c.slot === 'Stats' ? c.label : `${c.slot} · ${c.label}` }} />
                        ))}
                        {entry.changes.length > 3 && (
                          <p className="patch-accent text-xs font-bold uppercase tracking-wider pl-1">
                            +{entry.changes.length - 3} more · open {entry.name}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h4 className="patch-text-muted text-xs font-black uppercase tracking-[0.14em] mb-2">Items · {items.length}</h4>
            {items.length === 0 ? (
              <p className="patch-text-muted text-sm font-sans">No item changes match this filter.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {items.map((entry) => (
                  <div key={entry.id} className="patch-surface rounded-xl p-2.5 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <SlotBadge slot="Item" iconUrl={getItemIconUrl(version, entry.id)} />
                      <span className="patch-text-main text-base font-black uppercase tracking-wide leading-none flex-1 truncate">
                        {entry.name}
                      </span>
                      <TypePill type={entry.type} />
                    </div>
                    <div className="space-y-1">
                      {entry.changes.map((c, i) => (
                        <PatchChangeRow key={i} change={c} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <p className="patch-text-muted text-[11px] font-sans">
            From Riot's Data Dragon: base stats, ability cooldowns, costs and ranges, and item stats and cost. Changes to ability
            damage or effects that Riot doesn't publish there aren't shown.
          </p>
        </div>
      </div>
    </div>
  );
};
