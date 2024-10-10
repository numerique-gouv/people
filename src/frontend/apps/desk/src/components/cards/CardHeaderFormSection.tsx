import { Button } from '@openfun/cunningham-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { LoadingButton } from '@/components/button/LoadingButton';
import { CardHeaderSection } from '@/components/cards/CardHeaderSection';

type Props = {
  title: string;
  sticky?: boolean;
  formId?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
};
export const CardHeaderFormSection = ({
  title,
  onCancel,
  onSubmit,
  isLoading = false,
  formId,
  sticky = false,
}: Props) => {
  const { t } = useTranslation();

  return (
    <CardHeaderSection
      sticky={sticky}
      title={title}
      left={
        <Button type="button" size="small" onClick={onCancel} color="secondary">
          {t('Cancel')}
        </Button>
      }
      right={
        <LoadingButton
          loading={isLoading}
          type="submit"
          size="small"
          form={formId}
          onClick={onSubmit}
        >
          {t('Validate')}
        </LoadingButton>
      }
    />
  );
};
