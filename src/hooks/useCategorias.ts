import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Categorias,
  DEFAULT_CATEGORIAS,
  loadCategorias,
  saveCategorias,
} from '../config/categorias';

export function useCategorias(userEmail: string) {
  const [categorias, setCategorias] = useState<Categorias>(DEFAULT_CATEGORIAS);
  const [loaded, setLoaded] = useState(false);
  const emailRef = useRef(userEmail);
  useEffect(() => {
    emailRef.current = userEmail;
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setCategorias(DEFAULT_CATEGORIAS);
      setLoaded(false);
      return;
    }
    loadCategorias(userEmail).then((c) => {
      setCategorias(c);
      setLoaded(true);
    });
  }, [userEmail]);

  const update = useCallback((next: Categorias) => {
    setCategorias(next);
    saveCategorias(emailRef.current, next);
  }, []);

  const addKeyword = useCallback((categoria: string, keyword: string) => {
    setCategorias((prev) => {
      const kw = keyword.trim().toUpperCase();
      if (!kw || prev[categoria]?.includes(kw)) return prev;
      const next = { ...prev, [categoria]: [...(prev[categoria] ?? []), kw] };
      saveCategorias(emailRef.current, next);
      return next;
    });
  }, []);

  const removeKeyword = useCallback((categoria: string, keyword: string) => {
    setCategorias((prev) => {
      const next = { ...prev, [categoria]: prev[categoria].filter((k) => k !== keyword) };
      saveCategorias(emailRef.current, next);
      return next;
    });
  }, []);

  const addCategoria = useCallback((nome: string) => {
    const key = nome.trim().toUpperCase();
    if (!key) return;
    setCategorias((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: [] };
      saveCategorias(emailRef.current, next);
      return next;
    });
  }, []);

  const removeCategoria = useCallback((nome: string) => {
    setCategorias((prev) => {
      const next = { ...prev };
      delete next[nome];
      saveCategorias(emailRef.current, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    update(DEFAULT_CATEGORIAS);
  }, [update]);

  return { categorias, loaded, addKeyword, removeKeyword, addCategoria, removeCategoria, reset };
}
