import { Historico } from '../hooks/useHistorico';
import { Categorias } from '../config/categorias';
import { gerarCsv } from './gerarCsv';

export async function exportarCsv(
  historico: Historico,
  meses: string[],
  categorias: Categorias,
  getEstado: (mes: string, dono: string) => { pago: boolean },
): Promise<void> {
  const { shareAsync } = await import('expo-sharing');
  const { writeAsStringAsync, cacheDirectory } = await import('expo-file-system/legacy');

  const csv = gerarCsv(historico, meses, categorias, getEstado);
  const dataStr = new Date().toISOString().slice(0, 10);
  const nomeArquivo = `izicontador-${dataStr}.csv`;
  const uri = `${cacheDirectory ?? ''}${nomeArquivo}`;

  await writeAsStringAsync(uri, csv);

  await shareAsync(uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Planilha do IziContador',
    UTI: 'public.comma-separated-values-text',
  });
}
