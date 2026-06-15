export const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
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
