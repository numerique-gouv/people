import { useAuthStore } from '@/features/';

export const fetchAPI = async (input: string, init?: RequestInit) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}${input}`;
  const { logout } = useAuthStore.getState();

  const response = await fetch(apiUrl, {
    ...init,
    credentials: 'include',
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json',
    },
  });

  // todo - handle 401, redirect to login screen
  // todo - please have a look to this documentation page https://mozilla-django-oidc.readthedocs.io/en/stable/xhr.html
  response.status === 401 && logout();

  return response;
};
