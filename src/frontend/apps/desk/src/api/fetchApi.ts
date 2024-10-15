import { useAuthStore } from '@/core/auth';

import { baseApiUrl } from './conf';

interface CheckStatusOptions {
  fallbackValue: unknown;
  ignoredErrorStatus: number[];
}

/**
 * Retrieves the CSRF token from the document's cookies.
 *
 * @returns {string|null} The CSRF token if found in the cookies, or null if not present.
 */
function getCSRFToken() {
  return document.cookie
    .split(';')
    .filter((cookie) => cookie.trim().startsWith('csrftoken='))
    .map((cookie) => cookie.split('=')[1])
    .pop();
}

export const fetchAPI = async (
  input: string,
  init?: RequestInit,
  apiVersion = '1.0',
) => {
  const apiUrl = `${baseApiUrl(apiVersion)}${input}`;

  const csrfToken = getCSRFToken();

  const response = await fetch(apiUrl, {
    ...init,
    credentials: 'include',
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json',
      ...(csrfToken && { 'X-CSRFToken': csrfToken }),
    },
  });

  if (response.status === 401) {
    const { logout } = useAuthStore.getState();
    logout();
  }

  return response;
};

export async function checkStatus<T>(
  response: Response,
  options: CheckStatusOptions = { fallbackValue: null, ignoredErrorStatus: [] },
): Promise<T> {
  if (response.ok) {
    if (response.headers.get('Content-Type') === 'application/json') {
      return response.json() as Promise<T>;
    }
    if (response.headers.get('Content-Type') === 'application/pdf') {
      return response.blob() as Promise<T>;
    }
    return response.text() as Promise<T>;
  }

  if (options.ignoredErrorStatus.includes(response.status)) {
    return Promise.resolve(options.fallbackValue) as Promise<T>;
  }

  const data: T = (await response.json()) as T;

  throw new HttpError(response.status, response.statusText, data);
}

export class HttpError extends Error {
  code: number;
  data: unknown;

  constructor(status: number, statusText: string, data: unknown) {
    super(statusText);
    this.code = status;
    this.data = data;
  }
}
