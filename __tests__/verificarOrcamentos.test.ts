import { verificarOrcamentos, categoriasParaAlertar } from '../src/utils/verificarOrcamentos';
import { RelatorioFatura } from '../src/types';

const fatura: RelatorioFatura = {
  mes: '2025-06',
  total_fatura: 450,
  relatorio_por_pessoa: [
    {
      dono: 'JOAO',
      itens: [
        { descricao: 'ALMOÇO', valor: 350, data: '2025-06-10' },
        { descricao: 'AMAZON', valor: 100, data: '2025-06-05' },
      ],
      total_individual: 450,
    },
  ],
};

const categorias = { ALMOÇO: ['IFOOD', 'ALMOÇO'], STREAMING: ['NETFLIX'] };

describe('verificarOrcamentos', () => {
  it('soma os itens por categoria e calcula o percentual do limite', () => {
    const status = verificarOrcamentos(fatura, categorias, { ALMOÇO: 400 });
    expect(status).toEqual([{ categoria: 'ALMOÇO', total: 350, limite: 400, pct: 0.875 }]);
  });

  it('só entra categoria com limite configurado', () => {
    const status = verificarOrcamentos(fatura, categorias, { STREAMING: 50 });
    expect(status).toEqual([{ categoria: 'STREAMING', total: 0, limite: 50, pct: 0 }]);
  });

  it('sem orçamentos configurados retorna vazio', () => {
    expect(verificarOrcamentos(fatura, categorias, {})).toEqual([]);
  });
});

describe('categoriasParaAlertar', () => {
  const status = [
    { categoria: 'ALMOÇO', total: 380, limite: 400, pct: 0.95 },
    { categoria: 'STREAMING', total: 20, limite: 50, pct: 0.4 },
  ];

  it('só inclui quem passou do limiar (90%)', () => {
    const r = categoriasParaAlertar(status, '2025-06', () => false);
    expect(r.map((s) => s.categoria)).toEqual(['ALMOÇO']);
  });

  it('não repete quem já foi alertado nesse mês', () => {
    const r = categoriasParaAlertar(status, '2025-06', (mes, cat) => cat === 'ALMOÇO');
    expect(r).toHaveLength(0);
  });

  it('mês diferente conta como não alertado ainda', () => {
    const r = categoriasParaAlertar(status, '2025-07', (mes, cat) => mes === '2025-06');
    expect(r.map((s) => s.categoria)).toEqual(['ALMOÇO']);
  });
});
