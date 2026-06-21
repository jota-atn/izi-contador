import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { RelatorioFatura } from '../types';
import { gerarPdfHtml } from './gerarPdfHtml';
import { formatMesAno } from './meses';

async function getIconBase64(): Promise<string> {
  try {
    const asset = Asset.fromModule(require('../../assets/icon.png'));
    await asset.downloadAsync();
    if (!asset.localUri) return '';
    return await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch {
    return '';
  }
}

export async function exportarPdf(
  dados: RelatorioFatura,
  estadoPorPessoa: Record<string, { pago: boolean }>,
): Promise<void> {
  const iconBase64 = await getIconBase64();
  const html = gerarPdfHtml(dados, estadoPorPessoa, iconBase64);
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Fatura ${formatMesAno(dados.mes)}`,
    UTI: 'com.adobe.pdf',
  });
}
