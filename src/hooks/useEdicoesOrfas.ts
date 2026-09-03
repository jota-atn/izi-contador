import { useCallback, useEffect, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { EdicaoKey } from '../storage/edicoesFatura';
import { EdicaoOrfa, loadOrfas, removerOrfa } from '../storage/edicoesOrfas';

export function useEdicoesOrfas(userId: string, mes: string) {
  const db = useSQLiteContext();
  const [orfas, setOrfas] = useState<EdicaoOrfa[]>([]);
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
    const rows = await loadOrfas(db, userId, currentMes);
    // descarta se o mês mudou enquanto a leitura estava em voo — senão o
    // resultado de um mês antigo pode sobrescrever o do mês atual
    if (mesRef.current === currentMes) setOrfas(rows);
  }, [db, userId]);

  useEffect(() => {
    reload();
  }, [db, userId, mes]); // eslint-disable-line react-hooks/exhaustive-deps

  const remover = useCallback(
    async (key: EdicaoKey) => {
      await removerOrfa(db, userId, key);
      await reload();
    },
    [db, userId, reload],
  );

  return { orfas, remover, reload };
}
