import { useCallback, useEffect, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { EdicaoKey } from '../storage/edicoesFatura';
import {
  DivisaoItem,
  DivisaoShare,
  loadDivisoes,
  removerDivisao,
  salvarDivisao,
} from '../storage/divisoesFatura';

export function useDivisoesFatura(userId: string, mes: string) {
  const db = useSQLiteContext();
  const [divisoes, setDivisoes] = useState<DivisaoItem[]>([]);
  const mesRef = useRef(mes);
  useEffect(() => {
    mesRef.current = mes;
  }, [mes]);

  const load = useCallback(async () => {
    const currentMes = mesRef.current;
    if (!userId || !currentMes) {
      setDivisoes([]);
      return;
    }
    setDivisoes(await loadDivisoes(db, userId, currentMes));
  }, [db, userId]);

  useEffect(() => {
    load();
  }, [db, userId, mes]); // eslint-disable-line react-hooks/exhaustive-deps

  const salvar = useCallback(
    async (key: Omit<EdicaoKey, 'mes'>, shares: DivisaoShare[]) => {
      await salvarDivisao(db, userId, mesRef.current, key, shares);
      await load();
    },
    [db, userId, load],
  );

  const remover = useCallback(
    async (key: EdicaoKey) => {
      await removerDivisao(db, userId, key);
      await load();
    },
    [db, userId, load],
  );

  return { divisoes, salvar, remover, reload: load };
}
