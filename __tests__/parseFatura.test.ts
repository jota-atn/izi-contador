import { parseFatura, SEM_CATEGORIA } from '../src/parser/parseFatura';

function csv(...rows: string[]): string {
  return ['date,title,amount', ...rows].join('\n');
}

function pessoa(relatorio: ReturnType<typeof parseFatura>, dono: string) {
  return relatorio.relatorio_por_pessoa.find((p) => p.dono === dono);
}

describe('parseFatura — básico', () => {
  it('item simples vai para SEM_CATEGORIA quando não tem dono', () => {
    const r = parseFatura(csv('2025-01-10,COMPRA DESCONHECIDA,50,00'), 'EU', {}, {});
    expect(pessoa(r, SEM_CATEGORIA)).toBeDefined();
  });

  it('item com sufixo "- NOME" vai para esse dono', () => {
    const r = parseFatura(csv('2025-01-10,AMAZON - JOAO,90,00'));
    expect(pessoa(r, 'JOAO')?.total_individual).toBeCloseTo(90);
  });

  it('ignora linha de pagamento recebido', () => {
    const r = parseFatura(csv('2025-01-10,PAGAMENTO RECEBIDO,500,00'));
    expect(r.total_fatura).toBe(0);
    expect(r.relatorio_por_pessoa).toHaveLength(0);
  });

  it('normaliza nome do dono (remove acento, uppercase)', () => {
    const r = parseFatura(csv('2025-01-10,ALMOÇO - João,30,00'));
    expect(pessoa(r, 'JOAO')).toBeDefined();
  });

  it('infere mês pelo mais frequente nas datas', () => {
    const r = parseFatura(
      csv(
        '2025-01-10,ITEM A - JOAO,10,00',
        '2025-01-15,ITEM B - JOAO,10,00',
        '2025-02-01,ITEM C - JOAO,10,00',
      ),
    );
    expect(r.mes).toBe('2025-01');
  });
});

