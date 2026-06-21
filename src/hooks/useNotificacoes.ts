import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

function keyDia(email: string) {
  return `notif_dia_v1_${email.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

function keyId(email: string) {
  return `notif_id_v1_${email.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

async function cancelarAnterior(email: string) {
  const id = await SecureStore.getItemAsync(keyId(email));
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await SecureStore.deleteItemAsync(keyId(email));
  }
}

export function useNotificacoes(userEmail: string) {
  const [diaFechamento, setDiaFechamento] = useState<number | null>(null);

  useEffect(() => {
    if (!userEmail) return;
    SecureStore.getItemAsync(keyDia(userEmail)).then((v) => {
      if (v) setDiaFechamento(parseInt(v, 10));
    });
  }, [userEmail]);

  const salvar = useCallback(
    async (dia: number) => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') throw new Error('permission_denied');

      await cancelarAnterior(userEmail);

      // Notifica 1 dia antes do fechamento (dia 1 → notifica no dia 28)
      const diaNotif = dia <= 1 ? 28 : dia - 1;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Ei! Sua fatura fecha amanhã',
          body: 'Bora organizar as contas?',
        },
        trigger: {
          type: SchedulableTriggerInputTypes.CALENDAR,
          repeats: true,
          day: diaNotif,
          hour: 9,
          minute: 0,
        },
      });

      await SecureStore.setItemAsync(keyDia(userEmail), String(dia));
      await SecureStore.setItemAsync(keyId(userEmail), id);
      setDiaFechamento(dia);
    },
    [userEmail],
  );

  const cancelar = useCallback(async () => {
    await cancelarAnterior(userEmail);
    await SecureStore.deleteItemAsync(keyDia(userEmail));
    setDiaFechamento(null);
  }, [userEmail]);

  return { diaFechamento, salvar, cancelar };
}
