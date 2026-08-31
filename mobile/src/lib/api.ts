import { DeviceEventEmitter } from 'react-native';
import { localApi } from './local-api';

export { ApiError } from './api-error';

let activeRequests = 0;

export async function api<T>(path: string, options: RequestInit = {}, _token?: string | null): Promise<T> {
    activeRequests += 1;
    DeviceEventEmitter.emit('apiLoadingChanged', activeRequests);
    try {
        return await localApi<T>(path, options);
    } finally {
        activeRequests = Math.max(0, activeRequests - 1);
        DeviceEventEmitter.emit('apiLoadingChanged', activeRequests);
    }
}
