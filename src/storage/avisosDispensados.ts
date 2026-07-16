import { SQLiteDatabase } from 'expo-sqlite';
import { AnotacaoInvalida } from '../types';

// mes -> conjunto de chaves "titulo|valor|soma" já dispensadas pelo usuário
export type AvisosDispensados = Record<string, Set<string>>;

export function chaveAviso(item: Pick<AnotacaoInvalida, 'titulo' | 'valor' | 'soma'>): string {
  return `${item.titulo}|${item.valor.toFixed(2)}|${item.soma.toFixed(2)}`;
}

export async function loadAvisosDispensados(
  db: SQLiteDatabase,
  userId: string,
): Promise<AvisosDispensados> {
  const rows = await db.getAllAsync<{ mes: string; titulo: string; valor: number; soma: number }>(
    'SELECT mes, titulo, valor, soma FROM avisos_dispensados_v1 WHERE user_id = ?',
    userId,
  );
  const result: AvisosDispensados = {};
  for (const row of rows) {
    if (!result[row.mes]) result[row.mes] = new Set();
    result[row.mes].add(chaveAviso(row));
  }
  return result;
}

export async function dispensarAviso(
  db: SQLiteDatabase,
  userId: string,
  mes: string,
  item: AnotacaoInvalida,
): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO avisos_dispensados_v1 (user_id, mes, titulo, valor, soma) VALUES (?, ?, ?, ?, ?)',
    [userId, mes, item.titulo, item.valor, item.soma],
  );
}
