import { Button, ModalProps, ModalSize } from '@openfun/cunningham-react';
import { Command } from 'cmdk';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';

import { Modal } from '@/components/Modal';
import {
  DropdownMenu,
  DropdownMenuOption,
} from '@/components/dropdown-menu/DropdownMenu';
import { People } from '@/components/people/People';
import { QuickSearch, QuickSearchData } from '@/components/search/QuickSearch';
import { User } from '@/core/auth';
import { UsersParams } from '@/features/users/api/types';
import { useSearchUser } from '@/features/users/api/useUsersHooks';
import { SelectedUserItem } from '@/features/users/components/invite/SelectedUserItem';
import { Breakpoints, useBreakpoint } from '@/hooks/useBreakpoints';
import { NonEmptyArray } from '@/types/array';
import { OptionRole } from '@/types/roles';

import style from './user-invite-modal.module.scss';

export type UserInviteModalProps<T> = ModalProps & {
  onSubmit?: (users: User[], role: T) => void;
  roles: NonEmptyArray<OptionRole<T>>;
  defaultParams?: UsersParams;
  headerTitle?: string;
};

export const UserInviteModal = <T,>({
  onSubmit,
  roles,
  defaultParams,
  headerTitle,
  ...props
}: UserInviteModalProps<T>) => {
  const { t } = useTranslation();
  const isMobile = useBreakpoint(Breakpoints.LG, false);
  const ref = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<OptionRole<T>>(roles[0]);
  const [isDropOpen, setIsDropOpen] = useState(false);

  const usersQuery = useSearchUser({
    ...(defaultParams ?? {}),
    q: searchValue,
  });

  const data: QuickSearchData<User>[] = [
    {
      groupName: 'users',
      elements:
        usersQuery.data?.results.filter(
          (user) =>
            selectedUsers.findIndex(
              (selectedUser) => user.id === selectedUser.id,
            ) === -1,
        ) ?? [],
    },
  ];

  const onSelect = (newUser: User) => {
    setSelectedUsers((prev) => {
      const isAlready = prev.findIndex((user) => user.id === newUser.id) > -1;
      if (isAlready) {
        return prev;
      }
      const newArray = [...prev];
      newArray.push(newUser);
      return newArray;
    });
    setSearchValue('');
    setInputValue('');
    ref?.current?.focus();
  };

  const onSearch = useDebouncedCallback(
    (value: string) => setSearchValue(value),
    500,
  );

  const onFilter = (str: string) => {
    setInputValue(str);
    onSearch(str);
  };

  const onDeleteSelectedUser = (index: number) => {
    const newSelectedUsers = [...selectedUsers];
    newSelectedUsers.splice(index, 1);
    setSelectedUsers(newSelectedUsers);
  };

  const rolesOptions: DropdownMenuOption[] = roles.map((role) => {
    return { label: role.label, callback: () => setSelectedRole(role) };
  });

  useEffect(() => {
    if (props.isOpen) {
      return;
    }

    setSelectedRole(roles[0]);
    setSelectedUsers([]);
    setSearchValue('');
    setInputValue('');
  }, [props.isOpen]);

  return (
    <Modal
      {...props}
      closeOnClickOutside={true}
      hideCloseButton={false}
      size={isMobile ? ModalSize.EXTRA_LARGE : ModalSize.MEDIUM}
    >
      <QuickSearch
        inputContent={
          <>
            {headerTitle && (
              <div className={style.headerTitle}>{headerTitle}</div>
            )}
            {selectedUsers.length > 0 && (
              <div className={style.selectedItemsContainer}>
                {selectedUsers.map((user, index) => (
                  <SelectedUserItem
                    key={user.id}
                    user={user}
                    onDelete={() => onDeleteSelectedUser(index)}
                  />
                ))}
              </div>
            )}

            <div className={style.inputContainer}>
              <Command.Input
                className={style.input}
                ref={ref}
                value={inputValue}
                /* eslint-disable-next-line jsx-a11y/no-autofocus */
                autoFocus={true}
                placeholder={t('Search')}
                onValueChange={onFilter}
              />
              <div className="flex p-s">
                <DropdownMenu
                  isOpen={isDropOpen}
                  showArrow={true}
                  onOpenChange={(isOpen) => setIsDropOpen(isOpen)}
                  options={rolesOptions}
                >
                  <span className="fs-h6 clr-primary-500">
                    {selectedRole?.label ?? 'roles'}
                  </span>
                </DropdownMenu>

                <Button
                  onClick={() => onSubmit?.(selectedUsers, selectedRole.value)}
                  disabled={selectedUsers.length === 0}
                  size="small"
                >
                  {t('Validate')}
                </Button>
              </div>
            </div>
          </>
        }
        data={data}
        onSelect={onSelect}
        renderElement={(user) => <People fullName={user.name ?? user.email} />}
      />
    </Modal>
  );
};
