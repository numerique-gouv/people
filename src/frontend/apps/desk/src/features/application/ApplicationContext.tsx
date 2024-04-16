import { createContext, useContext } from 'react';

export enum ApplicationName {
  TEAM = 'team',
  MAIL_DOMAIN = 'mail-domain',
}

type ApplicationContextValue = {
  name?: ApplicationName;
};

const ApplicationContext = createContext<ApplicationContextValue | undefined>({
  name: ApplicationName.TEAM,
});

export const useApplicationContext = () => useContext(ApplicationContext);

export default ApplicationContext;
