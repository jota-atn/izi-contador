import { useState, useEffect, useCallback, useRef } from 'react';
import { RelatorioFatura } from '../types';
import { loadMeses, loadFatura, upsertFatura } from '../storage/historico';

export type Historico = Record<string, RelatorioFatura>;

export function useHistorico(userEmail: string) {
  const [historico, setHistorico] = useState<Historico>({});
  const emailRef = useRef(userEmail);
  useEffect(() => { emailRef.current = userEmail; }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setHistorico({});
      return;
    }
    async function init() {
      setHistorico({});
      const meses = await loadMeses(userEmail);
      const entries = await Promise.all(
        meses.map(async (mes) => {
          const data = await loadFatura(userEmail, mes);
          return data ? ([mes, data] as [string, RelatorioFatura]) : null;
        }),
      );
      const loaded: Historico = {};
      for (const entry of entries) {
        if (entry) loaded[entry[0]] = entry[1];
      }
      setHistorico(loaded);
    }
    init();
  }, [userEmail]);

  const upsert = useCallback((mes: string, data: RelatorioFatura) => {
    setHistorico((prev) => ({ ...prev, [mes]: data }));
    upsertFatura(emailRef.current, mes, data);
  }, []);

  const meses = Object.keys(historico).sort().reverse();

  return { historico, meses, upsert };
}
