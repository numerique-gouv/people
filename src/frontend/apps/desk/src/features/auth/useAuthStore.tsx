import { create } from 'zustand';

import { UserData, getMe } from '@/features/auth/api';

interface AuthStore {
  authenticated: boolean;
  initAuth: () => void;
  initialized: boolean;
  logout: () => void;
  userData?: UserData;
}

const initialState = {
  authenticated: false,
  initialized: false,
  userData: undefined,
};

export const useAuthStore = create<AuthStore>((set) => ({
  authenticated: initialState.authenticated,
  initialized: initialState.initialized,
  userData: initialState.userData,

  initAuth: () =>
    set((state) => {
      if (state.initialized) {
        return {};
      }
      getMe()
        .then((data: UserData) => {
          set({ initialized: true, authenticated: true, userData: data });
          return { initialized: true };
        })
        .catch(() => {
          // todo - implement a proper login screen to prevent automatic navigation.
          window.location.replace(
            new URL('authenticate', process.env.NEXT_PUBLIC_API_URL).href,
          );
        });
      return {};
    }),

  // todo - implement a proper logout to end session
  // todo - please follow AC instructions here https://github.com/france-connect/Documentation-AgentConnect/blob/26685161a2031f7145e02bede8c4d0aae97ba105/doc_fs/technique_fca/endpoints.md?plain=1#L324
  logout: () => {
    set(initialState);
  },
}));
