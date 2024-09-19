import { useRouter } from 'next/navigation';
import * as React from 'react';

type Props = {};
export const CreateNewContactSearchShortcut = (props: Props) => {
  const router = useRouter();
  return (
    <div
      role="none"
      className="flex-v-center"
      onClick={() => router.push('/contacts/create')}
    >
      <span className="material-icons ">add</span>
      <span className="ml-st">Créer un nouveau contact</span>
    </div>
  );
};
