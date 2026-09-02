import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Edicao, loadEdicoesTodosMeses } from '../storage/edicoesFatura';

export function useEdicoesTodosMeses(userId: string) {
  const db = useSQLiteContext();
  const [edicoesPorMes, setEdicoesPorMes] = useState<Record<string, Edicao[]>>({});

  const reload = useCallback(async () => {
    if (!userId) {
      setEdicoesPorMes({});
      return;
    }
    setEdicoesPorMes(await loadEdicoesTodosMeses(db, userId));
  }, [db, userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { edicoesPorMes, reload };
}
