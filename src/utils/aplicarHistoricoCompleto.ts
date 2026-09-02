import { Historico } from '../hooks/useHistorico';
import { Edicao } from '../storage/edicoesFatura';
import { DivisaoItem } from '../storage/divisoesFatura';
import { aplicarDivisoes } from './aplicarDivisoes';
import { aplicarEdicoes } from './aplicarEdicoes';

// aplica as edições/divisões de cada mês no histórico inteiro — usado por telas que agregam
// vários meses (IziStats, IziBot) e por isso não podem usar só o mês selecionado
export function aplicarHistoricoCompleto(
  historico: Historico,
  edicoesPorMes: Record<string, Edicao[]>,
  divisoesPorMes: Record<string, DivisaoItem[]>,
): Historico {
  const resultado: Historico = {};
  for (const [mes, dados] of Object.entries(historico)) {
    const comDivisoes = aplicarDivisoes(dados, divisoesPorMes[mes] ?? []);
    resultado[mes] = aplicarEdicoes(comDivisoes, edicoesPorMes[mes] ?? []);
  }
  return resultado;
}
