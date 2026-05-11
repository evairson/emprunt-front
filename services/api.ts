import createClient, { type Middleware } from 'openapi-fetch';

import { API_URL } from '@/lib/constants';
import type { paths } from '@/types/api';

export const api = createClient<paths>({
  baseUrl: API_URL,
  credentials: 'include',
});

const authMiddleware: Middleware = {
  async onResponse({ request, response }) {
    if (response.status !== 401) return response;

    if (request.url.includes('/auth/login')) return response;
    if (request.url.includes('/auth/callback')) return response;

    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return response;
  },
};

api.use(authMiddleware);
