import { Button } from '@openfun/cunningham-react';
import { ReactElement } from 'react';

import { Card } from '@/components';
import { ContactLayout } from '@/components/contacts/layout/ContactLayout';
import { SimpleLoader } from '@/components/loader/SimpleLoader';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return (
    <Card style={{ width: '550px', background: 'white', height: '300px' }}>
      <Button
        color="primary"
        disabled={false}
        icon={<SimpleLoader size="small" />}
      >
        coucou
      </Button>
    </Card>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <ContactLayout>{page}</ContactLayout>;
};

export default Page;
