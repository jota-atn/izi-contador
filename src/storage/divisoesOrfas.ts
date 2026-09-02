import { SQLiteDatabase } from 'expo-sqlite';
import { EdicaoKey } from './edicoesFatura';
import { DivisaoItem } from './divisoesFatura';

export type DivisaoOrfa = DivisaoItem & { detectado_em: string };

export async function loadDivisoesOrfas(
  db: SQLiteDatabase,
  userId: string,
  mes: string,
): Promise<DivisaoOrfa[]> {
  const rows = await db.getAllAsync<{
    item_desc: string;
    item_data: string;
    item_valor: number;
    pessoa: string;
    valor: number;
    detectado_em: string;
  }>(
    'SELECT item_desc, item_data, item_valor, pessoa, valor, detectado_em FROM divisoes_orfas_v1 WHERE user_id = ? AND mes = ?',
    [userId, mes],
  );

  const porChave = new Map<string, DivisaoOrfa>();
  for (const r of rows) {
    const chave = `${r.item_desc}|${r.item_data}|${r.item_valor}`;
    if (!porChave.has(chave)) {
      porChave.set(chave, {
        item_desc: r.item_desc,
        item_data: r.item_data,
        item_valor: r.item_valor,
        shares: [],
        detectado_em: r.detectado_em,
      });
    }
    porChave.get(chave)!.shares.push({ pessoa: r.pessoa, valor: r.valor });
  }
  return [...porChave.values()];
}

export async function salvarDivisoesOrfas(
  db: SQLiteDatabase,
  userId: string,
  mes: string,
  orfas: DivisaoItem[],
): Promise<void> {
  const detectadoEm = new Date().toISOString();
  for (const item of orfas) {
    for (const { pessoa, valor } of item.shares) {
      await db.runAsync(
        `INSERT INTO divisoes_orfas_v1 (user_id, mes, item_desc, item_data, item_valor, pessoa, valor, detectado_em)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, mes, item_desc, item_data, item_valor, pessoa)
         DO UPDATE SET valor = excluded.valor, detectado_em = excluded.detectado_em`,
        [userId, mes, item.item_desc, item.item_data, item.item_valor, pessoa, valor, detectadoEm],
      );
    }
  }
}

export async function removerDivisaoOrfa(
  db: SQLiteDatabase,
  userId: string,
  key: EdicaoKey,
): Promise<void> {
  await db.runAsync(
    'DELETE FROM divisoes_orfas_v1 WHERE user_id = ? AND mes = ? AND item_desc = ? AND item_data = ? AND item_valor = ?',
    [userId, key.mes, key.item_desc, key.item_data, key.item_valor],
  );
}
