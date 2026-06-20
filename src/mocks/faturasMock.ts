import { Historico } from '../hooks/useHistorico';

export const MOCK_MODE = true;

const ts = (y: number, m: number) => new Date(y, m - 1, 15).toISOString();

export const MOCK_HISTORICO: Historico = {
  '2025-01': {
    mes: '2025-01',
    total_fatura: 2340.5,
    sincronizadoEm: ts(2025, 1),
    relatorio_por_pessoa: [
      {
        dono: 'JOAO',
        total_individual: 980.0,
        itens: [
          { descricao: 'AMAZON', valor: 320.0, data: '2025-01-03' },
          { descricao: 'IFOOD', valor: 210.5, data: '2025-01-10' },
          { descricao: 'NETFLIX', valor: 55.9, data: '2025-01-15' },
          { descricao: 'UBER', valor: 393.6, data: '2025-01-22' },
        ],
      },
      {
        dono: 'MARIA',
        total_individual: 870.5,
        itens: [
          { descricao: 'SHOPEE', valor: 430.0, data: '2025-01-05' },
          { descricao: 'SPOTIFY', valor: 21.9, data: '2025-01-15' },
          { descricao: 'AMERICANAS', valor: 418.6, data: '2025-01-28' },
        ],
      },
      {
        dono: 'PEDRO',
        total_individual: 490.0,
        itens: [
          { descricao: 'STEAM', valor: 199.0, data: '2025-01-07' },
          { descricao: 'RAPPI', valor: 145.0, data: '2025-01-18' },
          { descricao: 'MERCADOLIVRE', valor: 146.0, data: '2025-01-25' },
        ],
      },
    ],
  },

  '2025-02': {
    mes: '2025-02',
    total_fatura: 1870.2,
    sincronizadoEm: ts(2025, 2),
    relatorio_por_pessoa: [
      {
        dono: 'JOAO',
        total_individual: 740.0,
        itens: [
          { descricao: 'AMAZON', valor: 290.0, data: '2025-02-04' },
          { descricao: 'IFOOD', valor: 195.0, data: '2025-02-11' },
          { descricao: 'NETFLIX', valor: 55.9, data: '2025-02-15' },
          { descricao: 'UBER', valor: 199.1, data: '2025-02-20' },
        ],
      },
      {
        dono: 'MARIA',
        total_individual: 710.2,
        itens: [
          { descricao: 'ZARA', valor: 350.0, data: '2025-02-08' },
          { descricao: 'SPOTIFY', valor: 21.9, data: '2025-02-15' },
          { descricao: 'RAPPI', valor: 338.3, data: '2025-02-22' },
        ],
      },
      {
        dono: 'ANA',
        total_individual: 420.0,
        itens: [
          { descricao: 'AMAZON', valor: 180.0, data: '2025-02-06' },
          { descricao: 'CARREFOUR', valor: 140.0, data: '2025-02-14' },
          { descricao: 'UBER EATS', valor: 100.0, data: '2025-02-24' },
        ],
      },
    ],
  },

  '2025-03': {
    mes: '2025-03',
    total_fatura: 2780.9,
    sincronizadoEm: ts(2025, 3),
    relatorio_por_pessoa: [
      {
        dono: 'JOAO',
        total_individual: 1120.0,
        itens: [
          { descricao: 'AMAZON', valor: 550.0, data: '2025-03-02' },
          { descricao: 'APPLE', valor: 49.9, data: '2025-03-10' },
          { descricao: 'NETFLIX', valor: 55.9, data: '2025-03-15' },
          { descricao: 'IFOOD', valor: 320.0, data: '2025-03-20' },
          { descricao: 'UBER', valor: 144.2, data: '2025-03-27' },
        ],
      },
      {
        dono: 'MARIA',
        total_individual: 940.9,
        itens: [
          { descricao: 'RENNER', valor: 490.0, data: '2025-03-05' },
          { descricao: 'SPOTIFY', valor: 21.9, data: '2025-03-15' },
          { descricao: 'SHOPEE', valor: 429.0, data: '2025-03-28' },
        ],
      },
      {
        dono: 'PEDRO',
        total_individual: 720.0,
        itens: [
          { descricao: 'STEAM', valor: 299.0, data: '2025-03-08' },
          { descricao: 'PLAYSTATION', valor: 279.0, data: '2025-03-16' },
          { descricao: 'RAPPI', valor: 142.0, data: '2025-03-25' },
        ],
      },
    ],
  },

  '2025-04': {
    mes: '2025-04',
    total_fatura: 2100.0,
    sincronizadoEm: ts(2025, 4),
    relatorio_por_pessoa: [
      {
        dono: 'JOAO',
        total_individual: 860.0,
        itens: [
          { descricao: 'AMAZON', valor: 340.0, data: '2025-04-03' },
          { descricao: 'IFOOD', valor: 240.0, data: '2025-04-12' },
          { descricao: 'NETFLIX', valor: 55.9, data: '2025-04-15' },
          { descricao: 'UBER', valor: 224.1, data: '2025-04-22' },
        ],
      },
      {
        dono: 'MARIA',
        total_individual: 800.0,
        itens: [
          { descricao: 'AMAZON', valor: 390.0, data: '2025-04-07' },
          { descricao: 'SPOTIFY', valor: 21.9, data: '2025-04-15' },
          { descricao: 'SHOPEE', valor: 388.1, data: '2025-04-26' },
        ],
      },
      {
        dono: 'ANA',
        total_individual: 440.0,
        itens: [
          { descricao: 'CARREFOUR', valor: 220.0, data: '2025-04-09' },
          { descricao: 'UBER EATS', valor: 120.0, data: '2025-04-17' },
          { descricao: 'AMAZON', valor: 100.0, data: '2025-04-28' },
        ],
      },
    ],
  },

  '2025-05': {
    mes: '2025-05',
    total_fatura: 3120.4,
    sincronizadoEm: ts(2025, 5),
    relatorio_por_pessoa: [
      {
        dono: 'JOAO',
        total_individual: 1280.0,
        itens: [
          { descricao: 'AMAZON', valor: 680.0, data: '2025-05-04' },
          { descricao: 'APPLE', valor: 49.9, data: '2025-05-10' },
          { descricao: 'NETFLIX', valor: 55.9, data: '2025-05-15' },
          { descricao: 'IFOOD', valor: 310.0, data: '2025-05-21' },
          { descricao: 'UBER', valor: 184.2, data: '2025-05-28' },
        ],
      },
      {
        dono: 'MARIA',
        total_individual: 1090.4,
        itens: [
          { descricao: 'ZARA', valor: 540.0, data: '2025-05-06' },
          { descricao: 'SPOTIFY', valor: 21.9, data: '2025-05-15' },
          { descricao: 'SHOPEE', valor: 528.5, data: '2025-05-29' },
        ],
      },
      {
        dono: 'PEDRO',
        total_individual: 750.0,
        itens: [
          { descricao: 'STEAM', valor: 350.0, data: '2025-05-08' },
          { descricao: 'MERCADOLIVRE', valor: 250.0, data: '2025-05-18' },
          { descricao: 'RAPPI', valor: 150.0, data: '2025-05-26' },
        ],
      },
    ],
  },

  '2025-06': {
    mes: '2025-06',
    total_fatura: 2540.0,
    sincronizadoEm: ts(2025, 6),
    relatorio_por_pessoa: [
      {
        dono: 'JOAO',
        total_individual: 1010.0,
        itens: [
          { descricao: 'AMAZON', valor: 420.0, data: '2025-06-02' },
          { descricao: 'IFOOD', valor: 260.0, data: '2025-06-10' },
          { descricao: 'NETFLIX', valor: 55.9, data: '2025-06-15' },
          { descricao: 'UBER', valor: 274.1, data: '2025-06-22' },
        ],
      },
      {
        dono: 'MARIA',
        total_individual: 930.0,
        itens: [
          { descricao: 'RENNER', valor: 460.0, data: '2025-06-05' },
          { descricao: 'SPOTIFY', valor: 21.9, data: '2025-06-15' },
          { descricao: 'AMERICANAS', valor: 448.1, data: '2025-06-27' },
        ],
      },
      {
        dono: 'ANA',
        total_individual: 600.0,
        itens: [
          { descricao: 'AMAZON', valor: 280.0, data: '2025-06-07' },
          { descricao: 'CARREFOUR', valor: 180.0, data: '2025-06-16' },
          { descricao: 'UBER EATS', valor: 140.0, data: '2025-06-25' },
        ],
      },
    ],
  },
};

export const MOCK_MESES = Object.keys(MOCK_HISTORICO).sort().reverse();
export const MOCK_USER_NAME = 'Dev Mock';
