import { create } from 'zustand';

import { initKeycloak } from './keycloak';

interface AuthStore {
  initialized: boolean;
  authenticated: boolean;
  token: string | null;
  initAuth: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  initialized: false,
  authenticated: false,
  token: null,

  initAuth: () =>
    set((state) => {
      if (process.env.NODE_ENV === 'development' && !state.initialized) {
        initKeycloak((token) => set({ authenticated: true, token }));
        return { initialized: true };
      }

      /**
       * TODO: Implement OIDC production authentication
       */

      return {};
    }),
}));

export default useAuthStore;