describe('parseFatura — splits', () => {
  it('(metade NOME) divide 50/50 entre dono e pessoa', () => {
    const r = parseFatura(csv('2025-01-10,RESTAURANTE (metade SOFIA),100,00'), 'JOAO');
    expect(pessoa(r, 'JOAO')?.total_individual).toBeCloseTo(50);
    expect(pessoa(r, 'SOFIA')?.total_individual).toBeCloseTo(50);
  });

  it('itens de um split são marcados como divididos, item normal não', () => {
    const r = parseFatura(
      csv('2025-01-10,CINEMA (metade SOFIA),100,00', '2025-01-11,LOJA X - JOAO,50,00'),
      'JOAO',
    );
    expect(pessoa(r, 'JOAO')?.itens.find((i) => i.descricao === 'CINEMA')?.dividido).toBe(true);
    expect(pessoa(r, 'SOFIA')?.itens[0].dividido).toBe(true);
    expect(
      pessoa(r, 'JOAO')?.itens.find((i) => i.descricao === 'LOJA X')?.dividido,
    ).toBeUndefined();
  });

  it('- metade NOME divide 50/50 via sufixo dash', () => {
    const r = parseFatura(csv('2025-01-10,CINEMA - metade ANA,80,00'), 'JOAO');
    expect(pessoa(r, 'JOAO')?.total_individual).toBeCloseTo(40);
    expect(pessoa(r, 'ANA')?.total_individual).toBeCloseTo(40);
  });

  it('(menos N NOME) separa valor fixo para pessoa, resto para dono', () => {
    const r = parseFatura(csv('2025-01-10,MERCADO (menos 30 SOFIA),100,00'), 'JOAO');
    expect(pessoa(r, 'JOAO')?.total_individual).toBeCloseTo(70);
    expect(pessoa(r, 'SOFIA')?.total_individual).toBeCloseTo(30);
  });

  it('- menos N NOME separa valor fixo via sufixo dash', () => {
    const r = parseFatura(csv('2025-01-10,ESPETOS BAR - Menos 27 Sofia,47,00'), 'JOAO');
    expect(pessoa(r, 'JOAO')?.total_individual).toBeCloseTo(20);
    expect(pessoa(r, 'SOFIA')?.total_individual).toBeCloseTo(27);
    expect(pessoa(r, 'MENOS 27 SOFIA')).toBeUndefined();
  });

  it('SPLIT_MULTI distribui valores explícitos corretamente', () => {
    // usa espaço como separador para evitar quebra de CSV
    const r = parseFatura(csv('2025-01-10,JANTAR (JOAO=60 SOFIA=40),100,00'), 'JOAO');
    expect(pessoa(r, 'JOAO')?.total_individual).toBeCloseTo(60);
    expect(pessoa(r, 'SOFIA')?.total_individual).toBeCloseTo(40);
    expect(r.anotacoes_invalidas).toBeUndefined();
  });

  it('SPLIT_MULTI com soma == total não gera aviso', () => {
    const r = parseFatura(csv('2025-01-10,CONTA (A=50 B=50),100,00'), 'A');
    expect(r.anotacoes_invalidas).toBeUndefined();
  });

  it('SPLIT_MULTI com soma < total registra anotação inválida e não divide', () => {
    const r = parseFatura(csv('2025-01-10,HOTEL (JOAO=30 SOFIA=20),100,00'), 'JOAO');
    expect(r.anotacoes_invalidas).toHaveLength(1);
    expect(r.anotacoes_invalidas![0].soma).toBeCloseTo(50);
    expect(r.anotacoes_invalidas![0].valor).toBeCloseTo(100);
    // item não dividido — fica no dono como título limpo
    expect(pessoa(r, 'JOAO')).toBeDefined();
    expect(pessoa(r, 'SOFIA')).toBeUndefined();
  });

  it('parte do dono no SPLIT_MULTI não vai para SEM_CATEGORIA', () => {
    const r = parseFatura(csv('2025-01-10,SUPERMERCADO (SOFIA=40 JOAO=60),100,00'), 'JOAO');
    expect(pessoa(r, SEM_CATEGORIA)).toBeUndefined();
  });

  it('SPLIT_MULTI com soma > total divide normalmente (acerto à parte é válido)', () => {
    const r = parseFatura(csv('2025-01-10,FARMACIA (MARIA=30 JOAO=20),40,00'), 'JOAO');
    expect(r.anotacoes_invalidas).toBeUndefined();
    expect(pessoa(r, 'MARIA')?.total_individual).toBeCloseTo(30);
    expect(pessoa(r, 'JOAO')?.total_individual).toBeCloseTo(20);
  });

  it('(menos N NOME) com N maior que o total divide normalmente (resto do dono fica negativo)', () => {
    const r = parseFatura(csv('2025-01-10,UBER (menos 50 SOFIA),30,00'), 'JOAO');
    expect(r.anotacoes_invalidas).toBeUndefined();
    expect(pessoa(r, 'SOFIA')?.total_individual).toBeCloseTo(50);
    expect(pessoa(r, 'JOAO')?.total_individual).toBeCloseTo(-20);
  });

  it('- menos N NOME com N maior que o total divide normalmente via sufixo dash', () => {
    const r = parseFatura(csv('2025-01-10,TAXI - Menos 50 Sofia,30,00'), 'JOAO');
    expect(r.anotacoes_invalidas).toBeUndefined();
    expect(pessoa(r, 'SOFIA')?.total_individual).toBeCloseTo(50);
    expect(pessoa(r, 'JOAO')?.total_individual).toBeCloseTo(-20);
  });
});

describe('parseFatura — categorias e regras', () => {
  it('item na categoria sem sufixo de nome nem regra vai para Não identificados', () => {
    // "Netflix" sozinho não indica de quem é a assinatura — nada assume que é do titular
    const r = parseFatura(csv('2025-01-10,NETFLIX,30,00'), 'EU', { Streaming: ['NETFLIX'] }, {});
    const p = pessoa(r, SEM_CATEGORIA);
    expect(p?.itens[0].descricao).toBe('Streaming');
    expect(pessoa(r, 'EU')).toBeUndefined();
  });

  it('regra de alocação vale mesmo quando o título bate com uma categoria', () => {
    const r = parseFatura(
      csv('2025-01-10,NETFLIX,30,00'),
      'EU',
      { Streaming: ['NETFLIX'] },
      { NETFLIX: 'JOAO' },
    );
    const p = pessoa(r, 'JOAO');
    expect(p?.itens[0].descricao).toBe('Streaming');
    expect(p?.total_individual).toBeCloseTo(30);
  });

  it('regra de alocação atribui item a pessoa correta', () => {
    const r = parseFatura(
      csv('2025-01-10,AMAZON PRIME,50,00'),
      'EU',
      {},
      { 'AMAZON PRIME': 'ANA' },
    );
    expect(pessoa(r, 'ANA')?.total_individual).toBeCloseTo(50);
  });

  it('regra criada via "sempre atribuir" num item agrupado (chave = nome da categoria) persiste entre faturas', () => {
    // reproduz o fluxo do EditarItemModal: usuário marca "sempre atribuir ALMOÇO a JOAO"
    // num item já agrupado por categoria — a regra fica gravada com o nome da categoria
    // como chave, não com o comerciante, então não pode depender de substring no título bruto
    const r = parseFatura(
      csv('2025-01-10,IFOOD RESTAURANTE X,20,00', '2025-01-15,QUENTINHA DO ZE,15,00'),
      'EU',
      { ALMOÇO: ['IFOOD', 'QUENTINHA'] },
      { ALMOÇO: 'JOAO' },
    );
    expect(pessoa(r, 'JOAO')?.itens[0].descricao).toBe('ALMOÇO');
    expect(pessoa(r, 'JOAO')?.total_individual).toBeCloseTo(35);
    expect(pessoa(r, SEM_CATEGORIA)).toBeUndefined();
  });

  it('sufixo "- NOME-DA-CATEGORIA" não vira pessoa fictícia e vai para Não identificados', () => {
    // "Mini Box Vitoria - Almoço" anota a categoria, não indica de quem é a compra
    const r = parseFatura(
      csv('2025-01-10,MINI BOX VITORIA - Almoço,20,00'),
      'EU',
      { Almoço: ['ALMOÇO'] },
      {},
    );
    expect(pessoa(r, 'ALMOCO')).toBeUndefined();
    expect(pessoa(r, 'EU')).toBeUndefined();
    expect(pessoa(r, SEM_CATEGORIA)?.total_individual).toBeCloseTo(20);
  });
});

