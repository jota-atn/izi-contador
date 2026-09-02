import { memo, useMemo } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Historico } from '../hooks/useHistorico';
import { Categorias } from '../config/categorias';
import { SEM_CATEGORIA, SEM_CATEGORIA_LABEL } from '../parser/parseFatura';
import { MESES_PT, nomeMes } from '../utils/meses';
import {
  CHART_COLOR_OUTROS,
  CHART_COLOR_OUTROS_RGB,
  corCategorica,
  corCategoricaRgb,
} from '../utils/chartColors';

const SCREEN_W = Dimensions.get('window').width;
const MESES_CURTOS = MESES_PT.map((m) => m.substring(0, 3));
const CHART_MAX_MESES = 7;

function formatDono(dono: string): string {
  return dono === SEM_CATEGORIA ? SEM_CATEGORIA_LABEL : dono;
}

const CHART_CONFIG = {
  backgroundColor: '#0f172a',
  backgroundGradientFrom: '#0f172a',
  backgroundGradientTo: '#0f172a',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
  labelColor: () => '#475569',
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#7c3aed', fill: '#0f172a' },
  propsForBackgroundLines: { stroke: '#1e293b', strokeWidth: 1, strokeDasharray: '' },
};

function fmtBRL(value: number): string {
  return 'R$ ' + Math.round(value).toLocaleString('pt-BR');
}

interface Props {
  historico: Historico;
  meses: string[]; // sorted descending (newest first)
  refreshing: boolean;
  onRefresh: () => void;
  categorias: Categorias;
}

