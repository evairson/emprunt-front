'use client';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/constants';
import type { User } from '@/types/user';
import Button from '@/components/button';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) { window.location.href = '/'; return null; }
        return res.json() as Promise<User>;
      })
      .then((data) => { if (data) setUser(data); })
      .finally(() => setLoading(false));
  }, []);

  const handleMakeAdmin = async () => {
    if (!user) return;
    setPromoting(true);
    await fetch(`${API_URL}/users/${user.id}/admin`, {
      method: 'PATCH',
      credentials: 'include',
    });
    window.location.reload();
  };

  if (loading) return <p className="p-8">Chargement...</p>;

  if (user?.role !== 'ADMIN') {
    return (
    <>
    <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
        <a href="/dashboard" className="text-xl font-bold">
          Retour
        </a>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-semibold">Accès refusé — vous n&apos;êtes pas administrateur.</p>
        <Button onClick={handleMakeAdmin} disabled={promoting}>
          {promoting ? 'En cours...' : 'Devenir administrateur'}
        </Button>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Note : Ce bouton est uniquement pour pouvoir tester les fonctionnalités administrateur. <br />
           En conditions normales, les rôles sont gérés par la base de données et ne peuvent pas être modifiés par les utilisateurs.
        </p>
      </main>
      </>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center">
      <h1 className="text-2xl font-bold">Page administrateur</h1>
    </main>
  );
}
