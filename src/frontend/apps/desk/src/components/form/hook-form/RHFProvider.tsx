import { ConfirmationModal, useModal } from '@openfun/cunningham-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { MutableRefObject, useEffect, useState } from 'react';
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Box } from '@/components';
import { LoadingButton } from '@/components/button/LoadingButton';

export interface RHFProviderProps<T extends FieldValues> {
  children: React.ReactNode;
  id?: string;
  methods: UseFormReturn<T>;
  actionButtons?: React.ReactNode;
  onSubmit?: VoidFunction;
  formRef?: MutableRefObject<HTMLFormElement | undefined>;
  isSubmitting?: boolean;
  showSubmit?: boolean;
  checkBeforeUnload?: boolean;
}

export function RHFProvider<T extends FieldValues>({
  children,
  onSubmit,
  methods,
  actionButtons,
  showSubmit = true,
  isSubmitting = false,
  checkBeforeUnload = false,
  id,
}: RHFProviderProps<T>) {
  const { t } = useTranslation();
  const router = useRouter();
  const [nextUrl, setNextUrl] = useState<string>();
  const confirmModal = useModal();
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!checkBeforeUnload || !methods.formState.isDirty) {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [methods.formState.isDirty]);

  return (
    <FormProvider {...methods}>
      <form
        id={id}
        onSubmit={(event) => {
          event.stopPropagation();
          event.preventDefault();
          onSubmit?.();
        }}
      >
        {children}
        {(showSubmit || actionButtons) && (
          <Box className="flex justify-end mt-b" $gap={5}>
            {actionButtons}
            {showSubmit && (
              <LoadingButton
                data-testid={id ? `submit-button-${id}` : 'submit-button'}
                loading={isSubmitting}
                type="submit"
              >
                {t('Submit')}
              </LoadingButton>
            )}
          </Box>
        )}
      </form>
      <ConfirmationModal
        {...confirmModal}
        data-testid="unsaved-form-modal"
        onClose={confirmModal.close}
        onDecide={(decision) => {
          if (decision === 'yes' && nextUrl) {
            router.push(nextUrl);
          } else {
            setNextUrl(undefined);
            confirmModal.close();
          }
        }}
      >
        {t('form.dirty.modal')}
      </ConfirmationModal>
    </FormProvider>
  );
}
