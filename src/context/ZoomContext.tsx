import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ZoomContextType {
  zoomLevel: number;
  zoomPercent: number;
  minZoomPercent: number;
  maxZoomPercent: number;
  isMinZoom: boolean;
  isMaxZoom: boolean;
  setZoomLevel: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  isDesktop: boolean;
}

const ZOOM_STORAGE_KEY = 'hexcards_zoom_level';
export const MIN_ZOOM = 0.80;
export const MAX_ZOOM = 1.60;
export const ZOOM_STEP = 0.05;
export const DEFAULT_DESKTOP_ZOOM = 1.15;
export const DEFAULT_MOBILE_ZOOM = 1.00;

export const ZOOM_PRESETS = [
  { label: '90%', value: 0.90 },
  { label: '100%', value: 1.00 },
  { label: '110%', value: 1.10 },
  { label: '115% (Comfortable)', value: 1.15 },
  { label: '125%', value: 1.25 },
  { label: '140%', value: 1.40 },
];

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

export const ZoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDesktop = typeof window !== 'undefined' && Boolean(window.electronAPI?.isDesktop);

  const getInitialZoom = (): number => {
    if (typeof window === 'undefined') return 1.0;
    try {
      const saved = localStorage.getItem(ZOOM_STORAGE_KEY);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= MIN_ZOOM && parsed <= MAX_ZOOM) {
          return Math.round(parsed * 100) / 100;
        }
      }
    } catch {
      // Ignore storage errors
    }
    // Default to 1.15 on desktop for comfortable readability, 1.0 on small mobile
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
    return isSmallScreen ? DEFAULT_MOBILE_ZOOM : DEFAULT_DESKTOP_ZOOM;
  };

  const [zoomLevel, setZoomLevelState] = useState<number>(getInitialZoom);
  const [showToast, setShowToast] = useState<boolean>(false);
  const toastTimerRef = React.useRef<any>(null);

  const triggerToast = useCallback(() => {
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, 1600);
  }, []);

  const applyZoom = useCallback((level: number, notify = false) => {
    const clamped = Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, level)) * 100) / 100;
    setZoomLevelState(clamped);

    if (notify) {
      triggerToast();
    }

    try {
      localStorage.setItem(ZOOM_STORAGE_KEY, clamped.toString());
    } catch {
      // Ignore storage errors
    }

    if (typeof window === 'undefined') return;

    if (window.electronAPI?.setZoomFactor) {
      // Electron native Chromium webFrame scaling (crisp hardware scaling)
      window.electronAPI.setZoomFactor(clamped);
      // Ensure CSS zoom is not doubling the scale
      document.documentElement.style.zoom = '1';
    } else {
      // Browser fallback via modern standard CSS zoom
      (document.documentElement.style as any).zoom = clamped.toString();
    }
  }, [triggerToast]);

  const setZoomLevel = useCallback((level: number) => {
    applyZoom(level, true);
  }, [applyZoom]);

  const zoomIn = useCallback(() => {
    applyZoom(zoomLevel + ZOOM_STEP, true);
  }, [applyZoom, zoomLevel]);

  const zoomOut = useCallback(() => {
    applyZoom(zoomLevel - ZOOM_STEP, true);
  }, [applyZoom, zoomLevel]);

  const resetZoom = useCallback(() => {
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
    applyZoom(isSmallScreen ? DEFAULT_MOBILE_ZOOM : DEFAULT_DESKTOP_ZOOM, true);
  }, [applyZoom]);

  // Initial apply on mount
  useEffect(() => {
    applyZoom(zoomLevel, false);
  }, []);

  // Global Keyboard Shortcuts (Ctrl +, Ctrl -, Ctrl 0) and Mouse Wheel (Ctrl + Wheel)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;

      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        applyZoom(zoomLevel + ZOOM_STEP, true);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        applyZoom(zoomLevel - ZOOM_STEP, true);
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoom();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          applyZoom(zoomLevel + ZOOM_STEP, true);
        } else if (e.deltaY > 0) {
          applyZoom(zoomLevel - ZOOM_STEP, true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [zoomLevel, applyZoom, resetZoom]);

  const zoomPercent = Math.round(zoomLevel * 100);
  const minZoomPercent = Math.round(MIN_ZOOM * 100);
  const maxZoomPercent = Math.round(MAX_ZOOM * 100);

  return (
    <ZoomContext.Provider
      value={{
        zoomLevel,
        zoomPercent,
        minZoomPercent,
        maxZoomPercent,
        isMinZoom: zoomPercent <= minZoomPercent,
        isMaxZoom: zoomPercent >= maxZoomPercent,
        setZoomLevel,
        zoomIn,
        zoomOut,
        resetZoom,
        isDesktop
      }}
    >
      {children}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 text-white border border-emerald-500/70 shadow-2xl px-4 py-1.5 rounded-full flex items-center gap-2.5 font-mono text-xs backdrop-blur-md animate-in fade-in zoom-in-95 pointer-events-none select-none">
          <span className={`w-2 h-2 rounded-full ${zoomPercent <= minZoomPercent || zoomPercent >= maxZoomPercent ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
          <span className="font-bold text-slate-200">
            Scale: <span className="text-emerald-300 font-black">{zoomPercent}%</span>
          </span>
          <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">
            {zoomPercent <= minZoomPercent ? (
              <span className="text-amber-300 font-bold">MIN OUT REACHED ({minZoomPercent}%)</span>
            ) : zoomPercent >= maxZoomPercent ? (
              <span className="text-amber-300 font-bold">MAX IN REACHED ({maxZoomPercent}%)</span>
            ) : (
              `Range: ${minZoomPercent}% (Min) – ${maxZoomPercent}% (Max)`
            )}
          </span>
        </div>
      )}
    </ZoomContext.Provider>
  );
};

export const useZoom = (): ZoomContextType => {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
};
