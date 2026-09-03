import { useCallback, useEffect, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  Edicao,
  EdicaoKey,
  clearEdicoesMes,
  deleteEdicao,
  loadEdicoes,
  upsertEdicao,
} from '../storage/edicoesFatura';

export function useEdicoesFatura(userId: string, mes: string) {
  const db = useSQLiteContext();
  const [edicoes, setEdicoes] = useState<Edicao[]>([]);
  const mesRef = useRef(mes);
  useEffect(() => {
    mesRef.current = mes;
  }, [mes]);

  // estável entre trocas de mês (usa mesRef) para não invalidar salvar/remover/limparMes,
  // que por sua vez são passados como dependência de efeitos em App.tsx
  const load = useCallback(async () => {
    const currentMes = mesRef.current;
    if (!userId || !currentMes) {
      setEdicoes([]);
      return;
    }
    const rows = await loadEdicoes(db, userId, currentMes);
    // descarta se o mês mudou enquanto a leitura estava em voo — senão o
    // resultado de um mês antigo pode sobrescrever o do mês atual
    if (mesRef.current === currentMes) setEdicoes(rows);
  }, [db, userId]);

  useEffect(() => {
    load();
  }, [db, userId, mes]); // eslint-disable-line react-hooks/exhaustive-deps

  const salvar = useCallback(
    async (ed: Edicao) => {
      await upsertEdicao(db, userId, ed);
      await load();
    },
    [db, userId, load],
  );

  const remover = useCallback(
    async (key: EdicaoKey) => {
      await deleteEdicao(db, userId, key);
      await load();
    },
    [db, userId, load],
  );

  const limparMes = useCallback(
    async (m: string) => {
      await clearEdicoesMes(db, userId, m);
      await load();
    },
    [db, userId, load],
  );

  return { edicoes, salvar, remover, limparMes, reload: load };
}
