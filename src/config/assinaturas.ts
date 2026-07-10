import * as SecureStore from 'expo-secure-store';

export interface ParticipanteAssinatura {
  pessoa: string;
  valor: number;
}

export interface Assinatura {
  keyword: string;
  participantes: ParticipanteAssinatura[];
}

function key(userEmail: string) {
  return `assinaturas_v1_${userEmail.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

export async function loadAssinaturas(userEmail: string): Promise<Assinatura[]> {
  try {
    const raw = await SecureStore.getItemAsync(key(userEmail));
    if (raw) return JSON.parse(raw) as Assinatura[];
  } catch {}
  return [];
}

export async function saveAssinaturas(userEmail: string, assinaturas: Assinatura[]): Promise<void> {
  await SecureStore.setItemAsync(key(userEmail), JSON.stringify(assinaturas));
}
