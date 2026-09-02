import { Historico } from '../hooks/useHistorico';
import { SEM_CATEGORIA, SEM_CATEGORIA_LABEL } from '../parser/parseFatura';
import { nomeMes } from './meses';

function fmtBRL(v: number): string {
  return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
}

export function serializarHistorico(historico: Historico, meses: string[]): string {
  const mesesCron = [...meses].reverse(); // mais antigo primeiro

  return mesesCron
    .map((mes) => {
      const fatura = historico[mes];
      if (!fatura) return '';

      const [ano] = mes.split('-');
      const header = `=== ${nomeMes(mes).toUpperCase()} ${ano} — ${fmtBRL(fatura.total_fatura)} ===`;

      const pessoas = fatura.relatorio_por_pessoa
        .map((p) => {
          const dono = p.dono === SEM_CATEGORIA ? SEM_CATEGORIA_LABEL : p.dono;
          const itens = p.itens.map((i) => `${i.descricao} ${fmtBRL(i.valor)}`).join(' · ');
          return `${dono} (${fmtBRL(p.total_individual)}): ${itens}`;
        })
        .join('\n');

      return `${header}\n${pessoas}`;
    })
    .filter(Boolean)
    .join('\n\n');
}
