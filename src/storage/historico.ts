import { RelatorioFatura } from '../types';
import { getDb } from './db';

export async function loadMeses(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ mes: string }>('SELECT mes FROM faturas ORDER BY mes DESC');
  return rows.map(r => r.mes);
}

export async function loadFatura(mes: string): Promise<RelatorioFatura | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ data: string }>(
    'SELECT data FROM faturas WHERE mes = ?',
    mes,
  );
  return row ? (JSON.parse(row.data) as RelatorioFatura) : null;
}

export async function upsertFatura(mes: string, data: RelatorioFatura): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO faturas (mes, data) VALUES (?, ?)',
    mes,
    JSON.stringify(data),
  );
}
