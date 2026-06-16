import { RelatorioFatura } from '../types';

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

export function hashFatura(data: RelatorioFatura): string {
  const itens = data.relatorio_por_pessoa
    .flatMap((p) => p.itens.map((i) => `${i.descricao}|${i.data}|${i.valor}`))
    .sort()
    .join(',');
  return `${data.total_fatura}:${djb2(itens)}`;
}
