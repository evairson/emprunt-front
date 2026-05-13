'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DayPicker, type DateRange } from 'react-day-picker';
import { fr } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { API_URL } from '@/lib/constants';
import type { Material } from '@/types/material';
import Button from '@/components/button';

interface Booking {
  startDate: string;
  endDate: string;
}

export default function EmpruntRequestPage() {
  const router = useRouter();
  const params = useParams<{ materialId: string }>();
  const materialId = params.materialId;

  const [material, setMaterial] = useState<Material | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/material/${materialId}`, { credentials: 'include' }).then(
        (res) => {
          if (res.status === 401) { window.location.href = '/'; throw new Error('unauth'); }
          if (!res.ok) throw new Error('not found');
          return res.json() as Promise<Material>;
        },
      ),
      fetch(`${API_URL}/emprunt/blocked/${materialId}`, { credentials: 'include' })
        .then((res) => (res.ok ? (res.json() as Promise<Booking[]>) : []))
        .catch(() => []),
    ])
      .then(([m, b]) => {
        setMaterial(m);
        setBookings(b);
      })
      .catch((err) => {
        if (err.message !== 'unauth') setError('Matériel introuvable');
      })
      .finally(() => setLoading(false));
  }, [materialId]);

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const disabledRanges = bookings.map((b) => ({
    from: startOfDay(new Date(b.startDate)),
    to: startOfDay(new Date(b.endDate)),
  }));

  const today = startOfDay(new Date());
  const nextAvailable = (() => {
    const active = disabledRanges.filter((r) => r.to >= today && r.from <= today);
    if (active.length === 0) return null;
    const latestEnd = new Date(Math.max(...active.map((r) => r.to.getTime())));
    return new Date(latestEnd.getTime() + 24 * 60 * 60 * 1000);
  })();

  const rangeOverlapsBlocked = (from: Date, to: Date) =>
    disabledRanges.some((r) => from <= r.to && to >= r.from);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!range?.from) {
      setError('Sélectionnez une période');
      return;
    }
    const from = range.from;
    const to = range.to ?? range.from;
    if (from > to) {
      setError('La date de fin doit être après la date de début');
      return;
    }
    if (rangeOverlapsBlocked(from, to)) {
      setError('La période sélectionnée chevauche un emprunt existant');
      return;
    }
    setSubmitting(true);
    const startDate = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0);
    const endDate = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59);
    try {
      const res = await fetch(`${API_URL}/emprunt`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? 'Échec de la demande d\'emprunt');
      }
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
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {material.name} — {material.description}
          </p>
        )}
        {nextAvailable && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 text-sm">
            Cet objet est actuellement emprunté. Disponible à partir du{' '}
            <strong>{nextAvailable.toLocaleDateString('fr-FR')}</strong>.
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 flex justify-center">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              disabled={[{ before: today }, ...disabledRanges]}
              modifiers={{ booked: disabledRanges }}
              locale={fr}
              showOutsideDays
              modifiersClassNames={{
                disabled: 'opacity-40',
                booked: 'line-through !text-red-600 !bg-red-50 dark:!bg-red-950/40',
              }}
            />
          </div>
          {range?.from && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {!range.to || range.from.getTime() === range.to.getTime() ? (
                <>Le <strong>{range.from.toLocaleDateString('fr-FR')}</strong></>
              ) : (
                <>
                  Du <strong>{range.from.toLocaleDateString('fr-FR')}</strong> au{' '}
                  <strong>{range.to.toLocaleDateString('fr-FR')}</strong>
                </>
              )}
            </p>
          )}
          <Button disabled={submitting}>
            {submitting ? 'Envoi...' : 'Envoyer la demande'}
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </main>
    </>
  );
}
