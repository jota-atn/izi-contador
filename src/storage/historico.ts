import { RelatorioFatura } from '../types';
import { getDb } from './db';

export async function loadMeses(userEmail: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ mes: string }>(
    'SELECT mes FROM faturas_v2 WHERE user_id = ? ORDER BY mes DESC',
    userEmail,
  );
  return rows.map(r => r.mes);
}

export async function loadFatura(userEmail: string, mes: string): Promise<RelatorioFatura | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ data: string }>(
    'SELECT data FROM faturas_v2 WHERE user_id = ? AND mes = ?',
    userEmail,
    mes,
  );
  return row ? (JSON.parse(row.data) as RelatorioFatura) : null;
}

export async function upsertFatura(userEmail: string, mes: string, data: RelatorioFatura): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO faturas_v2 (user_id, mes, data) VALUES (?, ?, ?)',
    userEmail,
    mes,
    JSON.stringify(data),
  );
}
