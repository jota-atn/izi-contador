import { memo } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { RelatorioPessoa } from '../types';
import { IconPieChart } from './icons/IconPieChart';
import { corCategorica } from '../utils/chartColors';
import { useTheme } from '../hooks/useTheme';

const SCREEN_W = Dimensions.get('window').width;

interface Props {
  pessoas: RelatorioPessoa[];
}

export const PieChartCard = memo(function PieChartCard({ pessoas }: Props) {
  const { colors } = useTheme();
  const data = [...pessoas]
    .sort((a, b) => b.total_individual - a.total_individual)
    .map((p, i) => ({
      name: p.dono,
      population: p.total_individual,
      color: corCategorica(i),
      legendFontColor: colors.textFaint,
      legendFontSize: 12,
    }));

  return (
    <View
      style={{
        backgroundColor: colors.bgElevated,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
          alignSelf: 'flex-start',
        }}
      >
        <View style={{ marginRight: 8 }}>
          <IconPieChart size={14} color={colors.textPrimary} />
        </View>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Divisão de Gastos
        </Text>
      </View>
      <PieChart
        data={data}
        width={SCREEN_W - 64}
        height={180}
        chartConfig={{
          color: () => colors.accent,
          labelColor: () => colors.textFaint,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="8"
        hasLegend
      />
    </View>
  );
});
