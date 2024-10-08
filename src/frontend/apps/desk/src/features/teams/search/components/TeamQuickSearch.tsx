import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { QuickSearch, QuickSearchData } from '@/components/search/QuickSearch';
import { TeamListItem } from '@/components/teams/list/TeamListItem';
import { CreateNewTeamSearchShortcut } from '@/features/teams/search/components/CreateNewTeamSearchShortcut';
import {
  Team,
  TeamsOrdering,
  useTeams,
} from '@/features/teams/team-management';
import { Contact } from '@/types/contact';

type Props = {
  afterSelect?: () => void;
};
export const TeamQuickSearch = ({ afterSelect }: Props) => {
  const { t } = useTranslation('contact');
  const router = useRouter();
  const teams = useTeams({ ordering: TeamsOrdering.BY_CREATED_ON });

  const getDefaultData = (): QuickSearchData<Team>[] => {
    const data: Team[] = [];
    teams.data?.pages.forEach((result) => data.concat(result.results));
    return [
      {
        groupName: t('teams.search.my_groups.label'),
        elements: data,
        startActions: [
          {
            onSelect: () => {
              router.push('/contacts/create');
              afterSelect?.();
            },
            content: <CreateNewTeamSearchShortcut />,
          },
        ],
      },
    ];
  };
  const [data, setData] = useState<QuickSearchData<Team>[]>(getDefaultData());

  useEffect(() => {
    setData(getDefaultData());
  }, [teams.data]);

  const onFilter = (str: string) => {
    const result = getDefaultData();
    const myContacts = teams.data ?? [];

    if (str === '') {
      result[0].elements = result[0].elements.splice(0, 5);
      setData(result);
    } else {
      // const newMyContact = myContacts.filter((element) => {
      //   return (
      //     element..toLowerCase().indexOf(str.toLowerCase()) > -1 ||
      //     element.lastName.toLowerCase().indexOf(str.toLowerCase()) > -1
      //   );
      // });
      //
      // // const newOtherContact = other_contact.filter((element) => {
      // //   return element.toLowerCase().indexOf(str.toLowerCase()) > -1;
      // // });
      //
      // result[0].elements = newMyContact.splice(0, 5);

      setData(result);
    }
  };

  const onSelect = (contact: Contact) => {
    router.push(`/contacts/` + contact.id);
    afterSelect?.();
  };

  return (
    <QuickSearch
      data={data}
      onFilter={onFilter}
      onSelect={onSelect}
      renderElement={(team) => <TeamListItem team={team} />}
    />
  );
};
