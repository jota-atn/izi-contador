import { memo } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { RelatorioPessoa } from '../types';
import { IconPieChart } from './icons/IconPieChart';
import { corCategorica } from '../utils/chartColors';

const SCREEN_W = Dimensions.get('window').width;

interface Props {
  pessoas: RelatorioPessoa[];
}

export const PieChartCard = memo(function PieChartCard({ pessoas }: Props) {
  const data = [...pessoas]
    .sort((a, b) => b.total_individual - a.total_individual)
    .map((p, i) => ({
      name: p.dono,
      population: p.total_individual,
      color: corCategorica(i),
      legendFontColor: '#94a3b8',
      legendFontSize: 12,
    }));

  return (
    <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800 items-center">
      <View className="flex-row items-center mb-4 self-start">
        <View style={{ marginRight: 8 }}>
          <IconPieChart size={14} color="#ffffff" />
        </View>
        <Text className="text-white text-sm font-bold uppercase tracking-wider">
          Divisão de Gastos
        </Text>
      </View>
      <PieChart
        data={data}
        width={SCREEN_W - 64}
        height={180}
        chartConfig={{
          color: () => '#7C3AED',
          labelColor: () => '#94a3b8',
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="8"
        hasLegend
      />
    </View>
  );
});
