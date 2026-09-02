import { Historico } from '../hooks/useHistorico';
import { Categorias } from '../config/categorias';
import { categorizarGasto } from './categorizarGasto';

const COLUNAS = [
  'mes',
  'dono',
  'descricao',
  'categoria',
  'data',
  'valor',
  'pago',
  'dividido',
  'editado',
];

function escapeCsv(valor: string | number | boolean): string {
  const str = String(valor);
  return `"${str.replace(/"/g, '""')}"`;
}

export function gerarCsv(
  historico: Historico,
  meses: string[],
  categorias: Categorias,
  getEstado: (mes: string, dono: string) => { pago: boolean },
): string {
  const linhas = [COLUNAS.join(',')];

  // cronológico (mais antigo primeiro) — mais natural pra planilha
  const mesesCron = [...meses].reverse();

  for (const mes of mesesCron) {
    const fatura = historico[mes];
    if (!fatura) continue;

    for (const pessoa of fatura.relatorio_por_pessoa) {
      const pago = getEstado(mes, pessoa.dono).pago;
      for (const item of pessoa.itens) {
        linhas.push(
          [
            mes,
            pessoa.dono,
            item.descricao,
            categorizarGasto(item.descricao, categorias),
            item.data,
            item.valor,
            pago,
            !!item.dividido,
            !!item.editado,
          ]
            .map(escapeCsv)
            .join(','),
        );
      }
    }
  }

  return linhas.join('\n');
}
