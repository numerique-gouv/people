'use client';

import { CunninghamProvider, Switch } from '@openfun/cunningham-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Inter } from 'next/font/google';
import { useState } from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeDark, setThemeDark] = useState(false);

  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </body>
    </html>
  );
}
