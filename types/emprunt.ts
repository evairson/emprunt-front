import type { Material } from './material';
import type { User } from './user';

export type EmpruntStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Emprunt {
  id: string;
  userId: string;
  materialId: string;
  startDate: string;
  endDate: string;
  status: EmpruntStatus;
  returnedAt: string | null;
  createdAt: string;
  material?: Material;
  user?: User;
}
