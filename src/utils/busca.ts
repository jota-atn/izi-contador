import { RelatorioPessoa } from '../types';

function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export interface PessoaFiltrada {
  pessoa: RelatorioPessoa;
  totalItensOriginais: number;
}

export function filtrarPessoas(
  pessoas: RelatorioPessoa[],
  termo: string,
): { pessoasFiltradas: PessoaFiltrada[]; totalItens: number; totalFiltrados: number } {
  const totalItens = pessoas.reduce((s, p) => s + p.itens.length, 0);

  if (!termo.trim()) {
    return {
      pessoasFiltradas: pessoas.map((p) => ({ pessoa: p, totalItensOriginais: p.itens.length })),
      totalItens,
      totalFiltrados: totalItens,
    };
  }

  const termoNorm = normalizar(termo.trim());
  let totalFiltrados = 0;
  const pessoasFiltradas: PessoaFiltrada[] = [];

  for (const p of pessoas) {
    const itensFiltrados = p.itens.filter((i) => normalizar(i.descricao).includes(termoNorm));
    if (itensFiltrados.length === 0) continue;

    totalFiltrados += itensFiltrados.length;
    pessoasFiltradas.push({
      totalItensOriginais: p.itens.length,
      pessoa: {
        ...p,
        itens: itensFiltrados,
        total_individual: parseFloat(itensFiltrados.reduce((s, i) => s + i.valor, 0).toFixed(2)),
      },
    });
  }

  return { pessoasFiltradas, totalItens, totalFiltrados };
}
