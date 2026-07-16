import { SQLiteDatabase } from 'expo-sqlite';
import { gerarBackup, validarBackup, restaurarBackup, BackupData } from '../storage/backup';

export async function exportarBackup(db: SQLiteDatabase, userEmail: string): Promise<void> {
  const { shareAsync } = await import('expo-sharing');
  const { writeAsStringAsync, cacheDirectory } = await import('expo-file-system/legacy');

  const backup = await gerarBackup(db, userEmail);
  const dataStr = new Date().toISOString().slice(0, 10);
  const nomeArquivo = `izicontador-backup-${dataStr}.json`;
  const uri = `${cacheDirectory ?? ''}${nomeArquivo}`;

  await writeAsStringAsync(uri, JSON.stringify(backup, null, 2));

  await shareAsync(uri, {
    mimeType: 'application/json',
    dialogTitle: 'Backup do IziContador',
    UTI: 'public.json',
  });
}

// retorna null se o usuário cancelou a seleção do arquivo
export async function importarBackup(
  db: SQLiteDatabase,
  userEmail: string,
): Promise<BackupData | null> {
  const DocumentPicker = await import('expo-document-picker');
  const { readAsStringAsync } = await import('expo-file-system/legacy');

  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', '*/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || result.assets.length === 0) return null;

  const conteudo = await readAsStringAsync(result.assets[0].uri);
  const backup = validarBackup(JSON.parse(conteudo));
  await restaurarBackup(db, userEmail, backup);
  return backup;
}
