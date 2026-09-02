import { categorizarGasto } from '../src/utils/categorizarGasto';
import { DEFAULT_CATEGORIAS } from '../src/config/categorias';

describe('categorizarGasto', () => {
  it('reconhece o item categorizado pelo parser (descrição igual ao nome da categoria)', () => {
    expect(categorizarGasto('ALMOÇO', DEFAULT_CATEGORIAS)).toBe('ALMOÇO');
  });

  it('reconhece fatia de divisão feita no app ("CATEGORIA - PESSOA")', () => {
    expect(categorizarGasto('ALMOÇO - ANA', DEFAULT_CATEGORIAS)).toBe('ALMOÇO');
  });

  it('item sem palavra-chave de categoria cai em Outros', () => {
    expect(categorizarGasto('AMAZON', DEFAULT_CATEGORIAS)).toBe('Outros');
  });

  it('não confunde prefixo parcial com a categoria (precisa do separador " - ")', () => {
    expect(categorizarGasto('ALMOÇOZINHO', DEFAULT_CATEGORIAS)).toBe('Outros');
  });
});
