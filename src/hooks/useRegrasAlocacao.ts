import { useState, useEffect, useCallback, useRef } from 'react';
import { RegrasAlocacao, loadRegras, saveRegras } from '../config/regrasAlocacao';

export function useRegrasAlocacao(userEmail: string) {
  const [regras, setRegras] = useState<RegrasAlocacao>({});
  const emailRef = useRef(userEmail);
  useEffect(() => { emailRef.current = userEmail; }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setRegras({});
      return;
    }
    loadRegras(userEmail).then(setRegras);
  }, [userEmail]);

  const addRegra = useCallback((keyword: string, pessoa: string) => {
    const kw = keyword.trim().toUpperCase();
    const p = pessoa.trim();
    if (!kw || !p) return;
    setRegras((prev) => {
      const next = { ...prev, [kw]: p };
      saveRegras(emailRef.current, next);
      return next;
    });
  }, []);

  const removeRegra = useCallback((keyword: string) => {
    setRegras((prev) => {
      const { [keyword]: _, ...next } = prev;
      saveRegras(emailRef.current, next);
      return next;
    });
  }, []);

  return { regras, addRegra, removeRegra };
}
