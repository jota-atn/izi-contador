import { useState, useEffect, useCallback, useRef } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { RelatorioFatura } from '../types';
import { loadMeses, loadFatura, upsertFatura } from '../storage/historico';

export type Historico = Record<string, RelatorioFatura>;

export function useHistorico(userEmail: string) {
  const db = useSQLiteContext();
  const [historico, setHistorico] = useState<Historico>({});
  const emailRef = useRef(userEmail);
  useEffect(() => {
    emailRef.current = userEmail;
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setHistorico({});
      return;
    }
    let cancelled = false;

    async function init() {
      try {
        setHistorico({});
        const meses = await loadMeses(db, userEmail);
        if (cancelled) return;
        const entries = await Promise.all(
          meses.map(async (mes) => {
            const data = await loadFatura(db, userEmail, mes);
            return data ? ([mes, data] as [string, RelatorioFatura]) : null;
          }),
        );
        if (cancelled) return;
        const loaded: Historico = {};
        for (const entry of entries) {
          if (entry) loaded[entry[0]] = entry[1];
        }
        setHistorico(loaded);
      } catch (e) {
        // DB fechado durante cleanup do StrictMode — seguro ignorar
        if (!cancelled) console.error('[useHistorico] init falhou:', e);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [db, userEmail]);

  const upsert = useCallback(
    (mes: string, data: RelatorioFatura) => {
      setHistorico((prev) => ({ ...prev, [mes]: data }));
      upsertFatura(db, emailRef.current, mes, data).catch((e) =>
        console.error('[useHistorico] upsertFatura falhou:', e),
      );
    },
    [db],
  );

  const meses = Object.keys(historico).sort().reverse();

  return { historico, meses, upsert };
}
