import * as SecureStore from 'expo-secure-store';
import { RelatorioFatura } from '../types';

const INDEX_KEY = 'historico_meses_v1';

function mesKey(mes: string) {
  return `historico_fatura_${mes}`;
}

export async function loadMeses(): Promise<string[]> {
  try {
    const raw = await SecureStore.getItemAsync(INDEX_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return [];
}

export async function loadFatura(mes: string): Promise<RelatorioFatura | null> {
  try {
    const raw = await SecureStore.getItemAsync(mesKey(mes));
    if (raw) return JSON.parse(raw) as RelatorioFatura;
  } catch {}
  return null;
}

export async function upsertFatura(mes: string, data: RelatorioFatura): Promise<void> {
  await SecureStore.setItemAsync(mesKey(mes), JSON.stringify(data));

  const meses = await loadMeses();
  if (!meses.includes(mes)) {
    await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify([...meses, mes]));
  }
}
