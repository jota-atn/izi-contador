import { useState, useEffect, useCallback } from 'react';
import { RegrasAlocacao, loadRegras, saveRegras } from '../config/regrasAlocacao';

export function useRegrasAlocacao() {
  const [regras, setRegras] = useState<RegrasAlocacao>({});

  useEffect(() => {
    loadRegras().then(setRegras);
  }, []);

  const addRegra = useCallback((keyword: string, pessoa: string) => {
    const kw = keyword.trim().toUpperCase();
    const p = pessoa.trim();
    if (!kw || !p) return;
    setRegras((prev) => {
      const next = { ...prev, [kw]: p };
      saveRegras(next);
      return next;
    });
  }, []);

  const removeRegra = useCallback((keyword: string) => {
    setRegras((prev) => {
      const { [keyword]: _, ...next } = prev;
      saveRegras(next);
      return next;
    });
  }, []);

  return { regras, addRegra, removeRegra };
}