describe('parseFatura — assinaturas recorrentes', () => {
  it('divide automaticamente pelos participantes configurados, resto fica com o dono', () => {
    const r = parseFatura(
      csv('2025-01-10,NETFLIX,"55,90"'),
      'JOAO',
      { Streaming: ['NETFLIX'] },
      {},
      [{ keyword: 'NETFLIX', participantes: [{ pessoa: 'Sofia', valor: 14 }] }],
    );
    expect(pessoa(r, 'SOFIA')?.total_individual).toBeCloseTo(14);
    expect(pessoa(r, 'JOAO')?.total_individual).toBeCloseTo(41.9);
    expect(pessoa(r, 'JOAO')?.itens[0].descricao).toBe('Streaming');
  });

  it('divide entre vários participantes configurados', () => {
    const r = parseFatura(csv('2025-01-10,NETFLIX,60'), 'JOAO', { Streaming: ['NETFLIX'] }, {}, [
      {
        keyword: 'NETFLIX',
        participantes: [
          { pessoa: 'Sofia', valor: 15 },
          { pessoa: 'Thales', valor: 15 },
        ],
      },
    ]);
    expect(pessoa(r, 'SOFIA')?.total_individual).toBeCloseTo(15);
    expect(pessoa(r, 'THALES')?.total_individual).toBeCloseTo(15);
    expect(pessoa(r, 'JOAO')?.total_individual).toBeCloseTo(30);
  });

  it('anotação manual no título daquele mês tem prioridade sobre a assinatura', () => {
    const r = parseFatura(
      csv('2025-01-10,NETFLIX (metade ANA),60'),
      'JOAO',
      { Streaming: ['NETFLIX'] },
      {},
      [{ keyword: 'NETFLIX', participantes: [{ pessoa: 'Sofia', valor: 15 }] }],
    );
    expect(pessoa(r, 'ANA')?.total_individual).toBeCloseTo(30);
    expect(pessoa(r, 'JOAO')?.total_individual).toBeCloseTo(30);
    expect(pessoa(r, 'SOFIA')).toBeUndefined();
  });

  it('soma dos participantes maior que o valor real não divide e registra aviso', () => {
    const r = parseFatura(csv('2025-01-10,NETFLIX,10'), 'JOAO', { Streaming: ['NETFLIX'] }, {}, [
      { keyword: 'NETFLIX', participantes: [{ pessoa: 'Sofia', valor: 15 }] },
    ]);
    expect(r.anotacoes_invalidas).toHaveLength(1);
    expect(r.anotacoes_invalidas![0].soma).toBeCloseTo(15);
    expect(r.anotacoes_invalidas![0].valor).toBeCloseTo(10);
    expect(pessoa(r, 'SOFIA')).toBeUndefined();
  });
});

describe('parseFatura — parcelas', () => {
  it('item com "- Parcela N/M" ganha campo estruturado parcela', () => {
    const r = parseFatura(csv('2025-01-10,NOTEBOOK - Parcela 3/12,500,00'), 'JOAO');
    const item = pessoa(r, SEM_CATEGORIA)?.itens[0];
    expect(item?.parcela).toEqual({ atual: 3, total: 12 });
  });

  it('item sem parcela não tem o campo', () => {
    const r = parseFatura(csv('2025-01-10,MERCADO - JOAO,50,00'));
    const item = pessoa(r, 'JOAO')?.itens[0];
    expect(item?.parcela).toBeUndefined();
  });
});
