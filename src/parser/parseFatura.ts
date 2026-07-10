import Papa from 'papaparse';
import { RelatorioFatura, RelatorioPessoa, Gasto, AnotacaoInvalida } from '../types';
import { Categorias, DEFAULT_CATEGORIAS } from '../config/categorias';
import { RegrasAlocacao } from '../config/regrasAlocacao';

export const SEM_CATEGORIA = '__SEM_CATEGORIA__';

const NON_PERSONS = new Set(['NUPAY']);

const SPLIT_PARENS = /\(metade\s+(\w+)\)/i;
const SPLIT_DASH = /\s*-\s*metade\s+(\w+)\s*$/i;
const SPLIT_FIXED = /\((?:menos\s+)?(\d+(?:[.,]\d+)?)\s+(\w+)\)/i;
const SPLIT_FIXED_DASH = /\s*-\s*menos\s+(\d+(?:[.,]\d+)?)\s+(\w+)\s*$/i;
const SPLIT_MULTI = /\(([^\s=(),]+=\d+(?:[.,]\d+)?(?:[,\s]+[^\s=(),]+=\d+(?:[.,]\d+)?)*)\)/i;
const PARCELA_SUFFIX = /\s*-\s*parcela\s+\d+\/\d+\s*$/i;

interface Row {
  date: string;
  title: string;
  amount: number;
}

function parseAmount(raw: string): number {
  return parseFloat(raw.trim().replace(/\s+/g, '').replace(/\./g, '').replace(',', '.'));
}

function expandSplitRows(
  rows: Row[],
  defaultOwner: string,
): { rows: Row[]; invalidas: AnotacaoInvalida[] } {
  const result: Row[] = [];
  const invalidas: AnotacaoInvalida[] = [];

  for (const row of rows) {
    const multiMatch = SPLIT_MULTI.exec(row.title);
    const fixedMatch = SPLIT_FIXED.exec(row.title);
    const fixedDashMatch = SPLIT_FIXED_DASH.exec(row.title);
    const parensMatch = SPLIT_PARENS.exec(row.title);
    const dashMatch = SPLIT_DASH.exec(row.title);

    if (multiMatch) {
      const pairs = multiMatch[1].split(/[,\s]+/);
      const parsed: { name: string; amount: number }[] = [];
      let assignedTotal = 0;
      for (const pair of pairs) {
        const [name, amountStr] = pair.trim().split('=');
        const amount = parseFloat(amountStr.replace(',', '.'));
        if (!isNaN(amount)) {
          assignedTotal += amount;
          parsed.push({ name: name.trim(), amount });
        }
      }

      if (assignedTotal < row.amount - 0.01) {
        // soma < total → anotação incompleta: não divide, registra aviso
        invalidas.push({
          titulo: row.title,
          valor: row.amount,
          soma: parseFloat(assignedTotal.toFixed(2)),
        });
        const cleanTitle =
          row.title
            .replace(SPLIT_MULTI, '')
            .replace(/\s{2,}/g, ' ')
            .trim() || row.title;
        result.push({ ...row, title: `${cleanTitle} - ${defaultOwner}` });
      } else {
        // \S+ (não \w+) para nomes acentuados no sufixo "- Nome"
        const baseTitle = row.title
          .replace(SPLIT_MULTI, '')
          .replace(/\s*-\s*\S+\s*$/, '')
          .trim();
        for (const { name, amount } of parsed) {
          result.push({ ...row, amount, title: `${baseTitle} - ${normalizeName(name)}` });
        }
      }
    } else if (fixedMatch) {
      const personAmount = parseFloat(fixedMatch[1].replace(',', '.'));
      const splitPerson = normalizeName(fixedMatch[2]);
      const baseTitle = row.title.replace(SPLIT_FIXED, '').trim();

      result.push({
        ...row,
        amount: row.amount - personAmount,
        title: `${baseTitle} - ${normalizeName(defaultOwner)}`,
      });
      result.push({ ...row, amount: personAmount, title: `${baseTitle} - ${splitPerson}` });
    } else if (fixedDashMatch) {
      const personAmount = parseFloat(fixedDashMatch[1].replace(',', '.'));
      const splitPerson = normalizeName(fixedDashMatch[2]);
      const baseTitle = row.title.replace(SPLIT_FIXED_DASH, '').trim();

      result.push({
        ...row,
        amount: row.amount - personAmount,
        title: `${baseTitle} - ${normalizeName(defaultOwner)}`,
      });
      result.push({ ...row, amount: personAmount, title: `${baseTitle} - ${splitPerson}` });
    } else if (parensMatch) {
      const half = row.amount / 2;
      const splitPerson = normalizeName(parensMatch[1]);
      const baseTitle = row.title.replace(SPLIT_PARENS, '').trim();

      result.push({ ...row, amount: half, title: `${baseTitle} - ${normalizeName(defaultOwner)}` });
      result.push({ ...row, amount: half, title: `${baseTitle} - ${splitPerson}` });
    } else if (dashMatch) {
      const half = row.amount / 2;
      const splitPerson = normalizeName(dashMatch[1]);
      const baseTitle = row.title.replace(SPLIT_DASH, '').trim();

      result.push({ ...row, amount: half, title: `${baseTitle} - ${normalizeName(defaultOwner)}` });
      result.push({ ...row, amount: half, title: `${baseTitle} - ${splitPerson}` });
    } else {
      result.push(row);
    }
  }

  return { rows: result, invalidas };
}

