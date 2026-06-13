import * as SecureStore from 'expo-secure-store';

export type Categorias = Record<string, string[]>;

export const DEFAULT_CATEGORIAS: Categorias = {
  TRANSPORTE: ['UBER', '99POP', '99APP', '99 POP', 'POSTO', 'ESTACIONAMENTO'],
  ALMOÇO: ['IFOOD', 'QUENTINHA', 'ALMOÇO', 'RESTAURANTE', 'LANCHONETE', 'BURGER', 'IFD'],
  NECESSIDADES: ['SUPERMERCADO', 'FARMACIA', 'DROGARIA', 'PANIFICADORA', 'MINIBOX'],
  STREAMING: ['HBO', 'PRIME VIDEO', 'SPOTIFY', 'CRUNCHYROLL', 'NETFLIX', 'DISNEY', 'YOUTUBE PREMIUM'],
};

const KEY = 'categorias_v1';

export async function loadCategorias(): Promise<Categorias> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (raw) return JSON.parse(raw) as Categorias;
  } catch {}
  return DEFAULT_CATEGORIAS;
}

export async function saveCategorias(cat: Categorias): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(cat));
}
