import { useState, useCallback, useEffect } from 'react';
import { RelatorioFatura } from '../types';
import { findLatestFaturaMessage, downloadCsvAttachment } from '../gmail/gmailApi';
import { parseFatura } from '../parser/parseFatura';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: RelatorioFatura }
  | { status: 'error'; message: string }
  | { status: 'auth_expired' };

export function useRelatorio(
  getAccessToken: () => Promise<string | null>,
  authStatus: 'loading' | 'unauthenticated' | 'authenticated',
  ownerName: string,
) {
  const [state, setState] = useState<State>({ status: 'idle' });

  const carregar = useCallback(async () => {
    setState({ status: 'loading' });

    const token = await getAccessToken();
    if (!token) {
      setState({ status: 'auth_expired' });
      return;
    }

    try {
      const messageId = await findLatestFaturaMessage(token);
      if (!messageId) {
        setState({ status: 'error', message: 'Nenhum extrato encontrado no e-mail.' });
        return;
      }

      const csvText = await downloadCsvAttachment(token, messageId);
      const data = parseFatura(csvText, ownerName);
      setState({ status: 'success', data });
    } catch (err: any) {
      if (err?.status === 401) {
        setState({ status: 'auth_expired' });
      } else {
        setState({ status: 'error', message: err?.message ?? 'Erro ao carregar fatura.' });
      }
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (authStatus === 'authenticated') carregar();
  }, [authStatus, carregar]);

  return { state, refresh: carregar };
}
