import { useState, useEffect, useCallback, useRef } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { AnotacaoInvalida } from '../types';
import {
  AvisosDispensados,
  loadAvisosDispensados,
  dispensarAviso,
  chaveAviso,
} from '../storage/avisosDispensados';

export function useAvisosDispensados(userEmail: string) {
  const db = useSQLiteContext();
  const [dispensados, setDispensados] = useState<AvisosDispensados>({});
  const emailRef = useRef(userEmail);
  useEffect(() => {
    emailRef.current = userEmail;
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setDispensados({});
      return;
    }
    loadAvisosDispensados(db, userEmail)
      .then(setDispensados)
      .catch((e) => console.error('[useAvisosDispensados] load falhou:', e));
  }, [db, userEmail]);

  const isDispensado = useCallback(
    (mes: string, item: AnotacaoInvalida) => dispensados[mes]?.has(chaveAviso(item)) ?? false,
    [dispensados],
  );

  const dispensar = useCallback(
    (mes: string, item: AnotacaoInvalida) => {
      const key = chaveAviso(item);
      setDispensados((prev) => {
        const next = new Set(prev[mes]);
        next.add(key);
        return { ...prev, [mes]: next };
      });
      dispensarAviso(db, emailRef.current, mes, item).catch((e) =>
        console.error('[useAvisosDispensados] dispensar falhou:', e),
      );
    },
    [db],
  );

  return { isDispensado, dispensar };
}
