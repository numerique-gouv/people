import { useEffect, useState } from 'react';

import {ApplicationName, useApplicationContext} from '@/features/application/ApplicationContext';
import { default as IconApplicationTeamsUrl } from '@/features/header/assets/icon-application.svg?url';
import { default as IconApplicationMailUrl } from '@/features/mail-domain/assets/icon-application-mail.svg?url';

export type TypeApplicationMeta = {
  name: string;
  header: {
    iconApplication: {
      content: string;
      altText: string;
    };
    title: string;
  };
};

type TypeApplicationMetaMap = {
  [key: string]: TypeApplicationMeta;
};

const applicationMetaMap: TypeApplicationMetaMap = {
  [ApplicationName.TEAM]: {
    name: 'Team',
    header: {
      iconApplication: {
        content: IconApplicationTeamsUrl,
        altText: 'Team Logo',
      },
      title: 'Team',
    },
  },
  [ApplicationName.MAIL_DOMAIN]: {
    name: 'Mail Domain',
    header: {
      iconApplication: {
        content: IconApplicationMailUrl,
        altText: 'Mail Domain Logo',
      },
      title: 'Mail Domain',
    },
  },
};

export const useApplicationMeta = () => {
  const applicationContext = useApplicationContext();
  const name = applicationContext?.name ? applicationContext.name : null;

  const [applicationMeta, setApplicationMeta] = useState<
    TypeApplicationMeta | undefined
  >(undefined);

  useEffect(() => {
    return () => {
      setApplicationMeta(undefined);
    };
  }, []);

  useEffect(() => {
    if (typeof name === 'string') {
      const applicationMeta: TypeApplicationMeta | undefined =
        applicationMetaMap[name] ? applicationMetaMap[name] : undefined;

      setApplicationMeta(applicationMeta);
    }
  }, [name]);

  return applicationMeta;
};