export const EstatsScreen = memo(function EstatsScreen({
  historico,
  meses,
  refreshing,
  onRefresh,
  categorias,
}: Props) {
  const mesesCron = useMemo(() => [...meses].reverse(), [meses]);
  const mesesChart = useMemo(() => mesesCron.slice(-CHART_MAX_MESES), [mesesCron]);

  const totaisChart = useMemo(
    () => mesesChart.map((m) => historico[m].total_fatura),
    [mesesChart, historico],
  );

  const pessoasChart = useMemo(() => {
    const pessoasSet = new Set<string>();
    mesesChart.forEach((m) =>
      historico[m].relatorio_por_pessoa.forEach((p) => pessoasSet.add(p.dono)),
    );
    return Array.from(pessoasSet)
      .map((dono) => ({
        dono,
        data: mesesChart.map((m) => {
          const p = historico[m].relatorio_por_pessoa.find((x) => x.dono === dono);
          return p ? p.total_individual : 0;
        }),
      }))
      .sort((a, b) => b.data.reduce((s, v) => s + v, 0) - a.data.reduce((s, v) => s + v, 0));
  }, [mesesChart, historico]);

  const labels = useMemo(
    () => mesesChart.map((m) => MESES_CURTOS[parseInt(m.split('-')[1], 10) - 1]),
    [mesesChart],
  );

  const { media, maiorMes, menorMes } = useMemo(() => {
    const todos = mesesCron.map((m) => ({ mes: m, total: historico[m].total_fatura }));
    const media = todos.reduce((s, x) => s + x.total, 0) / todos.length;
    const maiorMes = todos.reduce((a, b) => (b.total > a.total ? b : a)).mes;
    const menorMes = todos.reduce((a, b) => (b.total < a.total ? b : a)).mes;
    return { media, maiorMes, menorMes };
  }, [mesesCron, historico]);

  // Total acumulado e distribuição por pessoa (soma de todos os meses)
  const pessoasAcumulado = useMemo(() => {
    const byPessoa: Record<string, number> = {};
    mesesCron.forEach((mes) => {
      historico[mes].relatorio_por_pessoa.forEach((p) => {
        byPessoa[p.dono] = (byPessoa[p.dono] ?? 0) + p.total_individual;
      });
    });
    return Object.entries(byPessoa)
      .map(([dono, total]) => ({ dono, total }))
      .sort((a, b) => b.total - a.total);
  }, [mesesCron, historico]);

  const totalAcumulado = useMemo(
    () => pessoasAcumulado.reduce((s, p) => s + p.total, 0),
    [pessoasAcumulado],
  );

  // Distribuição por categoria (soma de todos os meses) — um item pertence a uma
  // categoria quando sua descrição é o nome dela (item categorizado no parser) ou
  // começa com "CATEGORIA - " (fatia gerada por uma divisão feita no app); o resto
  // (a maioria das compras, sem palavra-chave de categoria) cai em "Outros"
  const categoriasAcumulado = useMemo(() => {
    const nomesCategorias = Object.keys(categorias);
    const byCategoria: Record<string, number> = {};
    mesesCron.forEach((mes) => {
      historico[mes].relatorio_por_pessoa.forEach((p) => {
        p.itens.forEach((item) => {
          const categoria =
            nomesCategorias.find(
              (c) => item.descricao === c || item.descricao.startsWith(`${c} - `),
            ) ?? 'Outros';
          byCategoria[categoria] = (byCategoria[categoria] ?? 0) + item.valor;
        });
      });
    });
    return Object.entries(byCategoria)
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);
  }, [mesesCron, historico, categorias]);

  // cor por pessoa é fixada uma vez (ranking do acumulado, a ordenação mais
  // estável) e reaproveitada em todos os gráficos/listas da tela — assim a
  // mesma pessoa nunca muda de cor entre a linha do tempo, a distribuição e a
  // média, e ninguém repete a cor de outra pessoa (além da 8ª cai num cinza
  // neutro em vez de reciclar uma cor já usada)
  const personColors = useMemo(() => {
    const map: Record<string, string> = {};
    let idx = 0;
    pessoasAcumulado.forEach(({ dono }) => {
      map[dono] = dono === SEM_CATEGORIA ? CHART_COLOR_OUTROS : corCategorica(idx++);
    });
    return map;
  }, [pessoasAcumulado]);

  const personColorsRgb = useMemo(() => {
    const map: Record<string, string> = {};
    let idx = 0;
    pessoasAcumulado.forEach(({ dono }) => {
      map[dono] = dono === SEM_CATEGORIA ? CHART_COLOR_OUTROS_RGB : corCategoricaRgb(idx++);
    });
    return map;
  }, [pessoasAcumulado]);

  // Média por pessoa (aparece nos meses em que está presente)
  const pessoasStats = useMemo(() => {
    const byPessoa: Record<string, number[]> = {};
    mesesCron.forEach((mes) => {
      historico[mes].relatorio_por_pessoa.forEach((p) => {
        (byPessoa[p.dono] ??= []).push(p.total_individual);
      });
    });
    return Object.entries(byPessoa)
      .map(([dono, vals]) => ({
        dono,
        media: vals.reduce((a, b) => a + b, 0) / vals.length,
        meses: vals.length,
      }))
      .sort((a, b) => b.media - a.media);
  }, [mesesCron, historico]);

  // Gastos recorrentes — itens presentes em 2+ meses com valor médio
  const topFrequentes = useMemo(() => {
    const byDesc: Record<string, { meses: Set<string>; valores: number[] }> = {};
    mesesCron.forEach((mes) => {
      historico[mes].relatorio_por_pessoa.forEach((p) => {
        p.itens.forEach((item) => {
          const key = item.descricao.toUpperCase().trim();
          if (!byDesc[key]) byDesc[key] = { meses: new Set(), valores: [] };
          byDesc[key].meses.add(mes);
          byDesc[key].valores.push(item.valor);
        });
      });
    });
    return Object.entries(byDesc)
      .filter(([, v]) => v.meses.size > 1)
      .map(([desc, { meses: m, valores }]) => ({
        desc,
        count: m.size,
        mediaValor: valores.reduce((a, b) => a + b, 0) / valores.length,
      }))
      .sort((a, b) => b.count - a.count || a.desc.localeCompare(b.desc))
      .slice(0, 8);
  }, [mesesCron, historico]);

  // Top 5 maiores gastos individuais do período
  const topItens = useMemo(() => {
    const itens: Array<{ desc: string; valor: number; dono: string; mes: string }> = [];
    mesesCron.forEach((mes) => {
      historico[mes].relatorio_por_pessoa.forEach((p) => {
        p.itens.forEach((item) => {
          itens.push({ desc: item.descricao, valor: item.valor, dono: p.dono, mes });
        });
      });
    });
    return itens.sort((a, b) => b.valor - a.valor).slice(0, 5);
  }, [mesesCron, historico]);

  if (meses.length < 2) {
    return (
      <ScrollView
        contentContainerStyle={s.emptyScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7c3aed"
            colors={['#7c3aed']}
          />
        }
      >
        <View style={s.empty}>
          <Text style={s.emptyTitle}>Sem dados suficientes</Text>
          <Text style={s.emptyText}>
            Acumule pelo menos 2 meses de fatura para ver a evolução dos gastos.
          </Text>
        </View>
      </ScrollView>
    );
  }

  const maxAcumulado = pessoasAcumulado[0]?.total ?? 1;
  const maxCategoria = categoriasAcumulado[0]?.total ?? 1;

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#7c3aed"
          colors={['#7c3aed']}
        />
      }
    >
      {/* Header */}
      <View style={s.headerRow}>
        <Text style={s.headerTitle}>
          Izi<Text style={s.headerAccent}>Stats</Text>
        </Text>
        <Text style={s.headerSub}>
          {meses.length} {meses.length === 1 ? 'mês analisado' : 'meses analisados'}
        </Text>
      </View>

      {/* Acumulado */}
      <View style={s.acumuladoCard}>
        <Text style={s.acumuladoLabel}>Total acumulado</Text>
        <Text style={s.acumuladoValor}>{fmtBRL(totalAcumulado)}</Text>
        <Text style={s.acumuladoSub}>média de {fmtBRL(media)}/mês</Text>
      </View>

      {/* Summary cards */}
      <View style={s.row}>
        <StatCard
          label="Maior mês"
          value={fmtBRL(historico[maiorMes].total_fatura)}
          sub={nomeMes(maiorMes)}
        />
        <StatCard
          label="Menor mês"
          value={fmtBRL(historico[menorMes].total_fatura)}
          sub={nomeMes(menorMes)}
        />
      </View>

      {/* Trend chart */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Evolução do total</Text>
        <LineChart
          data={{ labels, datasets: [{ data: totaisChart }] }}
          width={SCREEN_W - 64}
          height={200}
          chartConfig={CHART_CONFIG}
          bezier
          withShadow={false}
          withInnerLines
          withOuterLines={false}
          withVerticalLines={false}
          style={s.chart}
          formatYLabel={(v) => `${Math.round(Number(v) / 100) * 100}`}
        />
      </View>

      {/* Evolução por pessoa */}
      {pessoasChart.length >= 2 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Evolução por pessoa</Text>
          <LineChart
            data={{
              labels,
              datasets: pessoasChart.map((p) => ({
                data: p.data,
                color: (opacity = 1) => `rgba(${personColorsRgb[p.dono]}, ${opacity})`,
                strokeWidth: 2,
              })),
            }}
            width={SCREEN_W - 64}
            height={220}
            chartConfig={CHART_CONFIG}
            bezier
            withShadow={false}
            withInnerLines
            withOuterLines={false}
            withVerticalLines={false}
            withDots={pessoasChart.length <= 3}
            style={s.chart}
            formatYLabel={(v) => `${Math.round(Number(v) / 100) * 100}`}
          />
          <View style={s.legendRow}>
            {pessoasChart.map(({ dono }) => (
              <View key={dono} style={s.legendItem}>
                <View
                  style={[
                    s.legendDot,
                    { backgroundColor: personColors[dono] ?? CHART_COLOR_OUTROS },
                  ]}
                />
                <Text style={s.legendLabel}>{formatDono(dono)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Distribuição por pessoa */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Distribuição por pessoa</Text>
        <Text style={s.cardSub}>total acumulado no período</Text>
        {pessoasAcumulado.map(({ dono, total }) => {
          const color = personColors[dono] ?? CHART_COLOR_OUTROS;
          const pct = total / maxAcumulado;
          return (
            <View key={dono} style={s.barRow}>
              <View style={s.barHeader}>
                <Text style={[s.barNome, { color }]}>{formatDono(dono)}</Text>
                <Text style={s.barValor}>{fmtBRL(total)}</Text>
              </View>
              <View style={s.barTrack}>
                <View
                  style={[s.barFill, { width: `${pct * 100}%` as any, backgroundColor: color }]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Distribuição por categoria */}
      {categoriasAcumulado.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Distribuição por categoria</Text>
          <Text style={s.cardSub}>total acumulado no período</Text>
          {categoriasAcumulado.map(({ categoria, total }, i) => {
            const color = categoria === 'Outros' ? CHART_COLOR_OUTROS : corCategorica(i);
            const pct = total / maxCategoria;
            return (
              <View key={categoria} style={s.barRow}>
                <View style={s.barHeader}>
                  <Text style={[s.barNome, { color }]}>{categoria}</Text>
                  <Text style={s.barValor}>{fmtBRL(total)}</Text>
                </View>
                <View style={s.barTrack}>
                  <View
                    style={[s.barFill, { width: `${pct * 100}%` as any, backgroundColor: color }]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Média por pessoa */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Média por pessoa</Text>
        {pessoasStats.map(({ dono, media: m, meses: qtd }, i) => (
          <View key={dono} style={[s.pessoaRow, i === 0 && s.pessoaRowFirst]}>
            <View style={s.pessoaLeft}>
              <View
                style={[s.dot, { backgroundColor: personColors[dono] ?? CHART_COLOR_OUTROS }]}
              />
              <View>
                <Text style={s.pessoaNome}>{formatDono(dono)}</Text>
                <Text style={s.pessoaMeses}>
                  {qtd} {qtd === 1 ? 'mês' : 'meses'}
                </Text>
              </View>
            </View>
            <Text style={[s.pessoaValor, { color: personColors[dono] ?? CHART_COLOR_OUTROS }]}>
              {fmtBRL(m)}
            </Text>
          </View>
        ))}
      </View>

      {/* Top 5 maiores gastos */}
      {topItens.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Maiores gastos</Text>
          <Text style={s.cardSub}>top 5 itens individuais do período</Text>
          {topItens.map(({ desc, valor, dono, mes }, i) => (
            <View key={i} style={[s.topItemRow, i === 0 && s.topItemRowFirst]}>
              <View style={s.topItemLeft}>
                <Text style={s.topItemDesc} numberOfLines={1}>
                  {desc}
                </Text>
                <Text style={s.topItemMeta}>
                  {formatDono(dono)} · {nomeMes(mes)}
                </Text>
              </View>
              <Text style={s.topItemValor}>{fmtBRL(valor)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Gastos recorrentes */}
      {topFrequentes.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Gastos recorrentes</Text>
          <Text style={s.cardSub}>itens presentes em múltiplos meses</Text>
          {topFrequentes.map(({ desc, count, mediaValor }, i) => (
            <View key={desc} style={[s.frequenteRow, i === 0 && s.frequenteRowFirst]}>
              <Text style={s.frequenteDesc} numberOfLines={1}>
                {desc}
              </Text>
              <View style={s.frequenteMeta}>
                <Text style={s.frequenteMedia}>{fmtBRL(mediaValor)}</Text>
                <View style={[s.frequenteBadge, count === meses.length && s.frequenteBadgeFull]}>
                  <Text style={s.frequenteBadgeText}>
                    {count}/{meses.length}m
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
});

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={s.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {sub && <Text style={s.statSub}>{sub}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 32 },

  emptyScroll: { flexGrow: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 22 },

  headerRow: { marginBottom: 2 },
  headerTitle: { color: '#f1f5f9', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  headerAccent: { color: '#7c3aed' },
  headerSub: { color: '#475569', fontSize: 12, fontWeight: '500', marginTop: 2 },

  acumuladoCard: {
    backgroundColor: '#1e1040',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4c1d95',
    padding: 20,
  },
  acumuladoLabel: {
    color: '#a78bfa',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  acumuladoValor: {
    color: '#f1f5f9',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 6,
  },
  acumuladoSub: { color: '#7c3aed', fontSize: 12, fontWeight: '500', marginTop: 4 },

  row: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
  },
  statLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: { color: '#f1f5f9', fontSize: 15, fontWeight: '900', marginTop: 6 },
  statSub: {
    color: '#7c3aed',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    textTransform: 'capitalize',
  },

  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#f1f5f9',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardSub: { color: '#475569', fontSize: 11, marginTop: 2, marginBottom: 4 },
  chart: { borderRadius: 12, marginTop: 12, marginLeft: -12 },

  // Legenda multi-linha
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },

  // Distribuição
  barRow: { marginTop: 14 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barNome: { fontSize: 12, fontWeight: '700' },
  barValor: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  barTrack: { height: 6, backgroundColor: '#1e293b', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },

  // Média por pessoa
  pessoaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    marginTop: 4,
  },
  pessoaRowFirst: { marginTop: 12 },
  pessoaLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pessoaNome: { color: '#f1f5f9', fontSize: 13, fontWeight: '700' },
  pessoaMeses: { color: '#475569', fontSize: 11, marginTop: 1 },
  pessoaValor: { fontSize: 14, fontWeight: '700', fontFamily: 'monospace' },

  // Top itens
  topItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  topItemRowFirst: { marginTop: 10 },
  topItemLeft: { flex: 1, marginRight: 12 },
  topItemDesc: { color: '#f1f5f9', fontSize: 12, fontWeight: '700' },
  topItemMeta: { color: '#475569', fontSize: 11, marginTop: 2 },
  topItemValor: { color: '#a78bfa', fontSize: 14, fontWeight: '700', fontFamily: 'monospace' },

  // Recorrentes
  frequenteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  frequenteRowFirst: { marginTop: 10 },
  frequenteDesc: { color: '#cbd5e1', fontSize: 12, fontWeight: '600', flex: 1, marginRight: 8 },
  frequenteMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  frequenteMedia: { color: '#64748b', fontSize: 11, fontFamily: 'monospace' },
  frequenteBadge: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  frequenteBadgeFull: { backgroundColor: '#4c1d95' },
  frequenteBadgeText: { color: '#a78bfa', fontSize: 11, fontWeight: '700' },
});
