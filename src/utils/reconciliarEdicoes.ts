interface ChaveItem {
  item_desc: string;
  item_data: string;
  item_valor: number;
}

export function chaveEdicao(ed: ChaveItem): string {
  // itens agrupados por categoria (data === "Agrupado") têm valor = soma de
  // todas as compras da categoria no mês, que muda a cada nova compra — se o
  // valor entrar na chave, toda atualização de fatura "perde" a edição/regra
  if (ed.item_data === 'Agrupado') return `${ed.item_desc}|${ed.item_data}`;
  return `${ed.item_desc}|${ed.item_data}|${ed.item_valor}`;
}

// genérica pra funcionar tanto com Edicao (edicoes_v1) quanto com DivisaoItem
// (divisoes_v1) — ambos têm a mesma chave de item (desc|data|valor)
export function reconciliarEdicoes<T extends ChaveItem>(
  edicoes: T[],
  itensValidos: Set<string>,
): { validas: T[]; orfas: T[] } {
  const validas: T[] = [];
  const orfas: T[] = [];

  for (const ed of edicoes) {
    if (itensValidos.has(chaveEdicao(ed))) {
      validas.push(ed);
    } else {
      orfas.push(ed);
    }
  }

  return { validas, orfas };
}
