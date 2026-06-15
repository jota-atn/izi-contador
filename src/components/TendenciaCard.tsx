import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Historico } from '../hooks/useHistorico';

const SCREEN_W = Dimensions.get('window').width;

const MESES_ABREV = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

interface Props {
  historico: Historico;
  meses: string[]; // reverse-chrono (newest first)
}

export function TendenciaCard({ historico, meses }: Props) {
  if (meses.length < 2) return null;

  const messCron = [...meses].reverse();
  const labels = messCron.map((m) => {
    const month = parseInt(m.split('-')[1], 10);
    return MESES_ABREV[month - 1];
  });
  const valores = messCron.map((m) => historico[m]?.total_fatura ?? 0);

  return (
    <View style={{ backgroundColor: '#0f172a', borderRadius: 24, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden' }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
        <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          Tendência
        </Text>
      </View>
      <LineChart
        data={{ labels, datasets: [{ data: valores }] }}
        width={SCREEN_W - 32}
        height={160}
        chartConfig={{
          backgroundColor: '#0f172a',
          backgroundGradientFrom: '#0f172a',
          backgroundGradientTo: '#0f172a',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(167, 139, 250, ${opacity})`,
          labelColor: () => '#475569',
          propsForDots: { r: '4', strokeWidth: '2', stroke: '#7c3aed', fill: '#a78bfa' },
          propsForBackgroundLines: { stroke: '#1e293b', strokeDasharray: '' },
        }}
        bezier
        withInnerLines
        withOuterLines={false}
        style={{ marginLeft: -16 }}
      />
    </View>
  );
}
