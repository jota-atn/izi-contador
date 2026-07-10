import { aplicarEdicoes } from '../src/utils/aplicarEdicoes';
import { Edicao } from '../src/storage/edicoesFatura';
import { RelatorioFatura } from '../src/types';

const dadosBase: RelatorioFatura = {
  mes: '2025-01',
  total_fatura: 150,
  relatorio_por_pessoa: [
    {
      dono: 'JOAO',
      itens: [
        { descricao: 'AMAZON', valor: 90, data: '2025-01-10' },
        { descricao: 'NETFLIX', valor: 30, data: '2025-01-05' },
      ],
      total_individual: 120,
    },
    {
      dono: 'SOFIA',
      itens: [{ descricao: 'ALMOÇO', valor: 30, data: '2025-01-12' }],
      total_individual: 30,
    },
  ],
};

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

describe('aplicarEdicoes', () => {
  it('sem edições retorna dados originais', () => {
    const r = aplicarEdicoes(dadosBase, []);
    expect(r).toBe(dadosBase);
  });

  it('muda dono do item e recalcula totais', () => {
    const edicoes: Edicao[] = [
      ed({ item_desc: 'AMAZON', item_data: '2025-01-10', item_valor: 90, novo_dono: 'SOFIA' }),
    ];
    const r = aplicarEdicoes(dadosBase, edicoes);
    const joao = r.relatorio_por_pessoa.find((p) => p.dono === 'JOAO');
    const sofia = r.relatorio_por_pessoa.find((p) => p.dono === 'SOFIA');
    expect(joao?.total_individual).toBeCloseTo(30);
    expect(sofia?.total_individual).toBeCloseTo(120);
    expect(r.total_fatura).toBeCloseTo(150);
  });

  it('editar dono para nome novo cria card novo', () => {
    const edicoes: Edicao[] = [
      ed({ item_desc: 'NETFLIX', item_data: '2025-01-05', item_valor: 30, novo_dono: 'PEDRO' }),
    ];
    const r = aplicarEdicoes(dadosBase, edicoes);
    expect(r.relatorio_por_pessoa.find((p) => p.dono === 'PEDRO')).toBeDefined();
    expect(r.relatorio_por_pessoa.find((p) => p.dono === 'PEDRO')?.total_individual).toBeCloseTo(
      30,
    );
  });

  it('editar descrição do item', () => {
    const edicoes: Edicao[] = [
      ed({
        item_desc: 'ALMOÇO',
        item_data: '2025-01-12',
        item_valor: 30,
        nova_desc: 'RESTAURANTE X',
      }),
    ];
    const r = aplicarEdicoes(dadosBase, edicoes);
    const sofia = r.relatorio_por_pessoa.find((p) => p.dono === 'SOFIA');
    expect(sofia?.itens[0].descricao).toBe('RESTAURANTE X');
  });

  it('deletar item remove-o dos totais', () => {
    const edicoes: Edicao[] = [
      ed({ item_desc: 'AMAZON', item_data: '2025-01-10', item_valor: 90, deletado: true }),
    ];
    const r = aplicarEdicoes(dadosBase, edicoes);
    const joao = r.relatorio_por_pessoa.find((p) => p.dono === 'JOAO');
    expect(joao?.total_individual).toBeCloseTo(30);
    expect(r.total_fatura).toBeCloseTo(60);
  });

  it('deletar item não remove card se pessoa ainda tem outros itens', () => {
    const edicoes: Edicao[] = [
      ed({ item_desc: 'AMAZON', item_data: '2025-01-10', item_valor: 90, deletado: true }),
    ];
    const r = aplicarEdicoes(dadosBase, edicoes);
    expect(r.relatorio_por_pessoa.find((p) => p.dono === 'JOAO')).toBeDefined();
  });

  it('mover item para pessoa que já tem a mesma descrição soma em vez de duplicar', () => {
    const dados: RelatorioFatura = {
      mes: '2025-01',
      total_fatura: 220,
      relatorio_por_pessoa: [
        {
          dono: 'JOAO',
          itens: [{ descricao: 'ALMOÇO', valor: 200, data: 'Agrupado' }],
          total_individual: 200,
        },
        {
          dono: 'SEM_CATEGORIA',
          itens: [{ descricao: 'ALMOÇO', valor: 20, data: '2025-01-20' }],
          total_individual: 20,
        },
      ],
    };
    const edicoes: Edicao[] = [
      ed({
        item_desc: 'ALMOÇO',
        item_data: '2025-01-20',
        item_valor: 20,
        novo_dono: 'JOAO',
      }),
    ];
    const r = aplicarEdicoes(dados, edicoes);
    const joao = r.relatorio_por_pessoa.find((p) => p.dono === 'JOAO');
    expect(joao?.itens).toHaveLength(1);
    expect(joao?.itens[0].valor).toBeCloseTo(220);
    expect(joao?.total_individual).toBeCloseTo(220);
  });

  it('deletar todos os itens de uma pessoa remove o card', () => {
    const edicoes: Edicao[] = [
      ed({ item_desc: 'ALMOÇO', item_data: '2025-01-12', item_valor: 30, deletado: true }),
    ];
    const r = aplicarEdicoes(dadosBase, edicoes);
    expect(r.relatorio_por_pessoa.find((p) => p.dono === 'SOFIA')).toBeUndefined();
  });
});
