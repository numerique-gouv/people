import { useEffect, useState } from 'react';

import {
  EnumApplicationName,
  useApplicationContext,
} from '@/features/application/ApplicationContext';

export type TypeApplicationMeta = {
  name: string;
  panel: {
    itemsName: EnumMetaItemsName;
  };
};

export enum EnumMetaItemsName {
  TEAM = 'teams',
  MAIL_DOMAINS = 'mail-domains',
}

type TypeApplicationMetaMap = {
  [key: string]: TypeApplicationMeta;
};

const applicationMetaMap: TypeApplicationMetaMap = {
  [EnumApplicationName.TEAM]: {
    name: 'Team',
    panel: {
      itemsName: EnumMetaItemsName.TEAM,
    },
  },
  [EnumApplicationName.MAIL_DOMAINS]: {
    name: 'Mail Domains',
    panel: {
      itemsName: EnumMetaItemsName.MAIL_DOMAINS,
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
