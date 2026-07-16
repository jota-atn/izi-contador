import * as SecureStore from 'expo-secure-store';

function key(userEmail: string) {
  return `pix_key_v1_${userEmail.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

export async function loadPixKey(userEmail: string): Promise<string> {
  const raw = await SecureStore.getItemAsync(key(userEmail));
  return raw ?? '';
}

export async function savePixKey(userEmail: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key(userEmail), value.trim());
}
