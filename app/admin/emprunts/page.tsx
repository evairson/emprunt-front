'use client';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/constants';
import type { User } from '@/types/user';
import type { Emprunt, EmpruntStatus } from '@/types/emprunt';

const STATUS_LABEL: Record<EmpruntStatus, string> = {
  PENDING: 'En attente',
  APPROVED: 'Acceptée',
  REJECTED: 'Refusée',
};

const STATUS_STYLE: Record<EmpruntStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

const FILTERS: { value: 'ALL' | EmpruntStatus; label: string }[] = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Acceptées' },
  { value: 'REJECTED', label: 'Refusées' },
];

/** Historique admin de tous les emprunts, triés du plus récent au plus ancien, filtrables par statut. */
export default function AdminEmpruntsPage() {
  const [loading, setLoading] = useState(true);
  const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
  const [filter, setFilter] = useState<'ALL' | EmpruntStatus>('ALL');

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) { window.location.href = '/'; return null; }
        return res.json() as Promise<User>;
      })
      .then((data) => {
        if (data && data.role !== 'ADMIN') { window.location.href = '/dashboard'; return; }
        return fetch(`${API_URL}/emprunt`, { credentials: 'include' })
          .then((res) => res.json() as Promise<Emprunt[]>)
          .then(setEmprunts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8">Chargement...</p>;

  const sorted = [...emprunts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const filtered = filter === 'ALL' ? sorted : sorted.filter((e) => e.status === filter);

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
        <a href="/admin" className="text-xl font-bold flex items-center gap-2">
          ← Retour
        </a>
        <h1 className="text-xl font-bold">Historique des locations</h1>
        <span className="w-16" />
      </header>

      <main className="p-8 max-w-4xl mx-auto w-full">
        <div className="flex gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer ${
                filter === f.value
                  ? 'bg-indigo-900 text-white'
                  : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Aucune location.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                <th className="p-3 border border-gray-200 dark:border-gray-700">Cotisant</th>
                <th className="p-3 border border-gray-200 dark:border-gray-700">Matériel</th>
                <th className="p-3 border border-gray-200 dark:border-gray-700">Demandé le</th>
                <th className="p-3 border border-gray-200 dark:border-gray-700">Période</th>
                <th className="p-3 border border-gray-200 dark:border-gray-700">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="p-3 border border-gray-200 dark:border-gray-700">
                    {e.user?.name ?? e.userId}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-700">
                    {e.material?.name ?? e.materialId}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-700">
                    {new Date(e.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-700">
                    {new Date(e.startDate).toLocaleDateString('fr-FR')} → {new Date(e.endDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-700">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[e.status]}`}>
                      {STATUS_LABEL[e.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
