export const API_URL =
  process.env.NEXT_PUBLIC_API_URL !== undefined &&
  process.env.NEXT_PUBLIC_API_URL !== ''
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:3000';

export function photoSrc(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) return photoUrl;
  return `${API_URL}${photoUrl}`;
}