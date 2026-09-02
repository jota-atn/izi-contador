import { Edicao } from '../storage/edicoesFatura';
import { DivisaoItem } from '../storage/divisoesFatura';

export function descreverEdicao(ed: Pick<Edicao, 'novo_dono' | 'nova_desc' | 'deletado'>): string {
  if (ed.deletado) return 'removido';
  if (ed.novo_dono && ed.nova_desc) return `dono → ${ed.novo_dono}, renomeado`;
  if (ed.novo_dono) return `dono → ${ed.novo_dono}`;
  if (ed.nova_desc) return `renomeado para "${ed.nova_desc}"`;
  return 'sem alteração';
}

export function descreverDivisao(item: Pick<DivisaoItem, 'shares'>): string {
  return `dividido entre ${item.shares.map((s) => s.pessoa).join(', ')}`;
}
