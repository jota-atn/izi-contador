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

  const salvarAssinatura = useCallback((assinatura: Assinatura) => {
    const keyword = assinatura.keyword.trim().toUpperCase();
    if (!keyword) return;
    setAssinaturas((prev) => {
      const next = [...prev.filter((a) => a.keyword !== keyword), { ...assinatura, keyword }];
      saveAssinaturas(emailRef.current, next);
      return next;
    });
  }, []);

  const removerAssinatura = useCallback((keyword: string) => {
    setAssinaturas((prev) => {
      const next = prev.filter((a) => a.keyword !== keyword);
      saveAssinaturas(emailRef.current, next);
      return next;
    });
  }, []);

  return { assinaturas, salvarAssinatura, removerAssinatura };
}
