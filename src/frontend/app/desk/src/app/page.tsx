'use client';

import { Button } from '@openfun/cunningham-react';

import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <h2>Hello world!</h2>
      <Button>Button Cunningham</Button>
    </main>
  );
}
