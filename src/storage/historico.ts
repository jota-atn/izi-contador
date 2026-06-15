import { SQLiteDatabase } from 'expo-sqlite';
import { RelatorioFatura } from '../types';

export async function loadMeses(db: SQLiteDatabase, userEmail: string): Promise<string[]> {
  const rows = await db.getAllAsync<{ mes: string }>(
    'SELECT mes FROM faturas_v2 WHERE user_id = ? ORDER BY mes DESC',
    userEmail,
  );
  return rows.map(r => r.mes);
}

export async function loadFatura(db: SQLiteDatabase, userEmail: string, mes: string): Promise<RelatorioFatura | null> {
  const row = await db.getFirstAsync<{ data: string }>(
    'SELECT data FROM faturas_v2 WHERE user_id = ? AND mes = ?',
    userEmail,
    mes,
  );
  return row ? (JSON.parse(row.data) as RelatorioFatura) : null;
}

export async function upsertFatura(db: SQLiteDatabase, userEmail: string, mes: string, data: RelatorioFatura): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO faturas_v2 (user_id, mes, data) VALUES (?, ?, ?)',
    userEmail,
    mes,
    JSON.stringify(data),
  );
}
