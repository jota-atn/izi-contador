import Papa from 'papaparse';
import { RelatorioFatura, RelatorioPessoa, Gasto } from '../types';

const CATEGORIAS: Record<string, string[]> = {
  TRANSPORTE: ['UBER', '99POP', '99APP', '99 POP', 'POSTO', 'ESTACIONAMENTO'],
  ALMOÇO: ['IFOOD', 'QUENTINHA', 'ALMOÇO', 'RESTAURANTE', 'LANCHONETE', 'BURGER', 'IFD'],
  NECESSIDADES: ['SUPERMERCADO', 'FARMACIA', 'DROGARIA', 'PANIFICADORA', 'MINIBOX'],
  STREAMING: ['HBO', 'PRIME VIDEO', 'SPOTIFY', 'CRUNCHYROLL', 'NETFLIX', 'DISNEY', 'YOUTUBE PREMIUM'],
};

const NON_PERSONS = new Set(['NUPAY']);

const SPLIT_PARENS = /\(metade\s+(\w+)\)/i;
const SPLIT_DASH = /\s*-\s*metade\s+(\w+)\s*$/i;
const SPLIT_FIXED = /\((?:menos\s+)?(\d+(?:[.,]\d+)?)\s+(\w+)\)/i;
// Formato: (Nome=40, Maria=20, ...) — divide explicitamente por pessoa
const SPLIT_MULTI = /\((\w+=\d+(?:[.,]\d+)?(?:,\s*\w+=\d+(?:[.,]\d+)?)*)\)/i;
const PARCELA_SUFFIX = /\s*-\s*parcela\s+\d+\/\d+\s*$/i;

interface Row {
  date: string;
  title: string;
  amount: number;
}

function parseAmount(raw: string): number {
  return parseFloat(
    raw.trim().replace(/\s+/g, '').replace(/\./g, '').replace(',', '.'),
  );
}

function expandSplitRows(rows: Row[]): Row[] {
  const result: Row[] = [];

  for (const row of rows) {
    const multiMatch = SPLIT_MULTI.exec(row.title);
    const fixedMatch = SPLIT_FIXED.exec(row.title);
    const parensMatch = SPLIT_PARENS.exec(row.title);
    const dashMatch = SPLIT_DASH.exec(row.title);

    if (multiMatch) {
      // (Joao=40, Maria=20) → uma linha por pessoa com o valor explícito
      // Remove o bloco (…) e o sufixo "- Dono" da descrição base
      const baseTitle = row.title
        .replace(SPLIT_MULTI, '')
        .replace(/\s*-\s*\w+\s*$/, '')
        .trim();
      const pairs = multiMatch[1].split(',');
      for (const pair of pairs) {
        const [name, amountStr] = pair.trim().split('=');
        const amount = parseFloat(amountStr.replace(',', '.'));
        if (!isNaN(amount)) {
          result.push({ ...row, amount, title: `${baseTitle} - ${normalizeName(name.trim())}` });
        }
      }
    } else if (fixedMatch) {
      const personAmount = parseFloat(fixedMatch[1].replace(',', '.'));
      const splitPerson = normalizeName(fixedMatch[2]);
      const baseTitle = row.title.replace(SPLIT_FIXED, '').trim();

      result.push({ ...row, amount: row.amount - personAmount, title: baseTitle });
      result.push({ ...row, amount: personAmount, title: `${baseTitle} - ${splitPerson}` });
    } else if (parensMatch) {
      const half = row.amount / 2;
      const splitPerson = normalizeName(parensMatch[1]);
      const baseTitle = row.title.replace(SPLIT_PARENS, '').trim();

      result.push({ ...row, amount: half, title: baseTitle });
      result.push({ ...row, amount: half, title: `${baseTitle} - ${splitPerson}` });
    } else if (dashMatch) {
      const half = row.amount / 2;
      const splitPerson = normalizeName(dashMatch[1]);
      const baseTitle = row.title.replace(SPLIT_DASH, '').trim();

      result.push({ ...row, amount: half, title: baseTitle });
      result.push({ ...row, amount: half, title: `${baseTitle} - ${splitPerson}` });
    } else {
      result.push(row);
    }
  }

  return result;
}

