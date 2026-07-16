import { useCallback, useEffect, useRef, useState } from 'react';
import { loadPixKey, savePixKey } from '../config/pixKey';

export function usePixKey(userEmail: string) {
  const [pixKey, setPixKey] = useState('');
  const emailRef = useRef(userEmail);
  useEffect(() => {
    emailRef.current = userEmail;
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setPixKey('');
      return;
    }
    loadPixKey(userEmail).then(setPixKey);
  }, [userEmail]);

  const salvarPixKey = useCallback(async (value: string) => {
    const trimmed = value.trim();
    await savePixKey(emailRef.current, trimmed);
    setPixKey(trimmed);
  }, []);

  return { pixKey, salvarPixKey };
}
