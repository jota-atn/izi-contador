import * as SecureStore from 'expo-secure-store';

// chave "${mes}:${categoria}" -> true, pra não notificar de novo a cada sincronização
export type OrcamentoAlertas = Record<string, true>;

function key(userEmail: string) {
  return `orcamento_alertas_v1_${userEmail.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

export async function loadOrcamentoAlertas(userEmail: string): Promise<OrcamentoAlertas> {
  try {
    const raw = await SecureStore.getItemAsync(key(userEmail));
    if (raw) return JSON.parse(raw) as OrcamentoAlertas;
  } catch {}
  return {};
}

export async function saveOrcamentoAlertas(
  userEmail: string,
  alertas: OrcamentoAlertas,
): Promise<void> {
  await SecureStore.setItemAsync(key(userEmail), JSON.stringify(alertas));
}
