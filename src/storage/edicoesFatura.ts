import { SQLiteDatabase } from 'expo-sqlite';

export interface EdicaoKey {
  mes: string;
  item_desc: string;
  item_data: string;
  item_valor: number;
}

export interface Edicao extends EdicaoKey {
  novo_dono: string | null;
  nova_desc: string | null;
  deletado: boolean;
}

export async function loadEdicoes(db: SQLiteDatabase, userId: string, mes: string): Promise<Edicao[]> {
  const rows = await db.getAllAsync<{
    mes: string;
    item_desc: string;
    item_data: string;
    item_valor: number;
    novo_dono: string | null;
    nova_desc: string | null;
    deletado: number;
  }>(
    'SELECT mes, item_desc, item_data, item_valor, novo_dono, nova_desc, deletado FROM edicoes_v1 WHERE user_id = ? AND mes = ?',
    [userId, mes],
  );
  return rows.map(r => ({ ...r, deletado: r.deletado === 1 }));
}

export async function upsertEdicao(db: SQLiteDatabase, userId: string, ed: Edicao): Promise<void> {
  await db.runAsync(
    `INSERT INTO edicoes_v1 (user_id, mes, item_desc, item_data, item_valor, novo_dono, nova_desc, deletado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, mes, item_desc, item_data, item_valor)
     DO UPDATE SET novo_dono = excluded.novo_dono, nova_desc = excluded.nova_desc, deletado = excluded.deletado`,
    [userId, ed.mes, ed.item_desc, ed.item_data, ed.item_valor, ed.novo_dono, ed.nova_desc, ed.deletado ? 1 : 0],
  );
}

export async function deleteEdicao(db: SQLiteDatabase, userId: string, key: EdicaoKey): Promise<void> {
  await db.runAsync(
    'DELETE FROM edicoes_v1 WHERE user_id = ? AND mes = ? AND item_desc = ? AND item_data = ? AND item_valor = ?',
    [userId, key.mes, key.item_desc, key.item_data, key.item_valor],
  );
}

export async function clearEdicoesMes(db: SQLiteDatabase, userId: string, mes: string): Promise<void> {
  await db.runAsync('DELETE FROM edicoes_v1 WHERE user_id = ? AND mes = ?', [userId, mes]);
}
