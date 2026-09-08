import * as SecureStore from 'expo-secure-store';

// nome normalizado (uppercase) -> e-mail. Central pra não duplicar o mesmo e-mail em
// cada assinatura que a pessoa participa.
export type PessoasContato = Record<string, string>;

function key(userEmail: string) {
  return `pessoas_contato_v1_${userEmail.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

export async function loadPessoasContato(userEmail: string): Promise<PessoasContato> {
  try {
    const raw = await SecureStore.getItemAsync(key(userEmail));
    if (raw) return JSON.parse(raw) as PessoasContato;
  } catch {}
  return {};
}

export async function savePessoasContato(
  userEmail: string,
  contatos: PessoasContato,
): Promise<void> {
  await SecureStore.setItemAsync(key(userEmail), JSON.stringify(contatos));
}
