export const MESES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function formatMesAno(mes: string): string {
  const [year, month] = mes.split('-');
  return `${MESES_PT[parseInt(month, 10) - 1]} ${year}`;
}

export function formatMesAnoUpper(mes: string): string {
  return formatMesAno(mes).toUpperCase();
}

export function nomeMes(mes: string): string {
  const month = parseInt(mes.split('-')[1], 10);
  return (MESES_PT[month - 1] ?? mes).toLowerCase();
}

export function formatSincronizacao(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const hhmm = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const mesmoDia =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (mesmoDia) return `hoje às ${hhmm}`;

  const ontem = new Date(now);
  ontem.setDate(ontem.getDate() - 1);
  const diaAnterior =
    date.getDate() === ontem.getDate() &&
    date.getMonth() === ontem.getMonth() &&
    date.getFullYear() === ontem.getFullYear();

  if (diaAnterior) return `ontem às ${hhmm}`;

  const ddmm = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `${ddmm} às ${hhmm}`;
}
