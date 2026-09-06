import React from 'react';
import { TacticalGuide } from '../../types';
import { ArrowRight, Shield, Zap, Sparkles, Heart, Activity } from 'lucide-react';
import { BG3Tooltip, GlossaryText } from '../Glossary/BG3Tooltip';
import { getRuneIconUrl, getTreeTheme } from '../../data/runeIcons';

interface RunesDemystifiedProps {
  tactics: TacticalGuide;
}

export const RunesDemystified: React.FC<RunesDemystifiedProps> = ({ tactics }) => {
  const { runeKit } = tactics;
  const primaryTheme = getTreeTheme(runeKit.primaryTree);
  const secondaryTheme = getTreeTheme(runeKit.secondaryTree);

  const primaryTreeIcon = getRuneIconUrl(runeKit.primaryTree);
  const secondaryTreeIcon = getRuneIconUrl(runeKit.secondaryTree);
  const keystoneIcon = getRuneIconUrl(runeKit.keystone.name);
  const swapOldIcon = getRuneIconUrl(runeKit.swapRule.insteadOf);
  const swapNewIcon = getRuneIconUrl(runeKit.swapRule.take);

  // Parse stat shards
  const rawShards = (runeKit.statShards.includes('•') ? runeKit.statShards.split('•') : runeKit.statShards.split('+'))
    .map((s) => s.trim().replace(/^•\s*/, '').replace(/\s*•$/, ''))
    .filter(Boolean);

  const getShardIcon = (shardText: string) => {
    const text = shardText.toLowerCase();
    if (text.includes('adaptive') || text.includes('force') || text.includes('attack damage') || text.includes('ap')) {
      return <Zap className="w-3 h-3 text-amber-600" />;
    }
    if (text.includes('attack speed') || text.includes('haste') || text.includes('speed')) {
      return <Sparkles className="w-3 h-3 text-sky-600" />;
    }
    if (text.includes('health') || text.includes('hp')) {
      return <Heart className="w-3 h-3 text-rose-500" />;
    }
    if (text.includes('armor') || text.includes('resist') || text.includes('tenacity') || text.includes('defense')) {
      return <Shield className="w-3 h-3 text-emerald-600" />;
    }
    return <Activity className="w-3 h-3 text-slate-600" />;
  };

  return (
    <div className="deadlock-frame w-full rounded-xl p-3 sm:p-4 shadow-sm flex flex-col gap-3 font-['Barlow_Condensed'] bg-white border border-slate-200 select-none">
      {/* Mobalytics + Deadlock Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2.5 py-0.5 rounded shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">RUNES ENGINE</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-wide">
            Optimal Rune Page & Matchup Pivots
          </h2>
        </div>

        {/* Tree Badges & Quick Meta Pill */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200">
            {primaryTreeIcon && (
              <img src={primaryTreeIcon} alt={runeKit.primaryTree} className="w-4 h-4 object-contain" />
            )}
            <span className="text-xs font-black uppercase text-slate-900">
              {runeKit.primaryTree}
            </span>
            <span className="text-slate-400 font-bold">/</span>
            {secondaryTreeIcon && (
              <img src={secondaryTreeIcon} alt={runeKit.secondaryTree} className="w-4 h-4 object-contain" />
            )}
            <span className="text-xs font-black uppercase text-slate-700">
              {runeKit.secondaryTree}
            </span>
          </div>

          <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded shadow-2xs">
            HIGH WINRATE SETUP
          </span>
        </div>
      </div>

      {/* Main 3-Column Mobalytics + Deadlock Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* COLUMN 1: PRIMARY PATH & KEYSTONE (5 Cols) */}
        <div className="lg:col-span-5 rounded-lg bg-white border border-slate-200 p-3 shadow-2xs flex flex-col justify-between space-y-3">
          {/* Primary Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {primaryTreeIcon ? (
                <img src={primaryTreeIcon} alt={runeKit.primaryTree} className="w-5 h-5 object-contain" />
              ) : null}
              <span className="text-sm font-black uppercase tracking-wider text-slate-900">
                {runeKit.primaryTree} Path
              </span>
            </div>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${primaryTheme.badgeBg} ${primaryTheme.badgeText}`}>
              PRIMARY
            </span>
          </div>

          {/* Keystone Highlight Card (Mobalytics style emblem with Deadlock HUD glow) */}
          <div className={`relative p-3 rounded-lg border-2 ${primaryTheme.borderColor} bg-gradient-to-br from-slate-50 via-white to-amber-50/20 shadow-xs flex items-start gap-3`}>
            {/* Glowing Keystone Emblem */}
            <div className="relative flex-shrink-0">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-950 p-1 flex items-center justify-center shadow-md border-2 border-amber-400/80 ring-4 ring-amber-400/20"
                style={{ boxShadow: `0 0 16px ${primaryTheme.glowColor}` }}
              >
                {keystoneIcon ? (
                  <img
                    src={keystoneIcon}
                    alt={runeKit.keystone.name}
                    className="w-full h-full object-contain rounded-full hover:scale-110 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white font-black text-xs">
                    KEY
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 text-[8px] font-black uppercase bg-slate-900 text-amber-300 border border-amber-400/60 px-1 rounded shadow-2xs">
                CORE
              </span>
            </div>

            {/* Keystone Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-wide truncate">
                  {runeKit.keystone.name}
                </h3>
              </div>
              <p className="text-[11px] text-emerald-800 font-bold mb-1 font-sans line-clamp-2">
                <GlossaryText text={runeKit.keystone.tldr} />
              </p>
              <div className="p-1.5 rounded bg-white/90 border border-slate-200 text-[11px] text-slate-700 font-sans leading-snug">
                <strong className="text-slate-900">Why run it:</strong>{' '}
                <GlossaryText text={runeKit.keystone.why} />
              </div>
            </div>
          </div>

          {/* Primary Minor Runes (3 Tier Rows) */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 block">
              Primary Minor Passives
            </span>
            {runeKit.primaryMinors.map((minor, idx) => {
              const minorIcon = getRuneIconUrl(minor.name);
              return (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-colors flex items-center gap-2.5 shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 p-0.5 flex-shrink-0 flex items-center justify-center border border-slate-300 shadow-2xs">
                    {minorIcon ? (
                      <img src={minorIcon} alt={minor.name} className="w-full h-full object-contain rounded-full" />
                    ) : (
                      <span className="text-[9px] font-bold text-slate-300">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-black uppercase text-slate-900 tracking-wide">
                        {minor.name}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">
                        Tier {idx + 1}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 font-sans leading-snug line-clamp-2">
                      <GlossaryText text={minor.effect} />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: SECONDARY PATH & STAT SHARD MATRIX (4 Cols) */}
        <div className="lg:col-span-4 rounded-lg bg-white border border-slate-200 p-3 shadow-2xs flex flex-col justify-between space-y-3">
          {/* Secondary Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {secondaryTreeIcon ? (
                <img src={secondaryTreeIcon} alt={runeKit.secondaryTree} className="w-5 h-5 object-contain" />
              ) : null}
              <span className="text-sm font-black uppercase tracking-wider text-slate-900">
                {runeKit.secondaryTree} Path
              </span>
            </div>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${secondaryTheme.badgeBg} ${secondaryTheme.badgeText}`}>
              SECONDARY
            </span>
          </div>

          {/* Secondary Minor Runes (2 Rows) */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 block">
              Secondary Minor Passives
            </span>
            {runeKit.secondaryMinors.map((sec, idx) => {
              const secIcon = getRuneIconUrl(sec.name);
              return (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-colors flex items-center gap-2.5 shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 p-0.5 flex-shrink-0 flex items-center justify-center border border-slate-300 shadow-2xs">
                    {secIcon ? (
                      <img src={secIcon} alt={sec.name} className="w-full h-full object-contain rounded-full" />
                    ) : (
                      <span className="text-[9px] font-bold text-slate-300">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black uppercase text-slate-900 tracking-wide block mb-0.5">
                      {sec.name}
                    </span>
                    <p className="text-[10.5px] text-slate-600 font-sans leading-snug line-clamp-2">
                      <GlossaryText text={sec.effect} />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobalytics-Style Stat Shard Matrix */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-900">
                Stat Shard Array
              </span>
              <span className="text-[9px] font-mono text-slate-500 uppercase">
                3 Bonus Perks
              </span>
            </div>

            <div className="space-y-1">
              {rawShards.map((shard, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2 py-1 rounded bg-white border border-slate-200 shadow-2xs text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-slate-100 border border-slate-200">
                      {getShardIcon(shard)}
                    </div>
                    <span className="text-[11px] font-black uppercase text-slate-900">
                      {shard}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold uppercase text-slate-500 font-mono">
                    {idx === 0 ? 'Offense' : idx === 1 ? 'Flex' : 'Defense'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 3: THE CRUCIAL MATCHUP SWAP ENGINE (3 Cols) */}
        <div className="lg:col-span-3 rounded-lg bg-gradient-to-b from-amber-50/80 via-white to-amber-50/40 border-2 border-amber-300 p-3 shadow-2xs flex flex-col justify-between space-y-2.5">
          <div>
            {/* Swap Header */}
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                  Matchup Swap Rule
                </span>
              </div>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 border border-amber-300">
                PIVOT
              </span>
            </div>

            {/* When Trigger */}
            <div className="mt-2 p-2 rounded bg-white/90 border border-amber-200 shadow-2xs">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-800 block mb-0.5">
                When Facing Matchup:
              </span>
              <p className="text-[11px] text-slate-800 font-bold font-sans leading-snug">
                {runeKit.swapRule.trigger}
              </p>
            </div>

            {/* Visual Swap Pathway */}
            <div className="my-2 p-2 rounded-lg bg-white border border-amber-200 flex items-center justify-between gap-1 shadow-2xs">
              {/* Old Rune */}
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-slate-900 p-0.5 flex-shrink-0 flex items-center justify-center border border-rose-300">
                  {swapOldIcon ? (
                    <img src={swapOldIcon} alt={runeKit.swapRule.insteadOf} className="w-full h-full object-contain rounded-full" />
                  ) : (
                    <span className="text-[8px] text-rose-300 font-bold">OLD</span>
                  )}
                </div>
                <div className="truncate">
                  <span className="text-[8px] font-black uppercase text-rose-600 block leading-none">Drop</span>
                  <span className="text-[10.5px] font-black uppercase text-slate-800 truncate block">
                    {runeKit.swapRule.insteadOf}
                  </span>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-amber-600 flex-shrink-0 animate-pulse" />

              {/* New Rune */}
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-slate-900 p-0.5 flex-shrink-0 flex items-center justify-center border-2 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                  {swapNewIcon ? (
                    <img src={swapNewIcon} alt={runeKit.swapRule.take} className="w-full h-full object-contain rounded-full" />
                  ) : (
                    <span className="text-[8px] text-emerald-300 font-bold">NEW</span>
                  )}
                </div>
                <div className="truncate">
                  <span className="text-[8px] font-black uppercase text-emerald-700 block leading-none">Take</span>
                  <span className="text-[10.5px] font-black uppercase text-emerald-950 font-bold truncate block underline decoration-emerald-500">
                    {runeKit.swapRule.take}
                  </span>
                </div>
              </div>
            </div>

            {/* Why Pivot Justification */}
            <div className="p-2 rounded bg-white/90 border border-slate-200 text-[10.5px] text-slate-700 font-sans leading-snug">
              <strong className="text-slate-900">Tactical Reason:</strong>{' '}
              <GlossaryText text={runeKit.swapRule.why} />
            </div>
          </div>

          <div className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider text-center pt-1 border-t border-amber-200/60">
            Deadlock Tactical Ruleset
          </div>
        </div>

      </div>
    </div>
  );
};
