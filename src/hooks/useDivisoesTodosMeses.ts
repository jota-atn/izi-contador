import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { DivisaoItem, loadDivisoesTodosMeses } from '../storage/divisoesFatura';

export function useDivisoesTodosMeses(userId: string) {
  const db = useSQLiteContext();
  const [divisoesPorMes, setDivisoesPorMes] = useState<Record<string, DivisaoItem[]>>({});

  const reload = useCallback(async () => {
    if (!userId) {
      setDivisoesPorMes({});
      return;
    }
    setDivisoesPorMes(await loadDivisoesTodosMeses(db, userId));
  }, [db, userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { divisoesPorMes, reload };
}
