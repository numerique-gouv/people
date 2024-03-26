import { VariantType, useToastProvider } from '@openfun/cunningham-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { fetchAPI } from '@/api';

export const useLogout = () => {
  const router = useRouter();
  const { toast } = useToastProvider();
  const { t } = useTranslation();

  const logout = async (): Promise<void> => {
    try {
      await fetchAPI(`logout/`, {
        method: 'POST',
        redirect: 'manual',
      });
      router.reload();
    } catch (e) {
      toast(t('Error occurred while logging out'), VariantType.ERROR, {
        duration: 4000,
      });
    }
  };

  return { logout };
};
