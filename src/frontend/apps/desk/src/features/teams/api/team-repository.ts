import { checkStatus, fetchAPI } from '@/api';
import {
  DTOTeam,
  DTOTeamAccess,
  DTOUpdateTeamAccess,
  TeamAccessesResponse,
  TeamAccessesSearchParams,
  TeamsParams,
  TeamsResponse,
} from '@/features/teams/api/types';
import { Team, TeamAccess } from '@/features/teams/types';
import { removeEmpty } from '@/utils/object';

export class TeamRepository {
  static async get(id: string): Promise<Team> {
    return fetchAPI(`teams/${id}/`, {}).then(checkStatus<Team>);
  }

  static async paginate(params: TeamsParams): Promise<TeamsResponse> {
    const newParams: TeamsParams = { ...params, page: params.page ?? 1 };
    const searchParams = new URLSearchParams(removeEmpty(newParams));
    return fetchAPI(`teams/?${searchParams.toString()}`, {}).then(
      checkStatus<TeamsResponse>,
    );
  }

  static async create(payload: DTOTeam): Promise<Team> {
    return fetchAPI(`teams/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(checkStatus<Team>);
  }

  static async update(teamId: string, payload: DTOTeam): Promise<Team> {
    return fetchAPI(`teams/${teamId}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }).then(checkStatus<Team>);
  }

  static async remove(teamId: string): Promise<void> {
    return fetchAPI(`teams/${teamId}/`, {
      method: 'DELETE',
    }).then(checkStatus<void>);
  }

  static async getAccesses(
    teamId: string,
    params: TeamAccessesSearchParams,
  ): Promise<TeamAccessesResponse> {
    const searchParams = new URLSearchParams(removeEmpty(params));
    return fetchAPI(
      `teams/${teamId}/accesses/?${searchParams.toString()}`,
      {},
    ).then(checkStatus<TeamAccessesResponse>);
  }

  static async addAccess(
    teamId: string,
    payload: DTOTeamAccess,
  ): Promise<TeamAccess> {
    return fetchAPI(`teams/${teamId}/accesses/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(checkStatus<TeamAccess>);
  }

  static async updateAccess(
    teamId: string,
    accessId: string,
    payload: DTOUpdateTeamAccess,
  ): Promise<TeamAccess> {
    return fetchAPI(`teams/${teamId}/accesses/${accessId}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }).then(checkStatus<TeamAccess>);
  }

  static async removeAccess(teamId: string, accessId: string): Promise<void> {
    return fetchAPI(`teams/${teamId}/accesses/${accessId}/`, {
      method: 'DELETE',
    }).then(checkStatus<void>);
  }
}
