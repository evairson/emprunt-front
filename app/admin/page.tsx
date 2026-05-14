'use client';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/constants';
import type { User } from '@/types/user';
import type { Emprunt } from '@/types/emprunt';
import Button from '@/components/button';

/** Dashboard admin : demandes en attente (accept/reject), locations en cours (retards en rouge, checkbox rendu), liens gestion matériel. */
export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const loadEmprunts = () =>
    fetch(`${API_URL}/emprunt`, { credentials: 'include' })
      .then((res) => res.json() as Promise<Emprunt[]>)
      .then(setEmprunts);

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) { window.location.href = '/'; return null; }
        return res.json() as Promise<User>;
      })
      .then((data) => {
        if (data) {
          setUser(data);
          if (data.role === 'ADMIN') return loadEmprunts();
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDecision = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      const res = await fetch(`${API_URL}/emprunt/${id}/${action}`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      await loadEmprunts();
    } catch {
      // ignore
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkReturned = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`${API_URL}/emprunt/${id}/return`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      await loadEmprunts();
    } catch {
      // ignore
    } finally {
      setProcessingId(null);
    }
  };

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

  const pending = emprunts.filter((e) => e.status === 'PENDING');
  const ongoing = emprunts
    .filter(
      (e) =>
        e.status === 'APPROVED' &&
        !e.returnedAt &&
        new Date(e.startDate).getTime() <= now,
    )
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Demandes d&apos;emprunt en attente</h2>
            <a href="/admin/emprunts" className="text-sm text-indigo-600 hover:underline">
              Voir l&apos;historique
            </a>
          </div>
          {pending.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Aucune demande en attente.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Cotisant</th>
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Matériel</th>
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Demandé le</th>
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Période</th>
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((e) => (
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDecision(e.id, 'approve')}
                          disabled={processingId === e.id}
                          className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleDecision(e.id, 'reject')}
                          disabled={processingId === e.id}
                          className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Refuser
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Locations en cours</h2>
          {ongoing.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Aucune location en cours.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Cotisant</th>
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Matériel</th>
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Période</th>
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Retour prévu</th>
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Rendu ?</th>
                </tr>
              </thead>
              <tbody>
                {ongoing.map((e) => {
                  const overdue = new Date(e.endDate).getTime() < now;
                  return (
                    <tr
                      key={e.id}
                      className={overdue ? 'bg-red-50 dark:bg-red-950/30' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}
                    >
                      <td className="p-3 border border-gray-200 dark:border-gray-700">
                        {e.user?.name ?? e.userId}
                      </td>
                      <td className="p-3 border border-gray-200 dark:border-gray-700">
                        {e.material?.name ?? e.materialId}
                      </td>
                      <td className="p-3 border border-gray-200 dark:border-gray-700">
                        {new Date(e.startDate).toLocaleDateString('fr-FR')} → {new Date(e.endDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          {new Date(e.endDate).toLocaleDateString('fr-FR')}
                          {overdue && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-200 text-red-800">
                              En retard
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 border border-gray-200 dark:border-gray-700">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleMarkReturned(e.id)}
                          disabled={processingId === e.id}
                          className="w-4 h-4 cursor-pointer"
                          title="Marquer comme rendu"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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
