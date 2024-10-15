import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { QuickSearch, QuickSearchData } from '@/components/search/QuickSearch';
import { TeamsOrdering } from '@/features/teams/api/types';
import { useTeams } from '@/features/teams/api/useTeamApi';
import { TeamListItem } from '@/features/teams/components/list/TeamListItem';
import { CreateNewTeamSearchShortcut } from '@/features/teams/components/search/CreateNewTeamSearchShortcut';
import { Team } from '@/features/teams/types';

type Props = {
  afterSelect?: () => void;
};
export const TeamQuickSearch = ({ afterSelect }: Props) => {
  const { t } = useTranslation('team');
  const router = useRouter();
  const teams = useTeams({ ordering: TeamsOrdering.BY_CREATED_ON });

  const getDefaultData = (): QuickSearchData<Team>[] => {
    let data: Team[] = [];
    teams.data?.pages.forEach((result) => {
      data = data.concat(result.results);
    });

    return [
      {
        groupName: t('teams.search.my_groups.label'),
        elements: data,
        startActions: [
          {
            onSelect: () => {
              router.push('/teams/create');
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
    const myTeams = [...result[0].elements];

    if (str === '') {
      setData(result);
    } else {
      result[0].elements = myTeams.filter((element) => {
        return element.name.toLowerCase().indexOf(str.toLowerCase()) > 0;
      });

      setData(result);
    }
  };

  const onSelect = (team: Team) => {
    router.push(`/teams/` + team.id);
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
