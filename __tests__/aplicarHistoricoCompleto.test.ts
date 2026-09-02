import { aplicarHistoricoCompleto } from '../src/utils/aplicarHistoricoCompleto';
import { Historico } from '../src/hooks/useHistorico';
import { Edicao } from '../src/storage/edicoesFatura';
import { DivisaoItem } from '../src/storage/divisoesFatura';

const historico: Historico = {
  '2025-01': {
    mes: '2025-01',
    total_fatura: 100,
    relatorio_por_pessoa: [
      {
        dono: 'JOAO',
        itens: [{ descricao: 'MERCADO', valor: 100, data: '2025-01-10' }],
        total_individual: 100,
      },
    ],
  },
  '2025-02': {
    mes: '2025-02',
    total_fatura: 50,
    relatorio_por_pessoa: [
      {
        dono: 'JOAO',
        itens: [{ descricao: 'NETFLIX', valor: 50, data: '2025-02-05' }],
        total_individual: 50,
      },
    ],
  },
};

function ed(mes: string): Edicao {
  return {
    mes,
    item_desc: 'MERCADO',
    item_data: '2025-01-10',
    item_valor: 100,
    novo_dono: 'SOFIA',
    nova_desc: null,
    deletado: false,
  };
}

function divisao(): DivisaoItem {
  return {
    item_desc: 'NETFLIX',
    item_data: '2025-02-05',
    item_valor: 50,
    shares: [{ pessoa: 'ANA', valor: 20 }],
  };
}

describe('aplicarHistoricoCompleto', () => {
  it('sem edições/divisões, histórico fica igual ao original', () => {
    const r = aplicarHistoricoCompleto(historico, {}, {});
    expect(r['2025-01'].relatorio_por_pessoa[0].dono).toBe('JOAO');
    expect(r['2025-02'].relatorio_por_pessoa[0].dono).toBe('JOAO');
  });

  it('edição de um mês só afeta aquele mês', () => {
    const r = aplicarHistoricoCompleto(historico, { '2025-01': [ed('2025-01')] }, {});
    expect(r['2025-01'].relatorio_por_pessoa.find((p) => p.dono === 'SOFIA')).toBeDefined();
    expect(r['2025-01'].relatorio_por_pessoa.find((p) => p.dono === 'JOAO')).toBeUndefined();
    // fevereiro não tem edição, continua igual
    expect(r['2025-02'].relatorio_por_pessoa[0].dono).toBe('JOAO');
  });

  it('divisão de um mês explode o item e mantém o restante com o dono', () => {
    const r = aplicarHistoricoCompleto(historico, {}, { '2025-02': [divisao()] });
    const fev = r['2025-02'];
    expect(fev.relatorio_por_pessoa.find((p) => p.dono === 'ANA')?.total_individual).toBeCloseTo(
      20,
    );
    expect(fev.relatorio_por_pessoa.find((p) => p.dono === 'JOAO')?.total_individual).toBeCloseTo(
      30,
    );
    // janeiro não tem divisão, continua igual
    expect(r['2025-01'].relatorio_por_pessoa[0].dono).toBe('JOAO');
  });
});
