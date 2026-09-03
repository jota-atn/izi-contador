import { useState, useEffect, useCallback, useRef } from 'react';
import { Orcamentos, loadOrcamentos, saveOrcamentos } from '../config/orcamentos';

export function useOrcamentos(userEmail: string) {
  const [orcamentos, setOrcamentos] = useState<Orcamentos>({});
  const [loaded, setLoaded] = useState(false);
  const emailRef = useRef(userEmail);
  useEffect(() => {
    emailRef.current = userEmail;
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setOrcamentos({});
      setLoaded(false);
      return;
    }
    loadOrcamentos(userEmail).then((o) => {
      setOrcamentos(o);
      setLoaded(true);
    });
  }, [userEmail]);

  const persist = (next: Orcamentos) => {
    saveOrcamentos(emailRef.current, next).catch((e) =>
      console.error('[useOrcamentos] saveOrcamentos falhou:', e),
    );
  };

  const setLimite = useCallback((categoria: string, limite: number | null) => {
    setOrcamentos((prev) => {
      const next = { ...prev };
      if (limite === null || isNaN(limite) || limite <= 0) {
        delete next[categoria];
      } else {
        next[categoria] = limite;
      }
      persist(next);
      return next;
    });
  }, []);

  return { orcamentos, loaded, setLimite };
}
