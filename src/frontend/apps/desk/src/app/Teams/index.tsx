import { Button, Field, Input, Loader } from '@openfun/cunningham-react';
import React, { useState } from 'react';

import { useCreateTeam } from './api/useCreateTeam';
import { useTeams } from './api/useTeams';

export const Teams = () => {
  const { data, isPending } = useTeams();
  const { mutate: createTeam } = useCreateTeam();
  const [teamName, setTeamName] = useState('');

  if (isPending) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Field>
        <Input
          type="text"
          label="Team name"
          onChange={(e) => setTeamName(e.target.value)}
        />
        <Button fullWidth onClick={() => createTeam(teamName)} className="mt-s">
          Create Team
        </Button>
      </Field>
      <section>
        <ul>
          {data?.results.map((post, index) => (
            <li key={post.id}>
              <div>
                <span>
                  {index + 1}. {post.name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};
