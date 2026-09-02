import { SQLiteDatabase } from 'expo-sqlite';
import { RelatorioFatura } from '../types';
import { deleteEdicao, loadEdicoes } from '../storage/edicoesFatura';
import { salvarOrfas } from '../storage/edicoesOrfas';
import { loadDivisoes, removerDivisao } from '../storage/divisoesFatura';
import { salvarDivisoesOrfas } from '../storage/divisoesOrfas';
import { chaveEdicao, reconciliarEdicoes } from './reconciliarEdicoes';

// ao ressincronizar e a fatura mudar, preserva as edições cuja chave (desc|data|valor)
// ainda existe nos itens novos, e move as que não existem mais pra edicoes_orfas_v1 —
// em vez de apagar todas as edições do mês de uma vez.
export async function reconciliarEdicoesResync(
  db: SQLiteDatabase,
  userId: string,
  mes: string,
  dadosNovos: RelatorioFatura,
): Promise<{ houveOrfas: boolean }> {
  const edicoes = await loadEdicoes(db, userId, mes);
  if (edicoes.length === 0) return { houveOrfas: false };

  const itensValidos = new Set(
    dadosNovos.relatorio_por_pessoa.flatMap((p) =>
      p.itens.map((i) =>
        chaveEdicao({ item_desc: i.descricao, item_data: i.data, item_valor: i.valor }),
      ),
    ),
  );

  const { orfas } = reconciliarEdicoes(edicoes, itensValidos);
  if (orfas.length === 0) return { houveOrfas: false };

  for (const ed of orfas) {
    await deleteEdicao(db, userId, ed);
  }
  await salvarOrfas(db, userId, orfas);

  return { houveOrfas: true };
}

// mesma lógica de reconciliarEdicoesResync, mas pra divisoes_v1
export async function reconciliarDivisoesResync(
  db: SQLiteDatabase,
  userId: string,
  mes: string,
  dadosNovos: RelatorioFatura,
): Promise<{ houveOrfas: boolean }> {
  const divisoes = await loadDivisoes(db, userId, mes);
  if (divisoes.length === 0) return { houveOrfas: false };

  const itensValidos = new Set(
    dadosNovos.relatorio_por_pessoa.flatMap((p) =>
      p.itens.map((i) =>
        chaveEdicao({ item_desc: i.descricao, item_data: i.data, item_valor: i.valor }),
      ),
    ),
  );

  const { orfas } = reconciliarEdicoes(divisoes, itensValidos);
  if (orfas.length === 0) return { houveOrfas: false };

  for (const item of orfas) {
    await removerDivisao(db, userId, { mes, ...item });
  }
  await salvarDivisoesOrfas(db, userId, mes, orfas);

  return { houveOrfas: true };
}
