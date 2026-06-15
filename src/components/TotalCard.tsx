import { Text, View } from 'react-native';
import { IconUsers } from './icons/IconUsers';
import { nomeMes } from '../utils/meses';

interface Props {
  total: number;
  numeroPessoas: number;
  totalAnterior?: number;
  mesAnterior?: string;
}

export function TotalCard({ total, numeroPessoas, totalAnterior, mesAnterior }: Props) {
  const diff = totalAnterior !== undefined ? total - totalAnterior : null;
  const isUp = diff !== null && diff > 0;
  const isDown = diff !== null && diff < 0;

  return (
    <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
      <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
        Fatura Total
      </Text>
      <Text className="text-white text-5xl font-black tracking-tighter mb-3">
        R$ {total.toFixed(2)}
      </Text>

      <View className="flex-row items-center" style={{ gap: 8 }}>
        <View className="flex-row items-center self-start bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
          <View style={{ marginRight: 6 }}>
            <IconUsers size={12} color="#c084fc" />
          </View>
          <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider">
            {numeroPessoas} pessoas
          </Text>
        </View>

        {diff !== null && mesAnterior && (
          <View
            className="flex-row items-center self-start px-3 py-1 rounded-full"
            style={{
              backgroundColor: isUp ? '#1c0707' : isDown ? '#071c0f' : '#0f172a',
              borderWidth: 1,
              borderColor: isUp ? '#7f1d1d' : isDown ? '#14532d' : '#1e293b',
            }}
          >
            <Text
              style={{
                color: isUp ? '#f87171' : isDown ? '#4ade80' : '#64748b',
                fontSize: 11,
                fontWeight: '700',
              }}
            >
              {isUp ? '↑' : isDown ? '↓' : '='} R$ {Math.abs(diff).toFixed(2)} vs {nomeMes(mesAnterior)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
