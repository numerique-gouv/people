import { useEffect, useState } from 'react';

export enum Breakpoints {
  XS = 0,
  SM = 576,
  MD = 768,
  LG = 992,
  xl = 1200,
  XXL = 1400,
}
export const useBreakpoint = (
  breakpoint: Breakpoints,
  minWidth: boolean = true,
) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      minWidth
        ? `(min-width: ${breakpoint}px)`
        : `(max-width: ${breakpoint}px)`,
    );
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => {
      setMatches(media.matches);
    };

    media.addEventListener('change', listener);

    return () => {
      media.removeEventListener('change', listener);
    };
  }, [matches, breakpoint]);

  return matches;
};
