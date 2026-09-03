import { Gasto, RelatorioFatura, RelatorioPessoa } from '../types';
import { DivisaoItem } from '../storage/divisoesFatura';
import { chaveEdicao } from './reconciliarEdicoes';

function chave(item: Gasto): string {
  return chaveEdicao({ item_desc: item.descricao, item_data: item.data, item_valor: item.valor });
}

export function aplicarDivisoes(dados: RelatorioFatura, divisoes: DivisaoItem[]): RelatorioFatura {
  if (divisoes.length === 0) return dados;

  const mapaDivisoes = new Map<string, DivisaoItem>();
  for (const d of divisoes) {
    mapaDivisoes.set(chaveEdicao(d), d);
  }

  const pessoasMap = new Map<string, RelatorioPessoa>();

  function adicionar(dono: string, gasto: Gasto) {
    if (!pessoasMap.has(dono)) {
      pessoasMap.set(dono, { dono, itens: [], total_individual: 0 });
    }
    const p = pessoasMap.get(dono)!;
    const existente = p.itens.find((i) => i.descricao === gasto.descricao);
    if (existente) {
      existente.valor = parseFloat((existente.valor + gasto.valor).toFixed(2));
    } else {
      p.itens.push(gasto);
    }
    p.total_individual = parseFloat((p.total_individual + gasto.valor).toFixed(2));
  }

  for (const pessoa of dados.relatorio_por_pessoa) {
    for (const item of pessoa.itens) {
      const divisao = mapaDivisoes.get(chave(item));

      if (!divisao) {
        adicionar(pessoa.dono, item);
        continue;
      }

      const origemDivisao = {
        item_desc: divisao.item_desc,
        item_data: divisao.item_data,
        item_valor: divisao.item_valor,
      };

      let somaFatias = 0;
      for (const { pessoa: nomeFatia, valor } of divisao.shares) {
        somaFatias = parseFloat((somaFatias + valor).toFixed(2));
        adicionar(nomeFatia, {
          descricao: `${item.descricao} - ${nomeFatia}`,
          valor,
          data: item.data,
          dividido: true,
          origemDivisao,
        });
      }

      // soma menor que o total → o restante fica implícito com o dono atual;
      // soma maior é válida (acerto intencional, mesma regra do parser de texto)
      const restante = parseFloat((item.valor - somaFatias).toFixed(2));
      if (restante > 0.01) {
        adicionar(pessoa.dono, {
          descricao: `${item.descricao} - ${pessoa.dono}`,
          valor: restante,
          data: item.data,
          dividido: true,
          origemDivisao,
        });
      }
    }
  }

  const total_fatura = parseFloat(
    [...pessoasMap.values()].reduce((s, p) => s + p.total_individual, 0).toFixed(2),
  );

  return {
    ...dados,
    total_fatura,
    relatorio_por_pessoa: [...pessoasMap.values()],
  };
}
