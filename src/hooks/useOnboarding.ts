import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

function key(email: string) {
  return `onboarding_done_v1_${email.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

export function useOnboarding(userEmail: string) {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    if (!userEmail) return;
    SecureStore.getItemAsync(key(userEmail)).then((v) => {
      if (!v) setMostrar(true);
    });
  }, [userEmail]);

  async function marcarVisto() {
    setMostrar(false);
    if (userEmail) await SecureStore.setItemAsync(key(userEmail), '1');
  }

  function rever() {
    setMostrar(true);
  }

  return { mostrar, marcarVisto, rever };
}
