import { useState, useEffect, useCallback, useRef } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { EstadoPessoa, EstadoFaturas, loadEstado, upsertEstadoPessoa } from '../storage/estadoFatura';

const DEFAULT: EstadoPessoa = { oculto: false, pago: false };

export function useEstadoFatura(userEmail: string) {
  const db = useSQLiteContext();
  const [estado, setEstado] = useState<EstadoFaturas>({});
  const emailRef = useRef(userEmail);
  const estadoRef = useRef<EstadoFaturas>({});

  useEffect(() => { emailRef.current = userEmail; }, [userEmail]);
  // mantém ref sempre sincronizado para leitura síncrona fora do updater
  useEffect(() => { estadoRef.current = estado; }, [estado]);

  useEffect(() => {
    if (!userEmail) {
      setEstado({});
      return;
    }
    loadEstado(db, userEmail)
      .then(setEstado)
      .catch((e) => console.error('[useEstadoFatura] loadEstado falhou:', e));
  }, [db, userEmail]);

  function getEstado(mes: string, dono: string): EstadoPessoa {
    return estado[mes]?.[dono] ?? DEFAULT;
  }

  // Lê estado atual pelo ref (síncrono) e chama setEstado + DB fora do updater
  // Evita que o React 19 StrictMode invoque o updater 2x e dispare 2 writes concorrentes
  const toggleOculto = useCallback((mes: string, dono: string) => {
    const curr = estadoRef.current[mes]?.[dono] ?? DEFAULT;
    const next = { ...curr, oculto: !curr.oculto };
    setEstado((prev) => ({ ...prev, [mes]: { ...prev[mes], [dono]: next } }));
    upsertEstadoPessoa(db, emailRef.current, mes, dono, next).catch((e) =>
      console.error('[useEstadoFatura] toggleOculto falhou:', e),
    );
  }, [db]);

  const togglePago = useCallback((mes: string, dono: string) => {
    const curr = estadoRef.current[mes]?.[dono] ?? DEFAULT;
    const next = { ...curr, pago: !curr.pago };
    setEstado((prev) => ({ ...prev, [mes]: { ...prev[mes], [dono]: next } }));
    upsertEstadoPessoa(db, emailRef.current, mes, dono, next).catch((e) =>
      console.error('[useEstadoFatura] togglePago falhou:', e),
    );
  }, [db]);

  return { getEstado, toggleOculto, togglePago };
}
