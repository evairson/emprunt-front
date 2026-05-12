'use client';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/constants';
import type { User } from '@/types/user';
import Button from '@/components/button';

interface EmpruntRequest {
  id: string;
  userName: string;
  materialName: string;
  requestedAt: string;
  status: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';
}

const MOCK_REQUESTS: EmpruntRequest[] = [
  { id: '1', userName: 'Alice Martin', materialName: 'Tente 4 places', requestedAt: '2026-05-10', status: 'EN_ATTENTE' },
  { id: '2', userName: 'Bob Dupont', materialName: 'Kayak', requestedAt: '2026-05-09', status: 'ACCEPTE' },
  { id: '3', userName: 'Chloé Bernard', materialName: 'Ballon de foot', requestedAt: '2026-05-08', status: 'REFUSE' },
];

const STATUS_STYLE: Record<EmpruntRequest['status'], string> = {
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
  ACCEPTE: 'bg-green-100 text-green-700',
  REFUSE: 'bg-red-100 text-red-600',
};

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
      .then((data) => {
        if (data) setUser(data);
      })
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
          <a href="/dashboard" className="text-xl font-bold flex items-center gap-2">
            ← Retour
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
    <>
      <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
        <a href="/dashboard" className="text-xl font-bold flex items-center gap-2">
          ← Retour
        </a>
        <h1 className="text-xl font-bold">Espace administrateur</h1>
        <span className="w-16" />
      </header>

      <main className="p-8 flex flex-col gap-10 max-w-4xl mx-auto w-full">
        <section>
          <h2 className="text-lg font-semibold mb-4">Demandes d&apos;emprunt</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                <th className="p-3 border border-gray-200 dark:border-gray-700">Cotisant</th>
                <th className="p-3 border border-gray-200 dark:border-gray-700">Matériel</th>
                <th className="p-3 border border-gray-200 dark:border-gray-700">Date</th>
                <th className="p-3 border border-gray-200 dark:border-gray-700">Statut</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_REQUESTS.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="p-3 border border-gray-200 dark:border-gray-700">{req.userName}</td>
                  <td className="p-3 border border-gray-200 dark:border-gray-700">{req.materialName}</td>
                  <td className="p-3 border border-gray-200 dark:border-gray-700">{req.requestedAt}</td>
                  <td className="p-3 border border-gray-200 dark:border-gray-700">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[req.status]}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Matériel</h2>
          <div className="flex gap-3">
            <a
              href="/admin/material"
              className="inline-block px-4 py-2 text-sm rounded-lg bg-indigo-900 text-white hover:bg-indigo-800 transition-colors"
            >
              Voir l&apos;ensemble du matériel
            </a>
            <a
              href="/admin/material/new"
              className="inline-block px-4 py-2 text-sm rounded-lg border border-indigo-900 text-indigo-900 dark:text-indigo-300 dark:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
            >
              + Ajouter du matériel
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
