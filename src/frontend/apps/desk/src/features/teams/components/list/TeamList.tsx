import { Loader } from '@openfun/cunningham-react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { StyledLink } from '@/components';
import { InfiniteScroll } from '@/components/InfiniteScroll';
import { FocusOnContent } from '@/components/layouts/responsive/FocusOnContent';
import { ListSearchHeader } from '@/components/search/list/ListSearchHeader';
import { TeamsOrdering } from '@/features/teams/api/types';
import { useTeams } from '@/features/teams/api/useTeamApi';
import { TeamListItem } from '@/features/teams/components/list/TeamListItem';
import { TeamQuickSearch } from '@/features/teams/components/search/TeamQuickSearch';

import styles from './contact-list.module.scss';

type Props = {};
export const TeamList = (props: Props) => {
  const { t } = useTranslation();
  const {
    query: { id },
  } = useRouter();
  const {
    data,
    isError,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTeams({ ordering: TeamsOrdering.BY_CREATED_ON });

  const containerRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={styles.listContainer} ref={containerRef}>
      <ListSearchHeader
        title={t('teams.title', { ns: 'team' })}
        quickSearchComponent={(closeModal) => (
          <TeamQuickSearch afterSelect={closeModal} />
        )}
      />
      <InfiniteScroll
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage}
        next={() => {
          void fetchNextPage();
        }}
        scrollContainer={containerRef.current}
        className={styles.infiniteScroll}
        as="ul"
        role="listbox"
      >
        <p className="fs-h6 clr-primary-500 fw-bold pl-s">
          {t('teams.list.title', { ns: 'team' })}
        </p>
        {data?.pages.map((teamPage) => {
          return teamPage.results.map((team) => {
            const isActive = id === team.id;
            return (
              <FocusOnContent key={team.id}>
                <StyledLink $css="width: 100%" href={`/teams/${team.id}`}>
                  <TeamListItem key={team.id} team={team} isActive={isActive} />
                </StyledLink>
              </FocusOnContent>
            );
          });
        })}
      </InfiniteScroll>
    </div>
  );
};
