import { DeviceEventEmitter } from 'react-native';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8001/api/mobile';

let activeRequests = 0;
function changeLoading(change: number) {
  activeRequests = Math.max(0, activeRequests + change);
  DeviceEventEmitter.emit('apiLoadingChanged', activeRequests);
}

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  changeLoading(1);
  try {
    let response: Response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        cache: 'no-store',
        ...options,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
      });
    } catch {
      throw new ApiError(`Cannot reach AyNo at ${API_URL}. Make sure Laravel is running and this device is on the same network.`, 0);
    }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const validation = body.errors && Object.values(body.errors).flat()[0];
      throw new ApiError(String(validation ?? body.message ?? 'Something went wrong.'), response.status);
    }
    return body as T;
  } finally {
    changeLoading(-1);
  }
}
