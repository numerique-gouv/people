import { APIError, errorCauses, fetchAPI } from '@/api';
import { UsersParams, UsersResponse } from '@/features/users/api/types';
import { removeEmpty } from '@/utils/object';

export class UserRepository {
  static async filter(params: UsersParams): Promise<UsersResponse> {
    const searchParams = new URLSearchParams(removeEmpty(params));
    const response = await fetchAPI(`users/?${searchParams.toString()}`);

    if (!response.ok) {
      throw new APIError(
        'Failed to get the users',
        await errorCauses(response),
      );
    }

    const result = await response.json();
    return result as UsersResponse;
  }
}
