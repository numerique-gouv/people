import { useAuthStore } from '@/core/auth';

import { baseApiUrl } from './conf';

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
