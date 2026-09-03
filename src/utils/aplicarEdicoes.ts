import { Gasto, RelatorioFatura, RelatorioPessoa } from '../types';
import { Edicao } from '../storage/edicoesFatura';
import { chaveEdicao } from './reconciliarEdicoes';

function chave(item: Gasto): string {
  return chaveEdicao({ item_desc: item.descricao, item_data: item.data, item_valor: item.valor });
}

export function aplicarEdicoes(dados: RelatorioFatura, edicoes: Edicao[]): RelatorioFatura {
  if (edicoes.length === 0) return dados;

  const mapaEdicoes = new Map<string, Edicao>();
  for (const ed of edicoes) {
    mapaEdicoes.set(chaveEdicao(ed), ed);
  }

  const pessoasMap = new Map<string, RelatorioPessoa>();

  for (const pessoa of dados.relatorio_por_pessoa) {
    for (const item of pessoa.itens) {
      const ed = mapaEdicoes.get(chave(item));

      if (ed?.deletado) continue;

      const dono = ed?.novo_dono ?? pessoa.dono;
      const desc = ed?.nova_desc ?? item.descricao;
      const foiEditado = !!(ed?.novo_dono || ed?.nova_desc);
      const gastoFinal: Gasto = { ...item, descricao: desc, ...(foiEditado && { editado: true }) };

      if (!pessoasMap.has(dono)) {
        pessoasMap.set(dono, { dono, itens: [], total_individual: 0 });
      }
      const p = pessoasMap.get(dono)!;
      const existente = p.itens.find((i) => i.descricao === desc);
      if (existente) {
        existente.valor = parseFloat((existente.valor + item.valor).toFixed(2));
        if (foiEditado) existente.editado = true;
      } else {
        p.itens.push(gastoFinal);
      }
      p.total_individual = parseFloat((p.total_individual + item.valor).toFixed(2));
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
