/**
 * Represents user retrieved from the API.
 * @interface User
 * @property {string} id - The id of the user.
 * @property {string} email - The email of the user.
 * @property {string} name - The name of the user.
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  abilities?: {
    mailboxes: UserAbilities;
    contacts: UserAbilities;
    teams: UserAbilities;
  };
}

export type UserAbilities = {
  can_view?: boolean;
  can_create?: boolean;
};
