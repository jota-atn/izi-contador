import { SQLiteDatabase } from 'expo-sqlite';
import { Edicao, EdicaoKey } from './edicoesFatura';

export type EdicaoOrfa = Edicao & { detectado_em: string };

export async function loadOrfas(
  db: SQLiteDatabase,
  userId: string,
  mes: string,
): Promise<EdicaoOrfa[]> {
  const rows = await db.getAllAsync<{
    mes: string;
    item_desc: string;
    item_data: string;
    item_valor: number;
    novo_dono: string | null;
    nova_desc: string | null;
    deletado: number;
    detectado_em: string;
  }>(
    'SELECT mes, item_desc, item_data, item_valor, novo_dono, nova_desc, deletado, detectado_em FROM edicoes_orfas_v1 WHERE user_id = ? AND mes = ?',
    [userId, mes],
  );
  return rows.map((r) => ({ ...r, deletado: r.deletado === 1 }));
}

export async function salvarOrfas(
  db: SQLiteDatabase,
  userId: string,
  orfas: Edicao[],
): Promise<void> {
  const detectadoEm = new Date().toISOString();
  for (const ed of orfas) {
    await db.runAsync(
      `INSERT INTO edicoes_orfas_v1 (user_id, mes, item_desc, item_data, item_valor, novo_dono, nova_desc, deletado, detectado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, mes, item_desc, item_data, item_valor)
       DO UPDATE SET novo_dono = excluded.novo_dono, nova_desc = excluded.nova_desc,
         deletado = excluded.deletado, detectado_em = excluded.detectado_em`,
      [
        userId,
        ed.mes,
        ed.item_desc,
        ed.item_data,
        ed.item_valor,
        ed.novo_dono,
        ed.nova_desc,
        ed.deletado ? 1 : 0,
        detectadoEm,
      ],
    );
  }
}

export async function removerOrfa(
  db: SQLiteDatabase,
  userId: string,
  key: EdicaoKey,
): Promise<void> {
  await db.runAsync(
    'DELETE FROM edicoes_orfas_v1 WHERE user_id = ? AND mes = ? AND item_desc = ? AND item_data = ? AND item_valor = ?',
    [userId, key.mes, key.item_desc, key.item_data, key.item_valor],
  );
}
