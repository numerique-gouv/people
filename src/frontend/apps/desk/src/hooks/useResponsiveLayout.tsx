import { create } from 'zustand';

type ResponsiveStore = {
  showModule: boolean;
  isFocusOnContent: boolean;

  toggleMenu: () => void;
  focusOnContent: () => void;
  focusOnLeft: () => void;
};

const initialState = {
  showModule: false,
  isFocusOnContent: false,
};

export const useResponsiveLayout = create<ResponsiveStore>((set) => ({
  showModule: initialState.showModule,
  isFocusOnContent: initialState.isFocusOnContent,

  toggleMenu: () => {
    set((old) => ({
      showModule: !old.showModule,
    }));
  },
  focusOnContent: () => {
    set({ isFocusOnContent: true });
  },
  focusOnLeft: () => {
    set({ isFocusOnContent: false });
  },
}));
