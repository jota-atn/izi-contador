import * as SecureStore from 'expo-secure-store';

export interface EstadoPessoa {
  oculto: boolean;
  pago: boolean;
}

export type EstadoFaturas = Record<string, Record<string, EstadoPessoa>>;

const KEY = 'estado_faturas_v1';

export async function loadEstado(): Promise<EstadoFaturas> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (raw) return JSON.parse(raw) as EstadoFaturas;
  } catch {}
  return {};
}

export async function saveEstado(estado: EstadoFaturas): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(estado));
}
