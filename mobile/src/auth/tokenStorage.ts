import * as SecureStore from 'expo-secure-store';
import { StoredTokens } from '../types';

const KEY = 'google_tokens';

export async function loadTokens(): Promise<StoredTokens | null> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(tokens));
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
