import { memo, useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Historico } from '../hooks/useHistorico';
import { MESES_PT, nomeMes } from '../utils/meses';

const SCREEN_W = Dimensions.get('window').width;
const MESES_CURTOS = MESES_PT.map((m) => m.substring(0, 3));
const SEM_CATEGORIA = '__SEM_CATEGORIA__';
const CHART_MAX_MESES = 7;

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
}

export const EstatsScreen = memo(function EstatsScreen({ historico, meses }: Props) {
  // Ascending (oldest → newest) for chronological display
  const mesesCron = useMemo(() => [...meses].reverse(), [meses]);

  const mesesChart = useMemo(() => mesesCron.slice(-CHART_MAX_MESES), [mesesCron]);

  const totaisChart = useMemo(
    () => mesesChart.map((m) => historico[m].total_fatura),
    [mesesChart, historico],
  );

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

  const pessoasStats = useMemo(() => {
    const byPessoa: Record<string, number[]> = {};
    mesesCron.forEach((mes) => {
      historico[mes].relatorio_por_pessoa
        .filter((p) => p.dono !== SEM_CATEGORIA)
        .forEach((p) => {
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

  if (meses.length < 2) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyTitle}>Sem dados suficientes</Text>
        <Text style={s.emptyText}>
          Acumule pelo menos 2 meses de fatura para ver a evolução dos gastos.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary */}
      <View style={s.row}>
        <StatCard label="Média mensal" value={fmtBRL(media)} />
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

      {/* Por pessoa */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Média por pessoa</Text>
        <Text style={s.cardSub}>
          {meses.length} {meses.length === 1 ? 'mês analisado' : 'meses analisados'}
        </Text>
        {pessoasStats.map(({ dono, media: m, meses: qtd }, i) => (
          <View key={dono} style={[s.pessoaRow, i === 0 && s.pessoaRowFirst]}>
            <View style={s.pessoaLeft}>
              <View style={s.dot} />
              <View>
                <Text style={s.pessoaNome}>{dono}</Text>
                <Text style={s.pessoaMeses}>
                  {qtd} {qtd === 1 ? 'mês' : 'meses'}
                </Text>
              </View>
            </View>
            <Text style={s.pessoaValor}>{fmtBRL(m)}</Text>
          </View>
        ))}
      </View>
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
  content: { padding: 16, gap: 14, paddingBottom: 24 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 22 },

  row: { flexDirection: 'row', gap: 10 },

  statCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
  },
  statLabel: { color: '#475569', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { color: '#f1f5f9', fontSize: 14, fontWeight: '900', marginTop: 6 },
  statSub: { color: '#7c3aed', fontSize: 10, fontWeight: '600', marginTop: 3, textTransform: 'capitalize' },

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
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#7c3aed' },
  pessoaNome: { color: '#f1f5f9', fontSize: 13, fontWeight: '700' },
  pessoaMeses: { color: '#475569', fontSize: 11, marginTop: 1 },
  pessoaValor: { color: '#a78bfa', fontSize: 14, fontWeight: '700', fontFamily: 'monospace' },
});
