'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { API_URL, photoSrc } from '@/lib/constants';
import type { User } from '@/types/user';
import type { Material } from '@/types/material';
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

/** Dashboard cotisant : locations en cours/à venir, matériel disponible, historique de ses demandes. */
export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<User>;
      })
      .then(setUser)
      .catch(() => { window.location.href = '/'; });

    fetch(`${API_URL}/material`, { credentials: 'include' })
      .then((res) => res.json() as Promise<Material[]>)
      .then(setMaterials)
      .catch(() => {});

    fetch(`${API_URL}/emprunt/mine`, { credentials: 'include' })
      .then((res) => res.json() as Promise<Emprunt[]>)
      .then(setEmprunts)
      .catch(() => {});
  }, []);

  const ongoing = emprunts.filter(
    (e) =>
      e.status === 'APPROVED' &&
      new Date(e.startDate).getTime() <= now &&
      new Date(e.endDate).getTime() >= now,
  );
  const upcoming = emprunts.filter(
    (e) => e.status === 'APPROVED' && new Date(e.startDate).getTime() > now,
  );

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
        <a href="/dashboard" className="flex items-center gap-3">
          <Image src="/logo.png" alt="BDS" width={48} height={48} className="h-12 w-auto" />
          <span className="text-xl font-bold hidden sm:inline">Emprunt de matériel</span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/admin" className="hover:underline font-medium">Panel Admin</a>
          <button
            onClick={async () => {
              await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
              window.location.href = '/';
            }}
            className="text-sm text-red-600 hover:underline cursor-pointer"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="p-8 flex flex-col gap-10">
        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Mes locations en cours et à venir
          </h2>
          {ongoing.length === 0 && upcoming.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Aucune location en cours ou prévue.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ongoing.map((e) => (
                <div
                  key={e.id}
                  className="border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                      {e.material?.name ?? e.materialId}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-200 text-green-800 shrink-0">
                      En cours
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Jusqu&apos;au {new Date(e.endDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
              {upcoming.map((e) => (
                <div
                  key={e.id}
                  className="border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                      {e.material?.name ?? e.materialId}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-200 text-blue-800 shrink-0">
                      À venir
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Du {new Date(e.startDate).toLocaleDateString('fr-FR')} au {new Date(e.endDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-300">
            Matériel disponible à l&apos;emprunt
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900"
              >
                {photoSrc(item.photoUrl) ? (
                  <Image src={photoSrc(item.photoUrl)!} alt={item.name} width={400} height={160} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                    Aucune photo
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{item.description}</p>
                  <a
                    href={`/dashboard/emprunt/${item.id}`}
                    className="block w-full text-center py-2 text-sm rounded-lg bg-indigo-900 text-white hover:bg-indigo-800 transition-colors cursor-pointer"
                  >
                    Emprunter
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Mes demandes d&apos;emprunt
          </h2>
          {emprunts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Aucune demande pour l&apos;instant.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Matériel</th>
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Demandé le</th>
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Période</th>
                  <th className="p-3 border border-gray-200 dark:border-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {emprunts.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
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
        </section>
      </main>
    </>
  );
}
