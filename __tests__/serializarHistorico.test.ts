import { serializarHistorico } from '../src/utils/serializarHistorico';
import { Historico } from '../src/hooks/useHistorico';
import { SEM_CATEGORIA } from '../src/parser/parseFatura';

const historico: Historico = {
  '2025-01': {
    mes: '2025-01',
    total_fatura: 150,
    relatorio_por_pessoa: [
      {
        dono: 'JOAO',
        itens: [{ descricao: 'MERCADO', valor: 100, data: '2025-01-10' }],
        total_individual: 100,
      },
      {
        dono: SEM_CATEGORIA,
        itens: [{ descricao: 'COMPRA DESCONHECIDA', valor: 50, data: '2025-01-15' }],
        total_individual: 50,
      },
    ],
  },
};

describe('serializarHistorico', () => {
  it('inclui os itens não identificados com o label legível, não o token cru', () => {
    const r = serializarHistorico(historico, ['2025-01']);
    expect(r).toContain('Não identificados');
    expect(r).toContain('COMPRA DESCONHECIDA');
    expect(r).not.toContain(SEM_CATEGORIA);
  });

  it('mantém os itens de pessoas reais normalmente', () => {
    const r = serializarHistorico(historico, ['2025-01']);
    expect(r).toContain('JOAO');
    expect(r).toContain('MERCADO');
  });
});
