import { useCallback, useEffect, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { EdicaoKey } from '../storage/edicoesFatura';
import { DivisaoOrfa, loadDivisoesOrfas, removerDivisaoOrfa } from '../storage/divisoesOrfas';

export function useDivisoesOrfas(userId: string, mes: string) {
  const db = useSQLiteContext();
  const [orfas, setOrfas] = useState<DivisaoOrfa[]>([]);
  const mesRef = useRef(mes);
  useEffect(() => {
    mesRef.current = mes;
  }, [mes]);

  const reload = useCallback(async () => {
    const currentMes = mesRef.current;
    if (!userId || !currentMes) {
      setOrfas([]);
      return;
    }
    setOrfas(await loadDivisoesOrfas(db, userId, currentMes));
  }, [db, userId]);

  useEffect(() => {
    reload();
  }, [db, userId, mes]); // eslint-disable-line react-hooks/exhaustive-deps

  const remover = useCallback(
    async (key: EdicaoKey) => {
      await removerDivisaoOrfa(db, userId, key);
      await reload();
    },
    [db, userId, reload],
  );

  return { orfas, remover, reload };
}