function categorizarItem(
  title: string,
  defaultOwner: string,
  categorias: Categorias,
  regras: RegrasAlocacao,
): { exibicao: string; dono: string } {
  const parcelaMatch = PARCELA_SUFFIX.exec(title);
  const parcelaStr = parcelaMatch ? ` - ${/(\d+\/\d+)/.exec(parcelaMatch[0])?.[1] ?? ''}` : '';

  const titleClean = title.replace(PARCELA_SUFFIX, '').trim();
  const donoMatch = /\s*-\s*([^-()\n]+)$/.exec(titleClean);
  let explicitDono = donoMatch ? normalizeName(donoMatch[1].trim()) : null;

  if (explicitDono && NON_PERSONS.has(explicitDono.toUpperCase())) {
    explicitDono = null;
  }

  // sufixo "- Almoço" etc. não é o nome de uma pessoa, é o nome de uma categoria
  // (usuário anotando a categoria, não um dono) — não deixa virar "pessoa" fictícia
  if (explicitDono && Object.keys(categorias).some((c) => normalizeName(c) === explicitDono)) {
    explicitDono = null;
  }

  const titleBase = titleClean.split('(')[0].trim();

  for (const [categoria, palavras] of Object.entries(categorias)) {
    if (palavras.some((p) => titleBase.includes(p))) {
      return { exibicao: categoria, dono: explicitDono ?? defaultOwner };
    }
  }

  if (explicitDono && !/^\d+$/.test(explicitDono)) {
    const titleDisplay = titleClean.replace(/\s*-\s*[^-()\n]+$/, '').trim();
    return { exibicao: (titleDisplay || titleClean) + parcelaStr, dono: explicitDono };
  }

  for (const [keyword, pessoa] of Object.entries(regras)) {
    if (titleBase.includes(keyword.toUpperCase())) {
      return { exibicao: titleClean + parcelaStr, dono: normalizeName(pessoa) };
    }
  }

  return { exibicao: titleClean + parcelaStr, dono: SEM_CATEGORIA };
}

function normalizeName(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
}

function inferirMes(rows: Row[]): string {
  const contagem = new Map<string, number>();
  for (const row of rows) {
    const d = row.date ?? '';
    const iso =
      /^(\d{4}-\d{2})-\d{2}$/.exec(d)?.[1] ??
      ((/^\d{2}\/(\d{2})\/(\d{4})$/.exec(d) ?? [])[2]
        ? `${/^\d{2}\/(\d{2})\/(\d{4})$/.exec(d)![2]}-${/^\d{2}\/(\d{2})\/(\d{4})$/.exec(d)![1]}`
        : null);
    if (iso) contagem.set(iso, (contagem.get(iso) ?? 0) + 1);
  }
  if (contagem.size === 0) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  return [...contagem.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function parseFatura(
  csvText: string,
  defaultOwnerRaw = 'EU',
  categorias: Categorias = DEFAULT_CATEGORIAS,
  regrasAlocacao: RegrasAlocacao = {},
): RelatorioFatura {
  const defaultOwner = normalizeName(defaultOwnerRaw);
  const { data } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const IGNORAR = ['PAGAMENTO RECEBIDO', 'PAGAMENTO EFETUADO'];

  let rows: Row[] = data
    .filter((r) => !IGNORAR.some((ig) => r.title?.toUpperCase().includes(ig)))
    .map((r) => ({ date: r.date, title: r.title, amount: parseAmount(r.amount) }))
    .filter((r) => !isNaN(r.amount));

  const { rows: expandedRows, invalidas } = expandSplitRows(rows, defaultOwner);
  rows = expandedRows;
  const mes = inferirMes(rows);

  rows = rows.map((r) => ({ ...r, title: r.title.toUpperCase() }));

  // chave interna = nome normalizado (sem acentos); display = primeira forma vista
  const porDono = new Map<
    string,
    { display: string; itensMap: Map<string, { total: number; date: string }> }
  >();

  for (const row of rows) {
    const { exibicao, dono } = categorizarItem(row.title, defaultOwner, categorias, regrasAlocacao);
    const key = normalizeName(dono);

    if (!porDono.has(key)) porDono.set(key, { display: dono, itensMap: new Map() });
    const { itensMap } = porDono.get(key)!;

    const isCategoria = Object.keys(categorias).includes(exibicao);
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

  for (const [, { display: dono, itensMap }] of porDono.entries()) {
    const itens: Gasto[] = Array.from(itensMap.entries())
      .map(([descricao, { total, date }]) => ({ descricao, valor: total, data: date }))
      .sort((a, b) => b.valor - a.valor);

    const totalIndividual = parseFloat(itens.reduce((s, i) => s + i.valor, 0).toFixed(2));

    totalFatura += totalIndividual;
    relatorioPorPessoa.push({ dono, itens, total_individual: totalIndividual });
  }

  return {
    mes,
    total_fatura: parseFloat(totalFatura.toFixed(2)),
    relatorio_por_pessoa: relatorioPorPessoa,
    ...(invalidas.length > 0 && { anotacoes_invalidas: invalidas }),
  };
}
