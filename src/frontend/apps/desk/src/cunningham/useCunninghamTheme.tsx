import { create } from 'zustand';

import { tokens } from './cunningham-tokens';
type ColorsTokens = typeof tokens.themes.default.theme.colors;
type ComponentTokens = typeof tokens.themes.default.components;

interface AuthStore {
  theme: string;
  setTheme: (theme: string) => void;
  colorsTokens: () => ColorsTokens;
  componentTokens: () => ComponentTokens;
}

const useCunninghamTheme = create<AuthStore>((set, get) => {
  const currentTheme = () => tokens.themes[get().theme as 'default'];

  return {
    theme: 'dsfr',
    colorsTokens: () => currentTheme().theme.colors,
    componentTokens: () => currentTheme().components,
    setTheme: (theme: string) => {
      set({ theme });
    },
  };
});

export default useCunninghamTheme;
