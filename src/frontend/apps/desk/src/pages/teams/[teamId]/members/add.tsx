import React from 'react';

import { ModalAddMembers } from '@/features/members/components/ModalAddMembers';
import { NextPageWithLayout } from '@/types/next';

import { TeamDetailLayout } from '..';

const Page: NextPageWithLayout = () => {
  return null;
};

Page.getLayout = function getLayout() {
  return (
    <TeamDetailLayout>
      {(team, currentRole) => (
        <ModalAddMembers team={team} currentRole={currentRole} />
      )}
    </TeamDetailLayout>
  );
};

export default Page;
