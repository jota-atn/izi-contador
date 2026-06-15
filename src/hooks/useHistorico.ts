import { useState, useEffect, useCallback } from 'react';
import { RelatorioFatura } from '../types';
import { loadMeses, loadFatura, upsertFatura } from '../storage/historico';

export type Historico = Record<string, RelatorioFatura>;

export function useHistorico() {
  const [historico, setHistorico] = useState<Historico>({});

  useEffect(() => {
    async function init() {
      const meses = await loadMeses();
      const entries = await Promise.all(
        meses.map(async (mes) => {
          const data = await loadFatura(mes);
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
  }, []);

  const upsert = useCallback((mes: string, data: RelatorioFatura) => {
    setHistorico((prev) => ({ ...prev, [mes]: data }));
    upsertFatura(mes, data);
  }, []);

  const meses = Object.keys(historico).sort().reverse();

  return { historico, meses, upsert };
}
