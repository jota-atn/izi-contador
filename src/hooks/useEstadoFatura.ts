import { useState, useEffect, useCallback, useRef } from 'react';
import { EstadoPessoa, EstadoFaturas, loadEstado, upsertEstadoPessoa } from '../storage/estadoFatura';

const DEFAULT: EstadoPessoa = { oculto: false, pago: false };

export function useEstadoFatura(userEmail: string) {
  const [estado, setEstado] = useState<EstadoFaturas>({});
  const emailRef = useRef(userEmail);
  useEffect(() => { emailRef.current = userEmail; }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setEstado({});
      return;
    }
    loadEstado(userEmail).then(setEstado);
  }, [userEmail]);

  function getEstado(mes: string, dono: string): EstadoPessoa {
    return estado[mes]?.[dono] ?? DEFAULT;
  }

  const toggleOculto = useCallback((mes: string, dono: string) => {
    setEstado((prev) => {
      const curr = prev[mes]?.[dono] ?? DEFAULT;
      const next = { ...curr, oculto: !curr.oculto };
      upsertEstadoPessoa(emailRef.current, mes, dono, next);
      return { ...prev, [mes]: { ...prev[mes], [dono]: next } };
    });
  }, []);

  const togglePago = useCallback((mes: string, dono: string) => {
    setEstado((prev) => {
      const curr = prev[mes]?.[dono] ?? DEFAULT;
      const next = { ...curr, pago: !curr.pago };
      upsertEstadoPessoa(emailRef.current, mes, dono, next);
      return { ...prev, [mes]: { ...prev[mes], [dono]: next } };
    });
  }, []);

  return { getEstado, toggleOculto, togglePago };
}
