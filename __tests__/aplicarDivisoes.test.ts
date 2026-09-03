import { aplicarDivisoes } from '../src/utils/aplicarDivisoes';
import { aplicarEdicoes } from '../src/utils/aplicarEdicoes';
import { DivisaoItem } from '../src/storage/divisoesFatura';
import { Edicao } from '../src/storage/edicoesFatura';
import { RelatorioFatura } from '../src/types';

const dadosBase: RelatorioFatura = {
  mes: '2025-01',
  total_fatura: 150,
  relatorio_por_pessoa: [
    {
      dono: 'JOAO',
      itens: [
        { descricao: 'MERCADO', valor: 100, data: '2025-01-10' },
        { descricao: 'NETFLIX', valor: 50, data: '2025-01-05' },
      ],
      total_individual: 150,
    },
  ],
};

function divisao(overrides: Partial<DivisaoItem> & Pick<DivisaoItem, 'shares'>): DivisaoItem {
  return {
    item_desc: 'MERCADO',
    item_data: '2025-01-10',
    item_valor: 100,
    ...overrides,
  };
}

describe('aplicarDivisoes', () => {
  it('sem divisões retorna dados originais', () => {
    const r = aplicarDivisoes(dadosBase, []);
    expect(r).toBe(dadosBase);
  });

  it('soma das fatias igual ao total: explode em itens por pessoa, sem restante', () => {
    const divisoes = [
      divisao({
        shares: [
          { pessoa: 'ANA', valor: 60 },
          { pessoa: 'BRUNO', valor: 40 },
        ],
      }),
    ];
    const r = aplicarDivisoes(dadosBase, divisoes);
    const joao = r.relatorio_por_pessoa.find((p) => p.dono === 'JOAO');
    const ana = r.relatorio_por_pessoa.find((p) => p.dono === 'ANA');
    const bruno = r.relatorio_por_pessoa.find((p) => p.dono === 'BRUNO');
    expect(ana?.total_individual).toBeCloseTo(60);
    expect(bruno?.total_individual).toBeCloseTo(40);
    // NETFLIX (50) continua com JOAO, MERCADO virou fatias — sem sobra pro JOAO
    expect(joao?.total_individual).toBeCloseTo(50);
    expect(joao?.itens.find((i) => i.descricao.startsWith('MERCADO'))).toBeUndefined();
    expect(ana?.itens[0].dividido).toBe(true);
    expect(ana?.itens[0].origemDivisao).toEqual({
      item_desc: 'MERCADO',
      item_data: '2025-01-10',
      item_valor: 100,
    });
    expect(r.total_fatura).toBeCloseTo(150);
  });

  it('soma menor que o total: restante fica implícito com o dono atual', () => {
    const divisoes = [divisao({ shares: [{ pessoa: 'ANA', valor: 30 }] })];
    const r = aplicarDivisoes(dadosBase, divisoes);
    const joao = r.relatorio_por_pessoa.find((p) => p.dono === 'JOAO');
    const ana = r.relatorio_por_pessoa.find((p) => p.dono === 'ANA');
    expect(ana?.total_individual).toBeCloseTo(30);
    // JOAO fica com os 70 restantes do MERCADO + os 50 do NETFLIX
    expect(joao?.total_individual).toBeCloseTo(120);
    expect(r.total_fatura).toBeCloseTo(150);
  });

  it('soma maior que o total é aceita (acerto intencional), total_fatura aumenta', () => {
    const divisoes = [
      divisao({
        shares: [
          { pessoa: 'ANA', valor: 60 },
          { pessoa: 'BRUNO', valor: 60 },
        ],
      }),
    ];
    const r = aplicarDivisoes(dadosBase, divisoes);
    const joao = r.relatorio_por_pessoa.find((p) => p.dono === 'JOAO');
    expect(joao?.itens.find((i) => i.descricao.startsWith('MERCADO'))).toBeUndefined();
    expect(r.total_fatura).toBeCloseTo(170);
  });

  it('divisão de item agrupado por categoria continua valendo quando a soma do mês muda', () => {
    const dados: RelatorioFatura = {
      mes: '2025-01',
      total_fatura: 235,
      relatorio_por_pessoa: [
        {
          dono: 'SEM_CATEGORIA',
          // fatura foi reprocessada: entrou mais uma compra e a soma mudou de 200 pra 235
          itens: [{ descricao: 'ALMOÇO', valor: 235, data: 'Agrupado' }],
          total_individual: 235,
        },
      ],
    };
    const divisoes = [
      // divisão foi salva quando a soma ainda era 200
      divisao({
        item_desc: 'ALMOÇO',
        item_data: 'Agrupado',
        item_valor: 200,
        shares: [{ pessoa: 'ANA', valor: 60 }],
      }),
    ];
    const r = aplicarDivisoes(dados, divisoes);
    const ana = r.relatorio_por_pessoa.find((p) => p.dono === 'ANA');
    expect(ana?.total_individual).toBeCloseTo(60);
    // restante fica com SEM_CATEGORIA usando o valor atual (235), não o antigo (200)
    const semCategoria = r.relatorio_por_pessoa.find((p) => p.dono === 'SEM_CATEGORIA');
    expect(semCategoria?.total_individual).toBeCloseTo(175);
  });

  it('fatia gerada pode depois ser reatribuída via aplicarEdicoes (composição)', () => {
    const divisoes = [divisao({ shares: [{ pessoa: 'ANA', valor: 60 }] })];
    const comDivisao = aplicarDivisoes(dadosBase, divisoes);
    const fatiaAna = comDivisao.relatorio_por_pessoa.find((p) => p.dono === 'ANA')!.itens[0];

    const edicoes: Edicao[] = [
      {
        mes: '2025-01',
        item_desc: fatiaAna.descricao,
        item_data: fatiaAna.data,
        item_valor: fatiaAna.valor,
        novo_dono: 'CARLA',
        nova_desc: null,
        deletado: false,
      },
    ];
    const final = aplicarEdicoes(comDivisao, edicoes);
    expect(final.relatorio_por_pessoa.find((p) => p.dono === 'ANA')).toBeUndefined();
    expect(
      final.relatorio_por_pessoa.find((p) => p.dono === 'CARLA')?.total_individual,
    ).toBeCloseTo(60);
  });
});
