import { useState, useEffect, useCallback, useRef } from 'react';
import {
  OrcamentoAlertas,
  loadOrcamentoAlertas,
  saveOrcamentoAlertas,
} from '../storage/orcamentoAlertas';

function chave(mes: string, categoria: string): string {
  return `${mes}:${categoria}`;
}

export function useOrcamentoAlertas(userEmail: string) {
  const [alertas, setAlertas] = useState<OrcamentoAlertas>({});
  const emailRef = useRef(userEmail);
  useEffect(() => {
    emailRef.current = userEmail;
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setAlertas({});
      return;
    }
    loadOrcamentoAlertas(userEmail).then(setAlertas);
  }, [userEmail]);

  const jaAlertado = useCallback(
    (mes: string, categoria: string) => !!alertas[chave(mes, categoria)],
    [alertas],
  );

  const marcarAlertado = useCallback((mes: string, categoria: string) => {
    setAlertas((prev) => {
      const next = { ...prev, [chave(mes, categoria)]: true as const };
      saveOrcamentoAlertas(emailRef.current, next).catch((e) =>
        console.error('[useOrcamentoAlertas] saveOrcamentoAlertas falhou:', e),
      );
      return next;
    });
  }, []);

  return { jaAlertado, marcarAlertado };
}
