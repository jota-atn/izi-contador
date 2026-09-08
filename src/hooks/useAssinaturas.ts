import { useState, useEffect, useCallback, useRef } from 'react';
import { Assinatura, loadAssinaturas, saveAssinaturas } from '../config/assinaturas';

export function useAssinaturas(userEmail: string) {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [loaded, setLoaded] = useState(false);
  const emailRef = useRef(userEmail);
  useEffect(() => {
    emailRef.current = userEmail;
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setAssinaturas([]);
      setLoaded(false);
      return;
    }
    loadAssinaturas(userEmail).then((a) => {
      setAssinaturas(a);
      setLoaded(true);
    });
  }, [userEmail]);

  const persist = (next: Assinatura[]) => {
    saveAssinaturas(emailRef.current, next).catch((e) =>
      console.error('[useAssinaturas] saveAssinaturas falhou:', e),
    );
  };

  const salvarAssinatura = useCallback((assinatura: Assinatura) => {
    const nome = assinatura.nome.trim();
    if (!nome) return;
    setAssinaturas((prev) => {
      const next = [
        ...prev.filter((a) => a.nome.toUpperCase() !== nome.toUpperCase()),
        { ...assinatura, nome },
      ];
      persist(next);
      return next;
    });
  }, []);

  const removerAssinatura = useCallback((nome: string) => {
    setAssinaturas((prev) => {
      const next = prev.filter((a) => a.nome.toUpperCase() !== nome.toUpperCase());
      persist(next);
      return next;
    });
  }, []);

  return { assinaturas, loaded, salvarAssinatura, removerAssinatura };
}
