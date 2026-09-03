import { chaveEdicao, reconciliarEdicoes } from '../src/utils/reconciliarEdicoes';
import { Edicao } from '../src/storage/edicoesFatura';

function ed(
  overrides: Partial<Edicao> & Pick<Edicao, 'item_desc' | 'item_data' | 'item_valor'>,
): Edicao {
  return {
    mes: '2025-01',
    novo_dono: null,
    nova_desc: null,
    deletado: false,
    ...overrides,
  };
}

describe('chaveEdicao', () => {
  it('gera a mesma chave usada por hashFatura (descricao|data|valor)', () => {
    expect(chaveEdicao({ item_desc: 'AMAZON', item_data: '2025-01-10', item_valor: 90 })).toBe(
      'AMAZON|2025-01-10|90',
    );
  });

  it('ignora o valor pra item agrupado por categoria (soma do mês é instável)', () => {
    expect(chaveEdicao({ item_desc: 'ALMOÇO', item_data: 'Agrupado', item_valor: 200 })).toBe(
      chaveEdicao({ item_desc: 'ALMOÇO', item_data: 'Agrupado', item_valor: 350 }),
    );
  });
});

describe('reconciliarEdicoes', () => {
  it('mantém edições cuja chave ainda existe nos itens válidos', () => {
    const edicoes = [
      ed({ item_desc: 'AMAZON', item_data: '2025-01-10', item_valor: 90, novo_dono: 'SOFIA' }),
    ];
    const validas = new Set(['AMAZON|2025-01-10|90']);
    const r = reconciliarEdicoes(edicoes, validas);
    expect(r.validas).toEqual(edicoes);
    expect(r.orfas).toHaveLength(0);
  });

  it('move para órfãs edições cuja chave não existe mais', () => {
    const edicoes = [
      ed({ item_desc: 'MERCADO', item_data: '2025-01-10', item_valor: 30, novo_dono: 'SOFIA' }),
    ];
    const r = reconciliarEdicoes(edicoes, new Set(['MERCADO|2025-01-10|100']));
    expect(r.validas).toHaveLength(0);
    expect(r.orfas).toEqual(edicoes);
  });

  it('separa corretamente um mix de válidas e órfãs', () => {
    const valida = ed({ item_desc: 'A', item_data: '2025-01-01', item_valor: 10, novo_dono: 'X' });
    const orfa = ed({ item_desc: 'B', item_data: '2025-01-02', item_valor: 20, novo_dono: 'Y' });
    const r = reconciliarEdicoes([valida, orfa], new Set(['A|2025-01-01|10']));
    expect(r.validas).toEqual([valida]);
    expect(r.orfas).toEqual([orfa]);
  });

  it('edição de item agrupado por categoria sobrevive à soma do mês mudar', () => {
    const edicoes = [
      ed({ item_desc: 'ALMOÇO', item_data: 'Agrupado', item_valor: 200, novo_dono: 'JOAO' }),
    ];
    // nova fatura chegou com mais uma compra de almoço — soma foi de 200 pra 235
    const r = reconciliarEdicoes(edicoes, new Set(['ALMOÇO|Agrupado']));
    expect(r.validas).toEqual(edicoes);
    expect(r.orfas).toHaveLength(0);
  });

  it('sem edições retorna listas vazias', () => {
    const r = reconciliarEdicoes([], new Set(['A|2025-01-01|10']));
    expect(r.validas).toHaveLength(0);
    expect(r.orfas).toHaveLength(0);
  });
});
