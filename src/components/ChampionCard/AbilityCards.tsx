import React from 'react';
import { ChampionDetail, TacticalGuide } from '../../types';
import { getPassiveIconUrl, getSpellIconUrl, cleanDDragonText } from '../../services/ddragon';
import { Sparkles, Swords, Info } from 'lucide-react';
import { GlossaryText } from '../Glossary/BG3Tooltip';
import { usePinnedCards } from '../../context/PinnedCardContext';

interface AbilityCardsProps {
  version: string;
  champion: ChampionDetail;
  tactics: TacticalGuide;
}

export const AbilityCards: React.FC<AbilityCardsProps> = ({
  version,
  champion,
  tactics
}) => {
  const { registerHover, unregisterHover } = usePinnedCards();

  const isGeneric = (text: string) =>
    !text ||
    text.includes('Innate passive ability') ||
    text.includes('Primary bread-and-butter skill') ||
    text.includes('Secondary utility, defensive') ||
    text.includes('Mobility dash, crowd control') ||
    text.includes('High-impact ultimate ability');

  const passiveTldr = isGeneric(tactics.plainAbilities.passive.tldr) && champion.passive.description
    ? cleanDDragonText(champion.passive.description)
    : tactics.plainAbilities.passive.tldr;

  const getSpellTldr = (idx: number, fallback: string) => {
    const spell = champion.spells[idx];
    if (isGeneric(fallback) && spell?.description) {
      return cleanDDragonText(spell.description);
    }
    return fallback;
  };

  const abilities = [
    {
      key: 'PASSIVE',
      name: champion.passive.name,
      iconUrl: getPassiveIconUrl(version, champion.passive.image.full),
      tldr: passiveTldr,
      whenToUse: tactics.plainAbilities.passive.whenToUse,
    },
    {
      key: 'Q',
      name: champion.spells[0]?.name || 'Ability Q',
      iconUrl: champion.spells[0] ? getSpellIconUrl(version, champion.spells[0].image.full) : '',
      tldr: getSpellTldr(0, tactics.plainAbilities.q.tldr),
      whenToUse: tactics.plainAbilities.q.whenToUse,
    },
    {
      key: 'W',
      name: champion.spells[1]?.name || 'Ability W',
      iconUrl: champion.spells[1] ? getSpellIconUrl(version, champion.spells[1].image.full) : '',
      tldr: getSpellTldr(1, tactics.plainAbilities.w.tldr),
      whenToUse: tactics.plainAbilities.w.whenToUse,
    },
    {
      key: 'E',
      name: champion.spells[2]?.name || 'Ability E',
      iconUrl: champion.spells[2] ? getSpellIconUrl(version, champion.spells[2].image.full) : '',
      tldr: getSpellTldr(2, tactics.plainAbilities.e.tldr),
      whenToUse: tactics.plainAbilities.e.whenToUse,
    },
    {
      key: 'R',
      name: champion.spells[3]?.name || 'Ultimate',
      iconUrl: champion.spells[3] ? getSpellIconUrl(version, champion.spells[3].image.full) : '',
      tldr: getSpellTldr(3, tactics.plainAbilities.r.tldr),
      whenToUse: tactics.plainAbilities.r.whenToUse,
    },
  ];

  return (
    <div className="deadlock-frame w-full rounded-xl p-2.5 sm:p-3 shadow-sm flex flex-col gap-2 font-['Barlow_Condensed'] bg-white border border-slate-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="deadlock-badge px-2 py-0.5 text-xs text-emerald-700">
            <span>ABILITIES</span>
          </span>
          <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-wide">
            Abilities & Skill Priority
          </h2>
        </div>

        {/* Skill Max Order */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-slate-500 font-bold">Max Order:</span>
          <span className="deadlock-badge px-2 py-0.2 text-xs text-emerald-800 font-black tracking-widest bg-emerald-50 border-emerald-300">
            <span>{tactics.skillMaxOrder}</span>
          </span>
        </div>
      </div>

      {/* Max order note */}
      <div className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-sans flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span><strong className="text-slate-900">Why max {tactics.skillMaxOrder}?</strong> {tactics.skillMaxReason}</span>
      </div>

      {/* Abilities List */}
      <div className="space-y-1.5">
        {abilities.map((ability) => (
          <div
            key={ability.key}
            onMouseEnter={(e) => {
              const mouseX = e.clientX;
              const mouseY = e.clientY;
              registerHover({
                id: ability.key,
                type: 'ability',
                title: `[${ability.key}] ${ability.name}`,
                category: 'Champion Ability',
                data: {
                  spell: { name: ability.name, image: { full: ability.iconUrl.split('/').pop() || '' } },
                  abilityTactics: {
                    tldr: ability.tldr,
                    plainEnglish: ability.tldr,
                    whenToUse: ability.whenToUse
                  },
                  key: ability.key,
                  version
                },
                getCoords: () => ({
                  x: Math.min(window.innerWidth - 360, Math.max(20, mouseX + 20)),
                  y: Math.min(window.innerHeight - 250, Math.max(40, mouseY - 40))
                })
              });
            }}
            onMouseLeave={() => unregisterHover(ability.key)}
            className="p-2 sm:p-2.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all flex flex-col sm:flex-row gap-2.5 items-start relative group cursor-pointer"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[8.5px] px-1.5 py-0.2 rounded bg-slate-900 text-white font-bold border border-slate-700 font-sans absolute top-1.5 right-1.5">
              [Tab] to Pin
            </span>
            {/* Ability Icon with Key Tag */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded border border-emerald-500 overflow-hidden bg-slate-100 flex-shrink-0 shadow-2xs">
                <img
                  src={ability.iconUrl}
                  alt={ability.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="deadlock-badge px-1 py-0 text-[8.5px] text-emerald-700">
                  <span>{ability.key}</span>
                </span>
                <h3 className="text-xs sm:text-sm font-black uppercase text-slate-900 block leading-tight mt-0.5">
                  {ability.name}
                </h3>
              </div>
            </div>

            {/* Description & When to Press */}
            <div className="flex-1 space-y-1 w-full text-xs font-sans">
              <p className="text-slate-800 leading-snug">
                <strong className="text-emerald-700 font-bold">What it does: </strong>
                <GlossaryText text={ability.tldr} />
              </p>

              <p className="text-slate-700 leading-snug bg-emerald-50/60 p-1.5 rounded border border-emerald-100">
                <strong className="text-emerald-900 font-bold">When to press: </strong>
                <GlossaryText text={ability.whenToUse} />
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Combos */}
      {tactics.combos.length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <span className="text-xs font-black uppercase text-emerald-700 tracking-wider block mb-1 flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5" />
            Bread & Butter Combos:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {tactics.combos.map((combo, idx) => (
              <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                <span className="font-black uppercase text-slate-900 block mb-0.5">{combo.name}:</span>
                <div className="flex flex-wrap items-center gap-1 mb-1 font-['Barlow_Condensed']">
                  {combo.sequence.map((step, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span className="px-1.5 py-0.2 rounded bg-white text-slate-900 font-bold text-xs border border-slate-200 shadow-2xs">
                        {step}
                      </span>
                      {sIdx < combo.sequence.length - 1 && (
                        <span className="text-emerald-600 font-bold text-xs">➔</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <p className="text-[10.5px] text-slate-600 font-sans">
                  <strong className="text-emerald-700">Tip:</strong> {combo.tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
