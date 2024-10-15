import { checkStatus, fetchAPI } from '@/api';
import { UsersParams, UsersResponse } from '@/features/users/api/types';
import { removeEmpty } from '@/utils/object';

export class UserRepository {
  static async filter(params: UsersParams): Promise<UsersResponse> {
    const searchParams = new URLSearchParams(removeEmpty(params));
    return fetchAPI(`users/?${searchParams.toString()}`).then(
      checkStatus<UsersResponse>,
    );
  }
}
