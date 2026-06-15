import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gasto, RelatorioPessoa } from '../types';
import { IconShare } from './icons/IconShare';

interface Props {
  pessoa: RelatorioPessoa;
  mes: string; // "YYYY-MM"
}

const MESES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
];

function formatMes(mes: string): string {
  const [year, month] = mes.split('-');
  return `${MESES[parseInt(month, 10) - 1]} ${year}`;
}

function formatItemShare(item: Gasto): string {
  const parcelaMatch = / - (\d+\/\d+)$/.exec(item.descricao);
  if (parcelaMatch) {
    const base = item.descricao.slice(0, parcelaMatch.index);
    return `- ${base} - ${item.valor.toFixed(2)} - ${parcelaMatch[1]}`;
  }
  return `- ${item.descricao} - ${item.valor.toFixed(2)}`;
}

async function compartilharPessoa(pessoa: RelatorioPessoa, mes: string) {
  const itens = pessoa.itens.map(formatItemShare).join('\n');
  const texto = [
    `*FATURA ${formatMes(mes)}*`,
    `*${pessoa.dono.toUpperCase()}*`,
    itens,
    '————————',
    `*TOTAL = R$${pessoa.total_individual.toFixed(2)}*`,
  ].join('\n');
  await Share.share({ message: texto });
}

export function PersonCard({ pessoa, mes }: Props) {
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
          <TouchableOpacity
            onPress={() => compartilharPessoa(pessoa, mes)}
            style={s.shareBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconShare size={14} color="#a78bfa" />
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
});
