import { SQLiteDatabase } from 'expo-sqlite';

export interface EstadoPessoa {
  oculto: boolean;
  pago: boolean;
}

export type EstadoFaturas = Record<string, Record<string, EstadoPessoa>>;

export async function loadEstado(db: SQLiteDatabase, userEmail: string): Promise<EstadoFaturas> {
  const rows = await db.getAllAsync<{ mes: string; dono: string; oculto: number; pago: number }>(
    'SELECT mes, dono, oculto, pago FROM estado_v2 WHERE user_id = ?',
    userEmail,
  );
  const result: EstadoFaturas = {};
  for (const row of rows) {
    if (!result[row.mes]) result[row.mes] = {};
    result[row.mes][row.dono] = { oculto: row.oculto === 1, pago: row.pago === 1 };
  }
  return result;
}

export async function upsertEstadoPessoa(
  db: SQLiteDatabase,
  userEmail: string,
  mes: string,
  dono: string,
  estado: EstadoPessoa,
): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO estado_v2 (user_id, mes, dono, oculto, pago) VALUES (?, ?, ?, ?, ?)',
    userEmail,
    mes,
    dono,
    estado.oculto ? 1 : 0,
    estado.pago ? 1 : 0,
  );
}
