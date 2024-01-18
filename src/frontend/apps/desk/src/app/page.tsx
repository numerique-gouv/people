'use client';

import { Loader } from '@openfun/cunningham-react';
import { useEffect } from 'react';

import useAuthStore from '@/auth/useAuthStore';

import Header from './Header/Header';
import { Teams } from './Teams';

export default function Home() {
  const { initAuth, authenticated, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized) {
      return;
    }

    initAuth();
  }, [initAuth, initialized]);

  if (!authenticated) {
    return <Loader />;
  }

  return (
    <main>
      <Header />
      <Teams />
    </main>
  );
}
