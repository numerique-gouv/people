'use client';
import Keycloak, { KeycloakConfig } from 'keycloak-js';

const keycloakConfig: KeycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOACK_URL,
  realm: process.env.NEXT_PUBLIC_KEYCLOACK_REALM || '',
  clientId: process.env.NEXT_PUBLIC_KEYCLOACK_CLIENT_ID || '',
};

export const initKeycloak = (onAuthSuccess: (_token?: string) => void) => {
  const keycloak = new Keycloak(keycloakConfig);
  keycloak
    .init({
      onLoad: 'login-required',
    })
    .catch(() => {
      new Error('Failed to initialize Keycloak.');
    });

  keycloak.onAuthSuccess = () => {
    onAuthSuccess(keycloak.token);
  };
};
