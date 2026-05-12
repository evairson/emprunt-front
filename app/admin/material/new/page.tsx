'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/constants';
import type { User } from '@/types/user';
import Button from '@/components/button';

export default function NewMaterialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) { window.location.href = '/'; return null; }
        return res.json() as Promise<User>;
      })
      .then((data) => {
        if (data && data.role !== 'ADMIN') window.location.href = '/dashboard';
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/material`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          photoUrl: photoUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error('Échec de la création du matériel');
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-8">Chargement...</p>;

  return (
    <>
      <header className="flex items-center p-4 bg-gray-100 dark:bg-gray-800">
        <a href="/admin" className="text-xl font-bold flex items-center gap-2">
          ← Retour
        </a>
      </header>

      <main className="p-8 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Nouveau matériel</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nom de l'objet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900"
          />
          <input
            type="url"
            placeholder="URL de la photo (optionnel)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900"
          />
          <Button disabled={submitting}>
            {submitting ? 'Création...' : 'Créer'}
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </main>
    </>
  );
}
