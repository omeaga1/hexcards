import React from 'react';
import { TacticalGuide } from '../../types';
import { ArrowLeftRight } from 'lucide-react';
import { BG3Tooltip, GlossaryText } from '../Glossary/BG3Tooltip';

interface RunesDemystifiedProps {
  tactics: TacticalGuide;
}

export const RunesDemystified: React.FC<RunesDemystifiedProps> = ({ tactics }) => {
  const { runeKit } = tactics;

  return (
    <div className="deadlock-frame w-full rounded-xl p-2.5 sm:p-3 shadow-sm flex flex-col gap-2.5 font-['Barlow_Condensed'] bg-white border border-slate-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="deadlock-badge px-2 py-0.5 text-xs text-emerald-700">
            <span>RUNES</span>
          </span>
          <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-wide">
            Recommended Rune Kit
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="deadlock-badge px-2 py-0.2 text-[10px] text-emerald-800 bg-emerald-50 border-emerald-300 font-bold">
            <span>{runeKit.primaryTree} + {runeKit.secondaryTree}</span>
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-slate-500 text-[9.5px] font-bold uppercase mr-0.5">Shards:</span>
            {(runeKit.statShards.includes('•') ? runeKit.statShards.split('•') : runeKit.statShards.split('+'))
              .map((s) => s.trim().replace(/^•\s*/, '').replace(/\s*•$/, ''))
              .filter(Boolean)
              .map((shard, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[9.5px] font-bold font-sans shadow-2xs"
                >
                  {shard}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        
        {/* Col 1: Primary Keystone */}
        <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="deadlock-badge px-1.5 py-0.2 text-[9.5px] text-emerald-700">
                <span>KEYSTONE</span>
              </span>
              <span className="text-xs font-black uppercase text-slate-500">
                {runeKit.primaryTree}
              </span>
            </div>

            <h3 className="text-base font-black uppercase text-slate-900 tracking-wide mb-1">
              {runeKit.keystone.name}
            </h3>

            <p className="text-[11px] text-emerald-700 font-bold mb-1.5 font-sans">
              <GlossaryText text={runeKit.keystone.tldr} />
            </p>

            <div className="p-2 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 font-sans leading-snug">
              <strong className="text-slate-900">Why run it:</strong> <GlossaryText text={runeKit.keystone.why} />
            </div>
          </div>

          <div className="text-[10.5px] text-slate-500 font-sans mt-2 pt-1 border-t border-slate-100">
            Scales with your <BG3Tooltip termId="adaptive_force">Adaptive Force</BG3Tooltip>.
          </div>
        </div>

        {/* Col 2: Primary Minors */}
        <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-1.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                Primary Minor Runes (3 Slots)
              </span>
            </div>

            <div className="space-y-1.5">
              {runeKit.primaryMinors.map((minor, idx) => (
                <div key={idx} className="p-1.5 rounded bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 mb-0.5">
                    <span className="uppercase">{minor.name}</span>
                    <span className="text-[9.5px] text-emerald-700 font-bold">{minor.slot || `Slot ${idx + 1}`}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 font-sans leading-snug">
                    <GlossaryText text={minor.effect} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: Secondary Tree & Crucial Swap */}
        <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                Secondary Tree ({runeKit.secondaryTree})
              </span>
              <span className="text-[9.5px] text-emerald-700 font-bold uppercase">Default</span>
            </div>

            <div className="space-y-1 mb-2">
              {runeKit.secondaryMinors.map((sec, idx) => (
                <div key={idx} className="p-1.5 rounded bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 uppercase block text-[11px]">{sec.name}</span>
                  <p className="text-[10.5px] text-slate-600 font-sans leading-snug">
                    <GlossaryText text={sec.effect} />
                  </p>
                </div>
              ))}
            </div>

            {/* Crucial Swap Rule */}
            <div className="p-2 rounded bg-amber-50/70 border border-amber-200 text-xs">
              <div className="flex items-center gap-1 text-amber-800 font-black uppercase mb-0.5">
                <ArrowLeftRight className="w-3 h-3 text-amber-700" />
                <span>The One Matchup Swap:</span>
              </div>
              <p className="text-[10.5px] text-slate-700 font-sans mb-0.5 leading-snug">
                <strong className="text-slate-900">When:</strong> {runeKit.swapRule.trigger}
              </p>
              <div className="text-[10.5px] text-emerald-800 font-bold mb-0.5 font-sans">
                ➔ Swap {runeKit.swapRule.insteadOf} for <span className="underline">{runeKit.swapRule.take}</span>
              </div>
              <p className="text-[9.5px] text-slate-600 font-sans leading-snug">
                <GlossaryText text={runeKit.swapRule.why} />
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
