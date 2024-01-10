'use client';

import { Loader } from '@openfun/cunningham-react';
import { useEffect } from 'react';

import useAuthStore from '@/auth/useAuthStore';

import { Teams } from './Teams';
import styles from './page.module.css';

export default function Home() {
  const { initAuth, authenticated } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (!authenticated) {
    return <Loader />;
  }

  return (
    <main className={styles.main}>
      <h2>Hello world!</h2>
      <Teams />
    </main>
  );
}
