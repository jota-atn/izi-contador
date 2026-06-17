import { useState, useEffect, useCallback, useRef } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  EstadoPessoa,
  EstadoFaturas,
  loadEstado,
  upsertEstadoPessoa,
} from '../storage/estadoFatura';

const DEFAULT: EstadoPessoa = { oculto: false, pago: false };

export function useEstadoFatura(userEmail: string) {
  const db = useSQLiteContext();
  const [estado, setEstado] = useState<EstadoFaturas>({});
  const emailRef = useRef(userEmail);
  const estadoRef = useRef<EstadoFaturas>({});

  useEffect(() => {
    emailRef.current = userEmail;
  }, [userEmail]);
  useEffect(() => {
    estadoRef.current = estado;
  }, [estado]);

  useEffect(() => {
    if (!userEmail) {
      setEstado({});
      return;
    }
    loadEstado(db, userEmail)
      .then(setEstado)
      .catch((e) => console.error('[useEstadoFatura] loadEstado falhou:', e));
  }, [db, userEmail]);

  const getEstado = useCallback(
    (mes: string, dono: string): EstadoPessoa => estado[mes]?.[dono] ?? DEFAULT,
    [estado],
  );

  // lê pelo ref para evitar que StrictMode invoque o updater 2× e dispare writes duplicados
  const toggleOculto = useCallback(
    (mes: string, dono: string) => {
      const curr = estadoRef.current[mes]?.[dono] ?? DEFAULT;
      const next = { ...curr, oculto: !curr.oculto };
      setEstado((prev) => ({ ...prev, [mes]: { ...prev[mes], [dono]: next } }));
      upsertEstadoPessoa(db, emailRef.current, mes, dono, next).catch((e) =>
        console.error('[useEstadoFatura] toggleOculto falhou:', e),
      );
    },
    [db],
  );

  const togglePago = useCallback(
    (mes: string, dono: string) => {
      const curr = estadoRef.current[mes]?.[dono] ?? DEFAULT;
      const next = { ...curr, pago: !curr.pago };
      setEstado((prev) => ({ ...prev, [mes]: { ...prev[mes], [dono]: next } }));
      upsertEstadoPessoa(db, emailRef.current, mes, dono, next).catch((e) =>
        console.error('[useEstadoFatura] togglePago falhou:', e),
      );
    },
    [db],
  );

  const marcarTodosPago = useCallback(
    (mes: string, donos: string[]) => {
      const nextMes: Record<string, EstadoPessoa> = {};
      for (const dono of donos) {
        const curr = estadoRef.current[mes]?.[dono] ?? DEFAULT;
        nextMes[dono] = { ...curr, pago: true };
      }
      setEstado((prev) => ({ ...prev, [mes]: { ...prev[mes], ...nextMes } }));
      Promise.all(
        donos.map((dono) => upsertEstadoPessoa(db, emailRef.current, mes, dono, nextMes[dono])),
      ).catch((e) => console.error('[useEstadoFatura] marcarTodosPago falhou:', e));
    },
    [db],
  );

  return { getEstado, toggleOculto, togglePago, marcarTodosPago };
}
