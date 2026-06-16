import { filtrarPessoas } from '../src/utils/busca';
import { RelatorioPessoa } from '../src/types';

const pessoas: RelatorioPessoa[] = [
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
];

describe('filtrarPessoas', () => {
  it('termo vazio retorna todos sem filtrar', () => {
    const { pessoasFiltradas, totalItens, totalFiltrados } = filtrarPessoas(pessoas, '');
    expect(pessoasFiltradas).toHaveLength(2);
    expect(totalItens).toBe(3);
    expect(totalFiltrados).toBe(3);
  });

  it('filtra por descrição case-insensitive', () => {
    const { pessoasFiltradas } = filtrarPessoas(pessoas, 'amazon');
    expect(pessoasFiltradas).toHaveLength(1);
    expect(pessoasFiltradas[0].pessoa.dono).toBe('JOAO');
    expect(pessoasFiltradas[0].pessoa.itens).toHaveLength(1);
  });

  it('filtra ignorando acentos', () => {
    const { pessoasFiltradas } = filtrarPessoas(pessoas, 'almoço');
    expect(pessoasFiltradas).toHaveLength(1);
    expect(pessoasFiltradas[0].pessoa.dono).toBe('SOFIA');
  });

  it('filtra ignorando acentos no termo sem acento', () => {
    const { pessoasFiltradas } = filtrarPessoas(pessoas, 'almoco');
    expect(pessoasFiltradas).toHaveLength(1);
  });

  it('pessoa sem itens correspondentes não aparece', () => {
    const { pessoasFiltradas } = filtrarPessoas(pessoas, 'netflix');
    expect(pessoasFiltradas.find((p) => p.pessoa.dono === 'SOFIA')).toBeUndefined();
  });

  it('total filtrado conta apenas itens correspondentes', () => {
    const { totalItens, totalFiltrados } = filtrarPessoas(pessoas, 'amazon');
    expect(totalItens).toBe(3);
    expect(totalFiltrados).toBe(1);
  });

  it('termo sem match retorna lista vazia', () => {
    const { pessoasFiltradas, totalFiltrados } = filtrarPessoas(pessoas, 'xyzxyz');
    expect(pessoasFiltradas).toHaveLength(0);
    expect(totalFiltrados).toBe(0);
  });

  it('total_individual da pessoa filtrada reflete apenas itens encontrados', () => {
    const { pessoasFiltradas } = filtrarPessoas(pessoas, 'amazon');
    expect(pessoasFiltradas[0].pessoa.total_individual).toBeCloseTo(90);
  });
});
