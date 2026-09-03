import { SQLiteDatabase } from 'expo-sqlite';
import { EdicaoKey } from './edicoesFatura';

export interface DivisaoShare {
  pessoa: string;
  valor: number;
}

export interface DivisaoItem {
  item_desc: string;
  item_data: string;
  item_valor: number;
  shares: DivisaoShare[];
}

export async function loadDivisoes(
  db: SQLiteDatabase,
  userId: string,
  mes: string,
): Promise<DivisaoItem[]> {
  const rows = await db.getAllAsync<{
    item_desc: string;
    item_data: string;
    item_valor: number;
    pessoa: string;
    valor: number;
  }>(
    'SELECT item_desc, item_data, item_valor, pessoa, valor FROM divisoes_v1 WHERE user_id = ? AND mes = ?',
    [userId, mes],
  );

  const porChave = new Map<string, DivisaoItem>();
  for (const r of rows) {
    const chave = `${r.item_desc}|${r.item_data}|${r.item_valor}`;
    if (!porChave.has(chave)) {
      porChave.set(chave, {
        item_desc: r.item_desc,
        item_data: r.item_data,
        item_valor: r.item_valor,
        shares: [],
      });
    }
    porChave.get(chave)!.shares.push({ pessoa: r.pessoa, valor: r.valor });
  }
  return [...porChave.values()];
}

export async function loadDivisoesTodosMeses(
  db: SQLiteDatabase,
  userId: string,
): Promise<Record<string, DivisaoItem[]>> {
  const rows = await db.getAllAsync<{
    mes: string;
    item_desc: string;
    item_data: string;
    item_valor: number;
    pessoa: string;
    valor: number;
  }>(
    'SELECT mes, item_desc, item_data, item_valor, pessoa, valor FROM divisoes_v1 WHERE user_id = ?',
    userId,
  );

  const porMes: Record<string, Map<string, DivisaoItem>> = {};
  for (const r of rows) {
    const porChave = (porMes[r.mes] ??= new Map());
    const chave = `${r.item_desc}|${r.item_data}|${r.item_valor}`;
    if (!porChave.has(chave)) {
      porChave.set(chave, {
        item_desc: r.item_desc,
        item_data: r.item_data,
        item_valor: r.item_valor,
        shares: [],
      });
    }
    porChave.get(chave)!.shares.push({ pessoa: r.pessoa, valor: r.valor });
  }

  const resultado: Record<string, DivisaoItem[]> = {};
  for (const [mes, mapa] of Object.entries(porMes)) {
    resultado[mes] = [...mapa.values()];
  }
  return resultado;
}

// substitui completamente as fatias de um item (apaga as antigas, insere as novas)
export async function salvarDivisao(
  db: SQLiteDatabase,
  userId: string,
  mes: string,
  key: Omit<EdicaoKey, 'mes'>,
  shares: DivisaoShare[],
): Promise<void> {
  if (key.item_data === 'Agrupado') {
    // item agrupado por categoria tem valor variável (soma do mês) — ignora o
    // valor pra não deixar fatias antigas (com soma desatualizada) órfãs na tabela
    await db.runAsync(
      'DELETE FROM divisoes_v1 WHERE user_id = ? AND mes = ? AND item_desc = ? AND item_data = ?',
      [userId, mes, key.item_desc, key.item_data],
    );
  } else {
    await db.runAsync(
      'DELETE FROM divisoes_v1 WHERE user_id = ? AND mes = ? AND item_desc = ? AND item_data = ? AND item_valor = ?',
      [userId, mes, key.item_desc, key.item_data, key.item_valor],
    );
  }
  for (const { pessoa, valor } of shares) {
    await db.runAsync(
      'INSERT INTO divisoes_v1 (user_id, mes, item_desc, item_data, item_valor, pessoa, valor) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, mes, key.item_desc, key.item_data, key.item_valor, pessoa, valor],
    );
  }
}

export async function removerDivisao(
  db: SQLiteDatabase,
  userId: string,
  key: EdicaoKey,
): Promise<void> {
  await db.runAsync(
    'DELETE FROM divisoes_v1 WHERE user_id = ? AND mes = ? AND item_desc = ? AND item_data = ? AND item_valor = ?',
    [userId, key.mes, key.item_desc, key.item_data, key.item_valor],
  );
}
