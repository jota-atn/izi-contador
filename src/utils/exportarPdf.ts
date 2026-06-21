import { RelatorioFatura } from '../types';
import { gerarPdfHtml } from './gerarPdfHtml';
import { formatMesAno } from './meses';

async function getIconBase64(): Promise<string> {
  try {
    const { Asset } = await import('expo-asset');
    const { readAsStringAsync, EncodingType } = await import('expo-file-system/legacy');
    const asset = Asset.fromModule(require('../../assets/icon.png'));
    await asset.downloadAsync();
    if (!asset.localUri) return '';
    return await readAsStringAsync(asset.localUri, { encoding: EncodingType.Base64 });
  } catch {
    return '';
  }
}

export async function exportarPdf(
  dados: RelatorioFatura,
  estadoPorPessoa: Record<string, { pago: boolean }>,
): Promise<void> {
  const { printToFileAsync } = await import('expo-print');
  const { shareAsync } = await import('expo-sharing');
  const { moveAsync, cacheDirectory } = await import('expo-file-system/legacy');

  const iconBase64 = await getIconBase64();
  const html = gerarPdfHtml(dados, estadoPorPessoa, iconBase64);
  const { uri: tempUri } = await printToFileAsync({ html });

  const nomeArquivo = `IziContador - Fatura ${formatMesAno(dados.mes)}.pdf`;
  const uri = `${cacheDirectory ?? ''}${nomeArquivo}`;
  await moveAsync({ from: tempUri, to: uri });

  await shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Fatura ${formatMesAno(dados.mes)}`,
    UTI: 'com.adobe.pdf',
  });
}
