'use client';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/constants';
import type { User } from '@/types/user';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<User>;
      })
      .then(setUser)
      .catch(() => {
        window.location.href = '/';
      });
  }, []);

  return (
    <>
    <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
      <h1 className="text-xl font-bold">Dashboard</h1>
      {user && (
        <div className="flex items-center gap-4">
          <a href="/admin" className="text-gray-700 dark:text-gray-300">
            Admin Panel
          </a>
        </div>
      )}
    </header>
    <main className="flex flex-1 items-center justify-center">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {user && <p className="mt-2 text-gray-600">{user.name}</p>}
      {user && <p className="mt-1 text-gray-600">{user.role}</p>}
    </main>
    </>
  );
}
