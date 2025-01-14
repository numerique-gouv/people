import { useRouter } from 'next/router';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { fetchAPI } from '@/api';
import { LoginForm, LoginLayout } from '@/features/login';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { next } = router.query;

  // Get the next URL from the query string
  // and redirect to it after successful login

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    fetchAPI('login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Important for session cookie
    })
      .then((res) => {
        if (!res.ok) {
          setError(t('Login failed. Please try again.'));
        } else {
          if (next) {
            window.location.href = next as string;
          } else {
            window.location.href = '/authorize/';
          }
        }
      })
      .catch(() => {
        setError(t('Login failed. Please try again.'));
      });
  };

  return (
    <LoginForm
      title={t('Sign in')}
      labelEmail={t('Email')}
      labelPassword={t('Password')}
      labelSignIn={t('Sign in')}
      setEmail={setEmail}
      setPassword={setPassword}
      error={error}
      handleSubmit={handleSubmit}
    />
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <LoginLayout>{page}</LoginLayout>;
};

export default Page;
