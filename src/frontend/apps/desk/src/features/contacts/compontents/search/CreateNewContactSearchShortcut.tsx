import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export const CreateNewContactSearchShortcut = () => {
  const { t } = useTranslation('contact');
  const router = useRouter();
  return (
    <div
      role="none"
      className="flex-v-center"
      onClick={() => router.push('/contacts/create')}
    >
      <span className="material-icons ">add</span>
      <span className="ml-st">{t('contact.search.add_new_contact')}</span>
    </div>
  );
};
