import { useState, useEffect, useCallback } from 'react';
import { EstadoPessoa, EstadoFaturas, loadEstado, saveEstado } from '../storage/estadoFatura';

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
      const next = {
        ...prev,
        [mes]: { ...prev[mes], [dono]: { ...curr, oculto: !curr.oculto } },
      };
      saveEstado(next);
      return next;
    });
  }, []);

  const togglePago = useCallback((mes: string, dono: string) => {
    setEstado((prev) => {
      const curr = prev[mes]?.[dono] ?? DEFAULT;
      const next = {
        ...prev,
        [mes]: { ...prev[mes], [dono]: { ...curr, pago: !curr.pago } },
      };
      saveEstado(next);
      return next;
    });
  }, []);

  return { getEstado, toggleOculto, togglePago };
}
