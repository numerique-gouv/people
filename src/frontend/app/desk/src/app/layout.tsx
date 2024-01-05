'use client';

import { CunninghamProvider, Switch } from '@openfun/cunningham-react';
import { Inter } from 'next/font/google';
import { useState } from 'react';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeDark, setThemeDark] = useState(false);

  return (
    <html lang="en">
      <body className={inter.className}>
        <CunninghamProvider theme={themeDark ? 'dark' : 'default'}>
          <div
            style={{
              backgroundColor: themeDark ? '#555' : 'white',
            }}
          >
            <Switch
              label="Dark"
              onChange={() => setThemeDark(!themeDark)}
              checked={themeDark}
            />
            {children}
          </div>
        </CunninghamProvider>
      </body>
    </html>
  );
}
