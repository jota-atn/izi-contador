import { getDb } from './db';

export interface EstadoPessoa {
  oculto: boolean;
  pago: boolean;
}

export type EstadoFaturas = Record<string, Record<string, EstadoPessoa>>;

export async function loadEstado(): Promise<EstadoFaturas> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ mes: string; dono: string; oculto: number; pago: number }>(
    'SELECT mes, dono, oculto, pago FROM estado_pessoa',
  );
  const result: EstadoFaturas = {};
  for (const row of rows) {
    if (!result[row.mes]) result[row.mes] = {};
    result[row.mes][row.dono] = { oculto: row.oculto === 1, pago: row.pago === 1 };
  }
  return result;
}

export async function upsertEstadoPessoa(
  mes: string,
  dono: string,
  estado: EstadoPessoa,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO estado_pessoa (mes, dono, oculto, pago) VALUES (?, ?, ?, ?)',
    mes,
    dono,
    estado.oculto ? 1 : 0,
    estado.pago ? 1 : 0,
  );
}
