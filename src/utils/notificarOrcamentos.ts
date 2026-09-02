import * as Notifications from 'expo-notifications';
import { StatusOrcamento, categoriasParaAlertar } from './verificarOrcamentos';

export async function notificarOrcamentosEstourados(
  status: StatusOrcamento[],
  mes: string,
  jaAlertado: (mes: string, categoria: string) => boolean,
  marcarAlertado: (mes: string, categoria: string) => void,
): Promise<void> {
  const paraAlertar = categoriasParaAlertar(status, mes, jaAlertado);
  if (paraAlertar.length === 0) return;

  try {
    const { status: permStatus } = await Notifications.getPermissionsAsync();
    if (permStatus !== 'granted') {
      const { status: novoStatus } = await Notifications.requestPermissionsAsync();
      if (novoStatus !== 'granted') return;
    }

    for (const s of paraAlertar) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Cuidado com os gastos!',
          body: `R$ ${s.total.toFixed(0)} de R$ ${s.limite.toFixed(0)} em ${s.categoria}`,
        },
        trigger: null,
      });
      marcarAlertado(mes, s.categoria);
    }
  } catch (e) {
    console.error('[notificarOrcamentos] falhou:', e);
  }
}
