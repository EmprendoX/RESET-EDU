import { useEffect, useState } from 'react';

const DESKTOP_BREAKPOINT = 1024; // matches Tailwind's `lg`

interface ResponsiveLayout {
  isDesktop: boolean;
  isMobile: boolean;
  width: number;
}

function readState(): ResponsiveLayout {
  if (typeof window === 'undefined') {
    return { isDesktop: true, isMobile: false, width: 1280 };
  }
  const w = window.innerWidth;
  return {
    width: w,
    isDesktop: w >= DESKTOP_BREAKPOINT,
    isMobile: w < DESKTOP_BREAKPOINT,
  };
}

export function useResponsiveLayout(): ResponsiveLayout {
  const [state, setState] = useState<ResponsiveLayout>(readState);

  useEffect(() => {
    function handle() {
      setState(readState());
    }
    window.addEventListener('resize', handle, { passive: true });
    handle();
    return () => window.removeEventListener('resize', handle);
  }, []);

  return state;
}
