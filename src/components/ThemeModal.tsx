import React, { useEffect } from 'react';
import { useTheme, ThemeId } from '../context/ThemeContext';
import { useZoom, ZOOM_PRESETS } from '../context/ZoomContext';
import { X, Check, Sparkles, Sliders, Palette, RefreshCw, ZoomIn, ZoomOut, Monitor } from 'lucide-react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, themes } = useTheme();
  const { zoomLevel, zoomPercent, setZoomLevel, zoomIn, zoomOut, resetZoom } = useZoom();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 font-['Barlow_Condensed']"
      onClick={onClose}
    >
      <div
        className="deadlock-frame relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-700/50 bg-slate-950/40">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-xs">
              <Palette className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-100 leading-none">
                  Display & Atmosphere
                </h3>
                <span className="deadlock-badge px-2 py-0.2 text-[10px] text-emerald-300 bg-emerald-950/60 border-emerald-500/40">
                  <span>SETTINGS</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Adjust interface scale, monitor zoom, and atmospheric themes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Close theme settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 max-h-[70vh]">
          
          {/* SECTION 1: INTERFACE SCALE & ZOOM */}
          <div className="rounded-xl p-3.5 sm:p-4 border border-emerald-500/30 bg-emerald-950/15 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-400" />
                <h4 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-100">
                  Interface Scale & Monitor Zoom
                </h4>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg p-1 font-mono text-slate-200">
                <button
                  onClick={zoomOut}
                  disabled={zoomPercent <= 80}
                  title={zoomPercent <= 80 ? "At minimum zoom out (80%)" : "Zoom Out (Ctrl -)"}
                  className={`w-6 h-6 rounded flex items-center justify-center transition-colors font-bold text-sm ${
                    zoomPercent <= 80
                      ? 'text-slate-600 cursor-not-allowed opacity-50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer'
                  }`}
                >
                  −
                </button>
                <span className="px-2 font-bold text-emerald-400 text-xs sm:text-sm">
                  {zoomPercent}%
                </span>
                <button
                  onClick={zoomIn}
                  disabled={zoomPercent >= 160}
                  title={zoomPercent >= 160 ? "At maximum zoom in (160%)" : "Zoom In (Ctrl +)"}
                  className={`w-6 h-6 rounded flex items-center justify-center transition-colors font-bold text-sm ${
                    zoomPercent >= 160
                      ? 'text-slate-600 cursor-not-allowed opacity-50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer'
                  }`}
                >
                  +
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Scale all cards, items, ability breakdowns, and text to match your monitor size and reading distance.
            </p>

            {/* Interactive Scale Range Slider */}
            <div className="p-2.5 rounded-lg bg-black/30 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                <span className={zoomPercent <= 80 ? 'text-amber-400 font-black' : 'text-slate-400'}>
                  80% (Max Out)
                </span>
                <span className="text-emerald-400 font-black tracking-wide">
                  Active Scale: {zoomPercent}% {zoomPercent === 115 ? '• (Default)' : ''}
                </span>
                <span className={zoomPercent >= 160 ? 'text-amber-400 font-black' : 'text-slate-400'}>
                  160% (Max In)
                </span>
              </div>
              <input
                type="range"
                min="80"
                max="160"
                step="5"
                value={zoomPercent}
                onChange={(e) => setZoomLevel(Number(e.target.value) / 100)}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Presets Row */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
              {ZOOM_PRESETS.map((preset) => {
                const isActive = Math.abs(zoomLevel - preset.value) < 0.02;
                return (
                  <button
                    key={preset.value}
                    onClick={() => setZoomLevel(preset.value)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/40 border border-emerald-400'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 hover:border-slate-500'
                    }`}
                  >
                    {preset.label.replace(' (Comfortable)', '')}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-sans border-t border-slate-800/80">
              <span>Hotkeys: <kbd className="font-mono bg-slate-800 px-1 py-0.2 rounded text-slate-300 border border-slate-700">Ctrl +</kbd> / <kbd className="font-mono bg-slate-800 px-1 py-0.2 rounded text-slate-300 border border-slate-700">Ctrl -</kbd> or <kbd className="font-mono bg-slate-800 px-1 py-0.2 rounded text-slate-300 border border-slate-700">Ctrl + Wheel</kbd></span>
              <button
                onClick={resetZoom}
                className="text-emerald-400 hover:underline uppercase font-bold tracking-wider cursor-pointer"
              >
                Reset Default (115%)
              </button>
            </div>
          </div>

          {/* SECTION 2: ATMOSPHERIC THEMES */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-400" />
              <h4 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-100">
                Atmospheric Color Themes
              </h4>
            </div>

            <div className="space-y-3">
          {themes.map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`relative rounded-xl p-3.5 sm:p-4 border transition-all cursor-pointer select-none group ${
                  isSelected
                    ? 'border-emerald-400/90 bg-emerald-950/20 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/60'
                    : 'border-slate-700/60 bg-slate-800/30 hover:bg-slate-800/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-100 flex items-center gap-1.5">
                        <span>{opt.name}</span>
                        {opt.isDefault && (
                          <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            DEFAULT
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        {opt.tag}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300/90 font-sans leading-relaxed">
                      {opt.description}
                    </p>

                    {/* Palette Swatches Preview */}
                    <div className="pt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Palette:
                      </span>
                      <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-slate-700/50">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: opt.swatches.bg }}
                          title={`Canvas: ${opt.swatches.bg}`}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: opt.swatches.surface }}
                          title={`Surface: ${opt.swatches.surface}`}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: opt.swatches.accent }}
                          title={`Accent: ${opt.swatches.accent}`}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: opt.swatches.text }}
                          title={`Text: ${opt.swatches.text}`}
                        />
                        {opt.swatches.highlight && (
                          <div
                            className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: opt.swatches.highlight }}
                            title={`Highlight: ${opt.swatches.highlight}`}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Radio Indicator */}
                  <div className="flex-shrink-0 pt-0.5">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500 text-slate-950 shadow-xs shadow-emerald-500/50'
                          : 'border-slate-600 bg-slate-900 group-hover:border-slate-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-slate-700/50 bg-slate-950/40 text-xs">
          <button
            onClick={() => setTheme('osaka-jade')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors uppercase font-bold tracking-wider cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Default (Osaka Jade)</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
