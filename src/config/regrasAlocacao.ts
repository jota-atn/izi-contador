import * as SecureStore from 'expo-secure-store';

export type RegrasAlocacao = Record<string, string>;

function key(userEmail: string) {
  return `regras_v1_${userEmail.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

export async function loadRegras(userEmail: string): Promise<RegrasAlocacao> {
  try {
    const raw = await SecureStore.getItemAsync(key(userEmail));
    if (raw) return JSON.parse(raw) as RegrasAlocacao;
  } catch {}
  return {};
}

export async function saveRegras(userEmail: string, regras: RegrasAlocacao): Promise<void> {
  await SecureStore.setItemAsync(key(userEmail), JSON.stringify(regras));
}
