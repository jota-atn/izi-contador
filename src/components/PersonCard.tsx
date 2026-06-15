import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RelatorioPessoa } from '../types';

interface Props {
  pessoa: RelatorioPessoa;
}

async function compartilharPessoa(pessoa: RelatorioPessoa) {
  const itens = pessoa.itens
    .map((i) => `  ${i.descricao} — R$ ${i.valor.toFixed(2)}`)
    .join('\n');
  const texto = `${pessoa.dono}, sua parte ficou R$ ${pessoa.total_individual.toFixed(2)}:\n${itens}`;
  await Share.share({ message: texto });
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
        <View style={s.right}>
          <Text className="text-purple-400 font-mono font-bold text-lg">
            R$ {pessoa.total_individual.toFixed(2)}
          </Text>
          <TouchableOpacity onPress={() => compartilharPessoa(pessoa)} style={s.shareBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.shareIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 py-4 gap-3">
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
    </View>
  );
}

const s = StyleSheet.create({
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareBtn: {
    marginLeft: 12,
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '800',
  },
});
