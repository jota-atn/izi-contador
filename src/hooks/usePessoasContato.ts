import { useState, useEffect, useCallback, useRef } from 'react';
import { PessoasContato, loadPessoasContato, savePessoasContato } from '../config/pessoasContato';

export function usePessoasContato(userEmail: string) {
  const [contatos, setContatos] = useState<PessoasContato>({});
  const [loaded, setLoaded] = useState(false);
  const emailRef = useRef(userEmail);
  useEffect(() => {
    emailRef.current = userEmail;
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setContatos({});
      setLoaded(false);
      return;
    }
    loadPessoasContato(userEmail).then((c) => {
      setContatos(c);
      setLoaded(true);
    });
  }, [userEmail]);

  const persist = (next: PessoasContato) => {
    savePessoasContato(emailRef.current, next).catch((e) =>
      console.error('[usePessoasContato] savePessoasContato falhou:', e),
    );
  };

  const salvarContato = useCallback((nome: string, email: string) => {
    const nomeKey = nome.trim().toUpperCase();
    const emailTrim = email.trim();
    if (!nomeKey) return;
    setContatos((prev) => {
      const next = { ...prev, [nomeKey]: emailTrim };
      persist(next);
      return next;
    });
  }, []);

  const removerContato = useCallback((nome: string) => {
    const nomeKey = nome.trim().toUpperCase();
    setContatos((prev) => {
      const { [nomeKey]: _removido, ...next } = prev;
      persist(next);
      return next;
    });
  }, []);

  return { contatos, loaded, salvarContato, removerContato };
}
