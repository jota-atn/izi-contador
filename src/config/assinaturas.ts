import * as SecureStore from 'expo-secure-store';

export interface Assinatura {
  nome: string;
  keywords: string[];
  valorReferencia: number;
  participantes: string[];
}

// shape antigo (valor fixo por participante, uma keyword só) — antes da divisão igual
// pelo valor real da fatura
interface AssinaturaLegado {
  keyword: string;
  participantes: { pessoa: string; valor: number }[];
}

function key(userEmail: string) {
  return `assinaturas_v1_${userEmail.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

function migrarLegado(raw: unknown): Assinatura[] {
  const lista = raw as (Assinatura | AssinaturaLegado)[];
  return lista.map((a) => {
    if ('keywords' in a) return a;
    const legado = a as AssinaturaLegado;
    return {
      nome: legado.keyword,
      keywords: [legado.keyword],
      // valor de referência não existia no formato antigo — soma dos valores fixos
      // configurados é a melhor estimativa disponível, usuário pode ajustar depois
      valorReferencia: parseFloat(legado.participantes.reduce((s, p) => s + p.valor, 0).toFixed(2)),
      participantes: legado.participantes.map((p) => p.pessoa),
    };
  });
}

export async function loadAssinaturas(userEmail: string): Promise<Assinatura[]> {
  try {
    const raw = await SecureStore.getItemAsync(key(userEmail));
    if (raw) return migrarLegado(JSON.parse(raw));
  } catch {}
  return [];
}

export async function saveAssinaturas(userEmail: string, assinaturas: Assinatura[]): Promise<void> {
  await SecureStore.setItemAsync(key(userEmail), JSON.stringify(assinaturas));
}
