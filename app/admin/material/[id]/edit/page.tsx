'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { API_URL, MAX_PHOTO_SIZE, photoSrc } from '@/lib/constants';
import type { User } from '@/types/user';
import type { Material } from '@/types/material';
import Button from '@/components/button';

/** Formulaire d'édition d'un matériel, affiche la photo actuelle et permet de la remplacer. */
export default function EditMaterialPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) { window.location.href = '/'; return null; }
        return res.json() as Promise<User>;
      })
      .then((data) => {
        if (data && data.role !== 'ADMIN') { window.location.href = '/dashboard'; return; }
        return fetch(`${API_URL}/material/${id}`, { credentials: 'include' })
          .then((res) => {
            if (!res.ok) throw new Error();
            return res.json() as Promise<Material>;
          })
          .then((m) => {
            setName(m.name);
            setDescription(m.description);
            setCurrentPhoto(m.photoUrl);
          });
      })
      .catch(() => setError('Impossible de charger le matériel'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (photo && photo.size > MAX_PHOTO_SIZE) {
      setError('La photo dépasse 10 Mo');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/material/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error('Échec de la modification');

      if (photo) {
        const form = new FormData();
        form.append('file', photo);
        const photoRes = await fetch(`${API_URL}/material/${id}/photo`, {
          method: 'POST',
          credentials: 'include',
          body: form,
        });
        if (!photoRes.ok) throw new Error('Modifié mais échec de l\'upload de la photo');
      }

      router.push('/admin/material');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-8">Chargement...</p>;

  const previewSrc = photoSrc(currentPhoto);

  return (
    <>
      <header className="flex items-center p-4 bg-gray-100 dark:bg-gray-800">
        <a href="/admin/material" className="text-xl font-bold flex items-center gap-2">
          ← Retour
        </a>
      </header>

      <main className="p-8 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Modifier le matériel</h1>
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
          {previewSrc && !photo && (
            <Image src={previewSrc} alt={name} width={400} height={160} className="w-full h-40 object-cover rounded-lg" />
          )}
          <label className="flex flex-col gap-1 text-sm">
            {currentPhoto ? 'Remplacer la photo' : 'Ajouter une photo'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-900 file:px-3 file:py-1 file:text-white"
            />
          </label>
          <Button disabled={submitting}>
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </main>
    </>
  );
}
