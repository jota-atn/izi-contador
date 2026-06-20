import { Historico } from '../hooks/useHistorico';
import { nomeMes } from './meses';

const SEM_CATEGORIA = '__SEM_CATEGORIA__';

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
        .filter((p) => p.dono !== SEM_CATEGORIA)
        .map((p) => {
          const itens = p.itens.map((i) => `${i.descricao} ${fmtBRL(i.valor)}`).join(' · ');
          return `${p.dono} (${fmtBRL(p.total_individual)}): ${itens}`;
        })
        .join('\n');

      return `${header}\n${pessoas}`;
    })
    .filter(Boolean)
    .join('\n\n');
}
