import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import { AppProvider } from '@/core/';
import { NextPageWithLayout } from '@/types/next';

import './globals.scss';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t('Régie')}</title>
        <meta
          name="description"
          content={t(
            'La Suite administration interface: management of users and rights on the various tools (messaging, storage, etc.)',
          )}
        />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <AppProvider>{getLayout(<Component {...pageProps} />)}</AppProvider>
    </>
  );
}
