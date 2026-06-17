import { useCallback, useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

function storeKey(email: string) {
  return `pix_key_v1_${email.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

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
    SecureStore.getItemAsync(storeKey(userEmail)).then((v) => setPixKey(v ?? ''));
  }, [userEmail]);

  const salvarPixKey = useCallback(async (value: string) => {
    const trimmed = value.trim();
    await SecureStore.setItemAsync(storeKey(emailRef.current), trimmed);
    setPixKey(trimmed);
  }, []);

  return { pixKey, salvarPixKey };
}
