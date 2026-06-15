import * as SecureStore from 'expo-secure-store';

// keyword (uppercase) → nome da pessoa
export type RegrasAlocacao = Record<string, string>;

const KEY = 'regras_alocacao_v1';

export async function loadRegras(): Promise<RegrasAlocacao> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (raw) return JSON.parse(raw) as RegrasAlocacao;
  } catch {}
  return {};
}

export async function saveRegras(regras: RegrasAlocacao): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(regras));
}
