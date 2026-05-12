'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { API_URL } from '@/lib/constants';
import type { User } from '@/types/user';
import type { Material } from '@/types/material';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);

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
  }, []);

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
        <h1 className="text-xl font-bold">BDS — Emprunt de matériel</h1>

        <a href="/admin" className="hover:underline font-medium">Panel Admin</a>

      </header>

      <main className="p-8">
        <h2 className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-300">
          Matériel disponible à l&apos;emprunt
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900"
            >
              {item.photoUrl ? (
                <Image src={item.photoUrl} alt={item.name} width={400} height={160} className="w-full h-40 object-cover" />
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
      </main>
    </>
  );
}
