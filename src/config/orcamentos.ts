import * as SecureStore from 'expo-secure-store';

export type Orcamentos = Record<string, number>;

function key(userEmail: string) {
  return `orcamentos_v1_${userEmail.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

export async function loadOrcamentos(userEmail: string): Promise<Orcamentos> {
  try {
    const raw = await SecureStore.getItemAsync(key(userEmail));
    if (raw) return JSON.parse(raw) as Orcamentos;
  } catch {}
  return {};
}

export async function saveOrcamentos(userEmail: string, orcamentos: Orcamentos): Promise<void> {
  await SecureStore.setItemAsync(key(userEmail), JSON.stringify(orcamentos));
}
