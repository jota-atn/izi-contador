import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Edicao, EdicaoKey, clearEdicoesMes, deleteEdicao, loadEdicoes, upsertEdicao } from '../storage/edicoesFatura';

export function useEdicoesFatura(userId: string, mes: string) {
  const db = useSQLiteContext();
  const [edicoes, setEdicoes] = useState<Edicao[]>([]);

  const load = useCallback(async () => {
    if (!userId || !mes) { setEdicoes([]); return; }
    setEdicoes(await loadEdicoes(db, userId, mes));
  }, [db, userId, mes]);

  useEffect(() => { load(); }, [load]);

  const salvar = useCallback(async (ed: Edicao) => {
    await upsertEdicao(db, userId, ed);
    await load();
  }, [db, userId, load]);

  const remover = useCallback(async (key: EdicaoKey) => {
    await deleteEdicao(db, userId, key);
    await load();
  }, [db, userId, load]);

  const limparMes = useCallback(async (m: string) => {
    await clearEdicoesMes(db, userId, m);
    await load();
  }, [db, userId, load]);

  return { edicoes, salvar, remover, limparMes };
}
