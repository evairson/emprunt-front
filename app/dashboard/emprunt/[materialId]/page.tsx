'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_URL } from '@/lib/constants';
import type { Material } from '@/types/material';
import Button from '@/components/button';

export default function EmpruntRequestPage() {
  const router = useRouter();
  const params = useParams<{ materialId: string }>();
  const materialId = params.materialId;

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/material/${materialId}`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) { window.location.href = '/'; return null; }
        if (!res.ok) throw new Error();
        return res.json() as Promise<Material>;
      })
      .then((m) => { if (m) setMaterial(m); })
      .catch(() => setError('Matériel introuvable'))
      .finally(() => setLoading(false));
  }, [materialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (new Date(startDate) >= new Date(endDate)) {
      setError('La date de fin doit être après la date de début');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/emprunt`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId, startDate, endDate }),
      });
      if (!res.ok) throw new Error('Échec de la demande d\'emprunt');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-8">Chargement...</p>;

  return (
    <>
      <header className="flex items-center p-4 bg-gray-100 dark:bg-gray-800">
        <a href="/dashboard" className="text-xl font-bold flex items-center gap-2">
          ← Retour
        </a>
      </header>

      <main className="p-8 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold mb-2">Demande d&apos;emprunt</h1>
        {material && (
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {material.name} — {material.description}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Date de début
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Date de fin
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900"
            />
          </label>
          <Button disabled={submitting}>
            {submitting ? 'Envoi...' : 'Envoyer la demande'}
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </main>
    </>
  );
}
