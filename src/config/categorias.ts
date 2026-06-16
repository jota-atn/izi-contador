import * as SecureStore from 'expo-secure-store';

export type Categorias = Record<string, string[]>;

export const DEFAULT_CATEGORIAS: Categorias = {
  TRANSPORTE: ['UBER', '99POP', '99APP', '99 POP', 'POSTO', 'ESTACIONAMENTO'],
  ALMOÇO: ['IFOOD', 'QUENTINHA', 'ALMOÇO', 'RESTAURANTE', 'LANCHONETE', 'BURGER', 'IFD'],
  NECESSIDADES: ['SUPERMERCADO', 'FARMACIA', 'DROGARIA', 'PANIFICADORA', 'MINIBOX'],
  STREAMING: ['HBO', 'PRIME VIDEO', 'SPOTIFY', 'CRUNCHYROLL', 'NETFLIX', 'DISNEY', 'YOUTUBE PREMIUM'],
};

function key(userEmail: string) {
  return `categorias_v1_${userEmail.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

export async function loadCategorias(userEmail: string): Promise<Categorias> {
  try {
    const raw = await SecureStore.getItemAsync(key(userEmail));
    if (raw) return JSON.parse(raw) as Categorias;
  } catch {}
  return DEFAULT_CATEGORIAS;
}

export async function saveCategorias(userEmail: string, cat: Categorias): Promise<void> {
  await SecureStore.setItemAsync(key(userEmail), JSON.stringify(cat));
}
