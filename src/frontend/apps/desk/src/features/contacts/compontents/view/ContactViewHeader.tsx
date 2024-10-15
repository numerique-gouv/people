import {
  DeleteConfirmationModal,
  ModalSize,
  useModal,
} from '@openfun/cunningham-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IconOptions } from '@/components';
import { ContactAvatar } from '@/components/avatar/ContactAvatar';
import {
  DropdownMenu,
  DropdownMenuOption,
} from '@/components/dropdown-menu/DropdownMenu';
import { Icon } from '@/components/icons/Icon';
import { FocusOnLeft } from '@/components/layouts/responsive/FocusOnLeft';
import { useDeleteContact } from '@/features/contacts/api/useContact';
import { Contact } from '@/features/contacts/contact';

import style from './contact-view.module.scss';

type Props = {
  contact: Contact;
  showOptions?: boolean;
};
export const ContactViewHeader = ({ contact, showOptions = true }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const deleteContact = useDeleteContact(contact.id);
  const deleteModal = useModal();
  const [isDropOpen, setIsDropOpen] = useState(false);
  const actions: DropdownMenuOption[] = [
    {
      label: t('Update'),
      icon: 'edit',
      callback: () => router.push(`/contacts/${contact.id}/edit`),
    },
    {
      label: t('Remove contact'),
      icon: 'delete',
      callback: deleteModal.open,
    },
  ];

  const getInformationText = (): string => {
    let result = contact.publicData?.information ?? '';

    const personalInformation =
      contact.information?.replace(/(\r\n|\n|\r)/gm, '').trim() ?? '';

    if (result.length > 0 && personalInformation.length > 0) {
      result = `${result} | ${contact.information}`;
    } else if (result.length === 0 && personalInformation.length > 0) {
      result = personalInformation;
    }
    return result;
  };

  return (
    <>
      <div className={`${style.contactHeader} gap-st`}>
        <ContactAvatar size="large" contact={contact} />
        <span className="fs-h3 fw-bold">
          {contact.firstName} {contact.lastName}
        </span>
        <span
          className={`fs-l clr-grey-400 text-center ${style.informationText}`}
        >
          {getInformationText()}
        </span>

        <div className={style.back}>
          <FocusOnLeft>
            <Icon icon="arrow_back" />
          </FocusOnLeft>
        </div>
        {showOptions && (
          <div className={style.moreActions}>
            <DropdownMenu
              options={actions}
              onOpenChange={(isOpen) => setIsDropOpen(isOpen)}
              isOpen={isDropOpen}
            >
              <IconOptions
                isOpen={isDropOpen}
                aria-label={t('Open the team options')}
              />
            </DropdownMenu>
          </div>
        )}
      </div>
      <DeleteConfirmationModal
        {...deleteModal}
        size={ModalSize.MEDIUM}
        title={t('delete.contact.modal.title', {
          contact: `${contact.firstName} ${contact.lastName}`,
        })}
        onDecide={(decision) => {
          console.log(decision);
          if (decision === 'delete') {
            deleteContact.mutate(undefined, {
              onSuccess: () => router.push('/contacts'),
            });
          } else {
            deleteModal.close();
          }
        }}
      >
        {' '}
      </DeleteConfirmationModal>
    </>
  );
};
