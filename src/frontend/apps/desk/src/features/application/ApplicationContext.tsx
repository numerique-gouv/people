import { createContext, useContext } from 'react';

export enum EnumApplicationName {
  TEAM = 'team',
  MAIL_DOMAINS = 'mail-domains',
}

type ApplicationContextValue = {
  name?: EnumApplicationName;
};

const ApplicationContext = createContext<ApplicationContextValue | undefined>({
  name: EnumApplicationName.TEAM,
});

export const useApplicationContext = () => useContext(ApplicationContext);

export default ApplicationContext;
