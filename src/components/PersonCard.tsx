import { ScrollView, Text, View } from 'react-native';
import { RelatorioPessoa } from '../types';

interface Props {
  pessoa: RelatorioPessoa;
}

export function PersonCard({ pessoa }: Props) {
  return (
    <View className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
      <View className="bg-slate-800/50 px-6 py-4 flex-row items-center justify-between border-b border-slate-800">
        <View className="flex-row items-center gap-2">
          <View className="w-1.5 h-5 bg-purple-500 rounded-full" />
          <Text className="text-white font-black text-lg uppercase tracking-tight">
            {pessoa.dono}
          </Text>
        </View>
        <Text className="text-purple-400 font-mono font-bold text-lg">
          R$ {pessoa.total_individual.toFixed(2)}
        </Text>
      </View>

      <ScrollView
        className="px-6 py-4"
        style={{ maxHeight: 320 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          {pessoa.itens.map((item, idx) => (
            <View key={idx} className="flex-row items-start justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-slate-200 text-xs font-bold uppercase tracking-tight">
                  {item.descricao}
                </Text>
                <Text className="text-slate-500 text-[10px] mt-0.5">{item.data}</Text>
              </View>
              <View className="bg-slate-800 px-2 py-1 rounded">
                <Text className="text-slate-300 font-mono text-xs font-bold">
                  R$ {item.valor.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
