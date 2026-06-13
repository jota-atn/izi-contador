import { Text, View } from 'react-native';
import { IconUsers } from './icons/IconUsers';

interface Props {
  total: number;
  numeroPessoas: number;
}

export function TotalCard({ total, numeroPessoas }: Props) {
  return (
    <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
      <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
        Fatura Total
      </Text>
      <Text className="text-white text-5xl font-black tracking-tighter mb-3">
        R$ {total.toFixed(2)}
      </Text>
      <View className="flex-row items-center self-start bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
        <View style={{ marginRight: 6 }}>
          <IconUsers size={12} color="#c084fc" />
        </View>
        <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider">
          {numeroPessoas} pessoas
        </Text>
      </View>
    </View>
  );
}
