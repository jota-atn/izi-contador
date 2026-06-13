import { useState, useEffect, useCallback } from 'react';
import { Categorias, DEFAULT_CATEGORIAS, loadCategorias, saveCategorias } from '../config/categorias';

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categorias>(DEFAULT_CATEGORIAS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCategorias().then((c) => {
      setCategorias(c);
      setLoaded(true);
    });
  }, []);

  const update = useCallback((next: Categorias) => {
    setCategorias(next);
    saveCategorias(next);
  }, []);

  const addKeyword = useCallback((categoria: string, keyword: string) => {
    setCategorias((prev) => {
      const kw = keyword.trim().toUpperCase();
      if (!kw || prev[categoria]?.includes(kw)) return prev;
      const next = { ...prev, [categoria]: [...(prev[categoria] ?? []), kw] };
      saveCategorias(next);
      return next;
    });
  }, []);

  const removeKeyword = useCallback((categoria: string, keyword: string) => {
    setCategorias((prev) => {
      const next = { ...prev, [categoria]: prev[categoria].filter((k) => k !== keyword) };
      saveCategorias(next);
      return next;
    });
  }, []);

  const addCategoria = useCallback((nome: string) => {
    const key = nome.trim().toUpperCase();
    if (!key) return;
    setCategorias((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: [] };
      saveCategorias(next);
      return next;
    });
  }, []);

  const removeCategoria = useCallback((nome: string) => {
    setCategorias((prev) => {
      const next = { ...prev };
      delete next[nome];
      saveCategorias(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    update(DEFAULT_CATEGORIAS);
  }, [update]);

  return { categorias, loaded, addKeyword, removeKeyword, addCategoria, removeCategoria, reset };
}
