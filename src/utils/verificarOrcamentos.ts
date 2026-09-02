import { RelatorioFatura } from '../types';
import { Categorias } from '../config/categorias';
import { Orcamentos } from '../config/orcamentos';
import { categorizarGasto } from './categorizarGasto';

export const LIMIAR_ALERTA = 0.9; // 90% do limite

export interface StatusOrcamento {
  categoria: string;
  total: number;
  limite: number;
  pct: number; // total / limite
}

// soma os itens da fatura por categoria e cruza com os limites configurados —
// só entram categorias que têm limite definido em `orcamentos`
export function verificarOrcamentos(
  fatura: RelatorioFatura,
  categorias: Categorias,
  orcamentos: Orcamentos,
): StatusOrcamento[] {
  const totais: Record<string, number> = {};
  for (const pessoa of fatura.relatorio_por_pessoa) {
    for (const item of pessoa.itens) {
      const categoria = categorizarGasto(item.descricao, categorias);
      totais[categoria] = (totais[categoria] ?? 0) + item.valor;
    }
  }

  return Object.entries(orcamentos)
    .filter(([, limite]) => limite > 0)
    .map(([categoria, limite]) => {
      const total = parseFloat((totais[categoria] ?? 0).toFixed(2));
      return { categoria, total, limite, pct: total / limite };
    })
    .sort((a, b) => b.pct - a.pct);
}

// filtra quem já passou do limiar de alerta e ainda não foi notificado nesse mês
export function categoriasParaAlertar(
  status: StatusOrcamento[],
  mes: string,
  jaAlertado: (mes: string, categoria: string) => boolean,
): StatusOrcamento[] {
  return status.filter((s) => s.pct >= LIMIAR_ALERTA && !jaAlertado(mes, s.categoria));
}
