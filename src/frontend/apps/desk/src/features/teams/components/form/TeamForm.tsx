import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Card } from '@/components';
import { CardHeaderFormSection } from '@/components/cards/CardHeaderFormSection';
import { CardSection } from '@/components/cards/CardSection';
import { RHFInput } from '@/components/form/hook-form/RHFInput';
import { RHFProvider } from '@/components/form/hook-form/RHFProvider';
import { RHFTextArea } from '@/components/form/hook-form/RHFTextArea';
import { useCreateTeam, useUpdateTeam } from '@/features/teams/api/useTeamApi';
import { Team } from '@/features/teams/types';

export type TeamFormValues = {
  name: string;
  description?: string;
};

type Props = {
  team?: Team;
};

export const TeamForm = ({ team }: Props) => {
  const { t } = useTranslation('team');
  const router = useRouter();

  const { mutate: updateTeam, isPending: isPendingUpdate } = useUpdateTeam();
  const { mutate: createTeam, isPending } = useCreateTeam();

  const schema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  });

  const methods = useForm<TeamFormValues>({
    delayError: 0,
    defaultValues: {
      name: team?.name ?? '',
      description: '',
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: TeamFormValues) => {
    if (team) {
      updateTeam({ id: team.id, name: values.name });
    } else {
      createTeam(
        { name: values.name },
        { onSuccess: (team) => router.push(`/teams/${team.id}`) },
      );
    }
  };

  return (
    <Card>
      <RHFProvider showSubmit={false} methods={methods} id="team-form">
        <CardHeaderFormSection
          sticky={true}
          isLoading={isPending || isPendingUpdate}
          formId="team-form"
          title="Ajouter"
          onSubmit={methods.handleSubmit(onSubmit)}
          onCancel={() => router.back()}
        />
        <CardSection>
          <RHFInput name="name" label={t('teams.form.name.label')} fullWidth />
          <RHFTextArea
            rows={5}
            name="description"
            label={t('teams.form.description.label')}
            fullWidth
          />
        </CardSection>
      </RHFProvider>
    </Card>
  );
};
