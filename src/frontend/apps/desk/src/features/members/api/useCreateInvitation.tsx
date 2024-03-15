import { useMutation } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';
import { User } from '@/features/auth';
import { Team } from '@/features/teams';

import { Invitation, Role } from '../types';

interface CreateInvitationParams {
  email: User['email'];
  role: Role;
  teamId: Team['id'];
}

export const createInvitation = async ({
  email,
  role,
  teamId,
}: CreateInvitationParams): Promise<Invitation> => {
  const response = await fetchAPI(`teams/${teamId}/invitations/`, {
    method: 'POST',
    body: JSON.stringify({
      email,
      role,
    }),
  });

  if (!response.ok) {
    throw new APIError(
      `Failed to create the invitation for ${email}`,
      await errorCauses(response),
    );
  }

  return response.json() as Promise<Invitation>;
};

export function useCreateInvitation() {
  return useMutation<Invitation, APIError, CreateInvitationParams>({
    mutationFn: createInvitation,
  });
}
