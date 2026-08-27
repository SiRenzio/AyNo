import * as SecureStore from 'expo-secure-store';

export const sessionStorage = {
    getSync: (key: string) => SecureStore.getItem(key),
    get: (key: string) => SecureStore.getItemAsync(key),
    set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    remove: (key: string) => SecureStore.deleteItemAsync(key),
};