function categorizarItem(title: string, defaultOwner: string): { exibicao: string; dono: string } {
  const parcelaMatch = PARCELA_SUFFIX.exec(title);
  const parcelaStr = parcelaMatch
    ? ` - ${(/(\d+\/\d+)/.exec(parcelaMatch[0])?.[1] ?? '')}`
    : '';

  const titleClean = title.replace(PARCELA_SUFFIX, '').trim();
  const donoMatch = /\s*-\s*([^-()\n]+)$/.exec(titleClean);
  let explicitDono = donoMatch ? normalizeName(donoMatch[1].trim()) : null;

  if (explicitDono && NON_PERSONS.has(explicitDono.toUpperCase())) {
    explicitDono = null;
  }

  const titleBase = titleClean.split('(')[0].trim();

  for (const [categoria, palavras] of Object.entries(CATEGORIAS)) {
    if (palavras.some((p) => titleBase.includes(p))) {
      return { exibicao: categoria, dono: explicitDono ?? defaultOwner };
    }
  }

  if (explicitDono && !/^\d+$/.test(explicitDono)) {
    const titleDisplay = titleClean.replace(/\s*-\s*[^-()\n]+$/, '').trim();
    return { exibicao: (titleDisplay || titleClean) + parcelaStr, dono: explicitDono };
  }

  return { exibicao: titleClean + parcelaStr, dono: defaultOwner };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// Remove acentos e normaliza capitalização — "João" e "Joao" viram "Joao"
function normalizeName(s: string): string {
  return capitalize(s.normalize('NFD').replace(/[̀-ͯ]/g, ''));
}

export function parseFatura(csvText: string, defaultOwner = 'EU'): RelatorioFatura {
  defaultOwner = normalizeName(defaultOwner);
  const { data } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const IGNORAR = ['PAGAMENTO RECEBIDO', 'PAGAMENTO EFETUADO'];

  let rows: Row[] = data
    .filter((r) => !IGNORAR.some((ig) => r.title?.toUpperCase().includes(ig)))
    .map((r) => ({ date: r.date, title: r.title, amount: parseAmount(r.amount) }))
    .filter((r) => !isNaN(r.amount));

  rows = expandSplitRows(rows);

  // Uppercase após expansão (preserva a lógica original do Python)
  rows = rows.map((r) => ({ ...r, title: r.title.toUpperCase() }));

  // Categoriza e agrupa por dono → exibicao
  const porDono = new Map<string, Map<string, { total: number; date: string }>>();

  for (const row of rows) {
    const { exibicao, dono } = categorizarItem(row.title, defaultOwner);

    if (!porDono.has(dono)) porDono.set(dono, new Map());
    const itensMap = porDono.get(dono)!;

    const isCategoria = Object.keys(CATEGORIAS).includes(exibicao);
    if (itensMap.has(exibicao)) {
      itensMap.get(exibicao)!.total += row.amount;
    } else {
      itensMap.set(exibicao, {
        total: row.amount,
        date: isCategoria ? 'Agrupado' : row.date,
      });
    }
  }

  const relatorioPorPessoa: RelatorioPessoa[] = [];
  let totalFatura = 0;

  for (const [dono, itensMap] of porDono.entries()) {
    const itens: Gasto[] = Array.from(itensMap.entries()).map(([descricao, { total, date }]) => ({
      descricao,
      valor: total,
      data: date,
    }));

    const totalIndividual = parseFloat(
      itens.reduce((s, i) => s + i.valor, 0).toFixed(2),
    );

    totalFatura += totalIndividual;
    relatorioPorPessoa.push({ dono, itens, total_individual: totalIndividual });
  }

  return {
    total_fatura: parseFloat(totalFatura.toFixed(2)),
    relatorio_por_pessoa: relatorioPorPessoa,
  };
}
