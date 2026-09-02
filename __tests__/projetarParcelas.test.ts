import { listarParcelasAbertas, projetarComprometido } from '../src/utils/projetarParcelas';
import { RelatorioFatura } from '../src/types';

const fatura: RelatorioFatura = {
  mes: '2025-06',
  total_fatura: 650,
  relatorio_por_pessoa: [
    {
      dono: 'JOAO',
      itens: [
        { descricao: 'NOTEBOOK', valor: 200, data: '2025-06-10', parcela: { atual: 3, total: 12 } },
        { descricao: 'CELULAR', valor: 150, data: '2025-06-05', parcela: { atual: 5, total: 6 } },
        { descricao: 'MERCADO', valor: 100, data: '2025-06-08' }, // sem parcela
      ],
      total_individual: 450,
    },
    {
      dono: 'SOFIA',
      itens: [
        // última parcela: não sobra nada pros próximos meses
        { descricao: 'TV', valor: 200, data: '2025-06-12', parcela: { atual: 4, total: 4 } },
      ],
      total_individual: 200,
    },
  ],
};

describe('listarParcelasAbertas', () => {
  it('lista só itens com parcela e restantes > 0', () => {
    const abertas = listarParcelasAbertas(fatura);
    expect(abertas).toHaveLength(2);
    expect(abertas.map((p) => p.descricao).sort()).toEqual(['CELULAR', 'NOTEBOOK']);
  });

  it('calcula restantes corretamente', () => {
    const abertas = listarParcelasAbertas(fatura);
    const notebook = abertas.find((p) => p.descricao === 'NOTEBOOK')!;
    expect(notebook.restantes).toBe(9);
  });

  it('última parcela (restantes === 0) não entra na lista', () => {
    const abertas = listarParcelasAbertas(fatura);
    expect(abertas.find((p) => p.descricao === 'TV')).toBeUndefined();
  });
});

describe('projetarComprometido', () => {
  it('soma os dois parcelamentos no primeiro mês (ambos ainda restam)', () => {
    const abertas = listarParcelasAbertas(fatura);
    const projecao = projetarComprometido(abertas);
    expect(projecao[0]).toEqual({ mes: 1, total: 350 }); // 200 + 150
  });

  it('para no mês da parcela mais longa e cai só o notebook depois que o celular acaba', () => {
    const abertas = listarParcelasAbertas(fatura);
    const projecao = projetarComprometido(abertas);
    expect(projecao).toHaveLength(9); // notebook tem 9 parcelas restantes
    expect(projecao[0].total).toBe(350); // mês 1: notebook + celular
    expect(projecao[1].total).toBe(200); // mês 2 em diante: só notebook (celular já acabou)
    expect(projecao[8].total).toBe(200); // último mês: só notebook
  });

  it('sem parcelas abertas retorna array vazio', () => {
    expect(projetarComprometido([])).toEqual([]);
  });
});
