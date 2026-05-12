'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { API_URL } from '@/lib/constants';
import type { User } from '@/types/user';
import type { Material } from '@/types/material';

export default function AdminMaterialPage() {
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMaterials = () =>
    fetch(`${API_URL}/material`, { credentials: 'include' })
      .then((res) => res.json() as Promise<Material[]>)
      .then(setMaterials);

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) { window.location.href = '/'; return null; }
        return res.json() as Promise<User>;
      })
      .then((data) => {
        if (data && data.role !== 'ADMIN') { window.location.href = '/dashboard'; return; }
        return loadMaterials();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce matériel ?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/material/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      await loadMaterials();
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="p-8">Chargement...</p>;

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
        <a href="/admin" className="text-xl font-bold flex items-center gap-2">
          ← Retour
        </a>
        <h1 className="text-xl font-bold">Tout le matériel</h1>
        <a
          href="/admin/material/new"
          className="px-4 py-2 text-sm rounded-lg bg-indigo-900 text-white hover:bg-indigo-800 transition-colors"
        >
          + Ajouter
        </a>
      </header>

      <main className="p-8 max-w-4xl mx-auto w-full">
        {materials.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Aucun matériel pour l&apos;instant.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((m) => (
              <div
                key={m.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900 flex flex-col"
              >
                {m.photoUrl ? (
                  <Image src={m.photoUrl} alt={m.name} width={400} height={160} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                    Aucune photo
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{m.name}</h3>
                    <div className="flex gap-1 shrink-0">
                      <a
                        href={`/admin/material/${m.id}/edit`}
                        aria-label="Modifier"
                        title="Modifier"
                        className="p-1.5 rounded-md text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </a>
                      <button
                        onClick={() => handleDelete(m.id)}
                        disabled={deletingId === m.id}
                        aria-label="Supprimer"
                        title="Supprimer"
                        className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
