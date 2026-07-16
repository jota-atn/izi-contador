import { useState, useEffect, useCallback, useRef } from 'react';
import { Assinatura, loadAssinaturas, saveAssinaturas } from '../config/assinaturas';

export function useAssinaturas(userEmail: string) {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const emailRef = useRef(userEmail);
  useEffect(() => {
    emailRef.current = userEmail;
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setAssinaturas([]);
      return;
    }
    loadAssinaturas(userEmail).then(setAssinaturas);
  }, [userEmail]);

  const persist = (next: Assinatura[]) => {
    saveAssinaturas(emailRef.current, next).catch((e) =>
      console.error('[useAssinaturas] saveAssinaturas falhou:', e),
    );
  };

  const salvarAssinatura = useCallback((assinatura: Assinatura) => {
    const keyword = assinatura.keyword.trim().toUpperCase();
    if (!keyword) return;
    setAssinaturas((prev) => {
      const next = [...prev.filter((a) => a.keyword !== keyword), { ...assinatura, keyword }];
      persist(next);
      return next;
    });
  }, []);

  const removerAssinatura = useCallback((keyword: string) => {
    setAssinaturas((prev) => {
      const next = prev.filter((a) => a.keyword !== keyword);
      persist(next);
      return next;
    });
  }, []);

  return { assinaturas, salvarAssinatura, removerAssinatura };
}
