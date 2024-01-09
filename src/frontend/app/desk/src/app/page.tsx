'use client';

import { Button, Loader } from '@openfun/cunningham-react';
import { useEffect } from 'react';

import styles from './page.module.css';

import useAuthStore from '@/auth/useAuthStore';

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
      <Button>Button Cunningham</Button>
    </main>
  );
}
