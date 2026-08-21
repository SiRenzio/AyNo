export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8001/api/mobile';

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    ...options,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const validation = body.errors && Object.values(body.errors).flat()[0];
    throw new ApiError(String(validation ?? body.message ?? 'Something went wrong.'), response.status);
  }
  return body as T;
}
