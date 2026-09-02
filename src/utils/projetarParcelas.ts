import { RelatorioFatura } from '../types';

export interface ParcelaAberta {
  descricao: string;
  dono: string;
  valorMensal: number;
  atual: number;
  total: number;
  restantes: number;
}

// itens com parcela ainda em aberto (a última parcela, restantes === 0, não conta —
// ela já é o valor final, não sobra nada pros próximos meses)
export function listarParcelasAbertas(fatura: RelatorioFatura): ParcelaAberta[] {
  const abertas: ParcelaAberta[] = [];
  for (const pessoa of fatura.relatorio_por_pessoa) {
    for (const item of pessoa.itens) {
      if (!item.parcela) continue;
      const restantes = item.parcela.total - item.parcela.atual;
      if (restantes <= 0) continue;
      abertas.push({
        descricao: item.descricao,
        dono: pessoa.dono,
        valorMensal: item.valor,
        atual: item.parcela.atual,
        total: item.parcela.total,
        restantes,
      });
    }
  }
  return abertas;
}

export interface ComprometidoMes {
  mes: number; // daqui a quantos meses (1, 2, 3...)
  total: number;
}

// projeta, mês a mês, quanto já está garantido só de parcelamentos em andamento —
// para no mês da parcela mais longa
export function projetarComprometido(parcelas: ParcelaAberta[]): ComprometidoMes[] {
  if (parcelas.length === 0) return [];

  const maxRestantes = Math.max(...parcelas.map((p) => p.restantes));
  const projecao: ComprometidoMes[] = [];

  for (let mes = 1; mes <= maxRestantes; mes++) {
    const total = parcelas.filter((p) => p.restantes >= mes).reduce((s, p) => s + p.valorMensal, 0);
    projecao.push({ mes, total: parseFloat(total.toFixed(2)) });
  }

  return projecao;
}
