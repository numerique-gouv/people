import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export const CreateNewTeamSearchShortcut = () => {
  const { t } = useTranslation('team');
  const router = useRouter();
  return (
    <div
      role="none"
      className="flex-v-center"
      onClick={() => router.push('/teams/create')}
    >
      <span className="material-icons ">add</span>
      <span className="ml-st">{t('teams.search.new_group.label')}</span>
    </div>
  );
};
