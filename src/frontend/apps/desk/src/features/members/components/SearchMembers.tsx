import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Options } from 'react-select';
import AsyncSelect from 'react-select/async';

import { User } from '@/features/auth';
import { Team } from '@/features/teams';

import { KEY_LIST_USER, useUsers } from '../api/useUsers';

const isValidEmail = (email: string) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );
};

export interface OptionInvitation {
  value: { email: string };
  label: string;
  type: 'invitation';
}

export interface OptionNewMember {
  value: User;
  label: string;
  type: 'new_member';
}

export type OptionSelect = Options<OptionNewMember | OptionInvitation>;

interface SearchMembersProps {
  team: Team;
  setSelectedMembers: (value: OptionSelect) => void;
}

export const SearchMembers = ({
  team,
  setSelectedMembers,
}: SearchMembersProps) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const resolveOptionsRef = useRef<((value: OptionSelect) => void) | null>(
    null,
  );
  const { data } = useUsers(
    { query: userQuery },
    {
      enabled: !!userQuery,
      queryKey: [KEY_LIST_USER, { query: userQuery }],
    },
  );

  const options = data?.results;

  useEffect(() => {
    if (resolveOptionsRef.current && options) {
      let users: OptionSelect = options.map((user) => ({
        value: user,
        label: user.name || '',
        type: 'new_member',
      }));

      if (userQuery && isValidEmail(userQuery)) {
        const isFound = !!options.find(
          (user) => user.email === userQuery || user.name === userQuery,
        );

        if (!isFound) {
          users = [
            {
              value: { email: userQuery },
              label: userQuery,
              type: 'invitation',
            },
          ];
        }
      }

      resolveOptionsRef.current(users);
      resolveOptionsRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const loadOptions = (): Promise<OptionSelect> => {
    return new Promise<OptionSelect>((resolve) => {
      resolveOptionsRef.current = resolve;
    });
  };

  const timeout = useRef<NodeJS.Timeout | null>(null);
  const onInputChangeHandle = useCallback((newValue: string) => {
    setInput(newValue);
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(() => {
      setUserQuery(newValue);
    }, 1000);
  }, []);

  return (
    <AsyncSelect
      isMulti
      loadOptions={loadOptions}
      defaultOptions={[]}
      onInputChange={onInputChangeHandle}
      inputValue={input}
      placeholder={t('Search new members (name or email)')}
      noOptionsMessage={() =>
        t('Invite new members to {{teamName}}', { teamName: team.name })
      }
      onChange={(value) => {
        setSelectedMembers(value);
      }}
    />
  );
};
