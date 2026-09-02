import { gerarCsv } from '../src/utils/gerarCsv';
import { Historico } from '../src/hooks/useHistorico';
import { DEFAULT_CATEGORIAS } from '../src/config/categorias';

const historico: Historico = {
  '2025-01': {
    mes: '2025-01',
    total_fatura: 130,
    relatorio_por_pessoa: [
      {
        dono: 'JOAO',
        itens: [
          { descricao: 'ALMOÇO', valor: 100, data: '2025-01-10' },
          { descricao: 'AMAZON, LTDA "top"', valor: 30, data: '2025-01-05' },
        ],
        total_individual: 130,
      },
    ],
  },
};

function getEstado(mes: string, dono: string) {
  return { pago: mes === '2025-01' && dono === 'JOAO' };
}

describe('gerarCsv', () => {
  it('gera cabeçalho e uma linha por item', () => {
    const csv = gerarCsv(historico, ['2025-01'], DEFAULT_CATEGORIAS, getEstado);
    const linhas = csv.split('\n');
    expect(linhas[0]).toBe('mes,dono,descricao,categoria,data,valor,pago,dividido,editado');
    expect(linhas).toHaveLength(3); // header + 2 itens
  });

  it('detecta a categoria certa e reflete o estado de pago', () => {
    const csv = gerarCsv(historico, ['2025-01'], DEFAULT_CATEGORIAS, getEstado);
    expect(csv).toContain('"2025-01","JOAO","ALMOÇO","ALMOÇO","2025-01-10","100","true"');
  });

  it('item sem categoria cai em Outros', () => {
    const csv = gerarCsv(historico, ['2025-01'], DEFAULT_CATEGORIAS, getEstado);
    expect(csv).toContain('"Outros"');
  });

  it('escapa vírgula e aspas no campo de descrição', () => {
    const csv = gerarCsv(historico, ['2025-01'], DEFAULT_CATEGORIAS, getEstado);
    expect(csv).toContain('"AMAZON, LTDA ""top"""');
  });
});
