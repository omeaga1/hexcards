/**
 * Comprehensive device and mobile environment detection utilities.
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouch: false,
      isIOS: false,
      isAndroid: false,
      isStandalone: false,
      screenWidth: 1024,
      screenHeight: 768,
    };
  }

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const isMobileUa = /Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isMobile = isMobileUa || screenWidth < 768;
  const isTablet = !isMobile && (screenWidth < 1024 && (isTouch || /iPad|Tablet/i.test(ua)));
  const isDesktop = !isMobile && !isTablet;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    isIOS,
    isAndroid,
    isStandalone,
    screenWidth,
    screenHeight,
  };
}
