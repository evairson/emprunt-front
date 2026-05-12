export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: Role;
}
