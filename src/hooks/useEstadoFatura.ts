import { useState, useEffect, useCallback } from 'react';
import { EstadoPessoa, EstadoFaturas, loadEstado, upsertEstadoPessoa } from '../storage/estadoFatura';

const DEFAULT: EstadoPessoa = { oculto: false, pago: false };

export function useEstadoFatura() {
  const [estado, setEstado] = useState<EstadoFaturas>({});

  useEffect(() => {
    loadEstado().then(setEstado);
  }, []);

  function getEstado(mes: string, dono: string): EstadoPessoa {
    return estado[mes]?.[dono] ?? DEFAULT;
  }

  const toggleOculto = useCallback((mes: string, dono: string) => {
    setEstado((prev) => {
      const curr = prev[mes]?.[dono] ?? DEFAULT;
      const next = { ...curr, oculto: !curr.oculto };
      upsertEstadoPessoa(mes, dono, next);
      return { ...prev, [mes]: { ...prev[mes], [dono]: next } };
    });
  }, []);

  const togglePago = useCallback((mes: string, dono: string) => {
    setEstado((prev) => {
      const curr = prev[mes]?.[dono] ?? DEFAULT;
      const next = { ...curr, pago: !curr.pago };
      upsertEstadoPessoa(mes, dono, next);
      return { ...prev, [mes]: { ...prev[mes], [dono]: next } };
    });
  }, []);

  return { getEstado, toggleOculto, togglePago };
}
