'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { API_URL } from '@/lib/constants';
import Button from '@/components/button';

/** Page d'accueil — login Rezel. Redirige vers /dashboard si déjà connecté. */
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (res.ok) {
          window.location.href = '/dashboard';
          return;
        }
        setCheckingAuth(false);
      })
      .catch(() => setCheckingAuth(false));
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');

      const { data, error: apiError } = await api.GET('/auth/login');

      if (apiError || !data?.url) {
        throw new Error('Impossible de récupérer l\'URL de connexion');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred during login',
      );
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return <div className="flex flex-1 items-center justify-center" />;
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-16 bg-white dark:bg-black">
        <img src="/logo.png" alt="Logo" className="w-48 h-auto mb-8" />
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-gray-200">
          Bienvenue sur le système d'emprunt du matériel du BDS de la liste Totally Sport!
        </h1>
        <Button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Connexion en cours...' : 'Se connecter avec Rezel'}
        </Button>
        {error && (
          <p className="mt-4 text-red-500 text-center">
            {error}
          </p>
        )}
      </main>
    </div>
  );
}
