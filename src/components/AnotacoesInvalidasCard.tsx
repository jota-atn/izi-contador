import { StyleSheet, Text, View } from 'react-native';
import { AnotacaoInvalida } from '../types';

interface Props {
  itens: AnotacaoInvalida[];
}

export function AnotacoesInvalidasCard({ itens }: Props) {
  if (itens.length === 0) return null;

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.icon}>⚠</Text>
        <View>
          <Text style={s.title}>Anotações inválidas</Text>
          <Text style={s.subtitle}>
            {itens.length === 1 ? '1 item com anotação divergente' : `${itens.length} itens com anotação divergente`}
          </Text>
        </View>
      </View>
      {itens.map((item, idx) => (
        <View key={idx} style={s.row}>
          <Text style={s.itemTitle} numberOfLines={1}>{item.titulo}</Text>
          <View style={s.amounts}>
            <Text style={s.soma}>Σ {item.soma.toFixed(2)}</Text>
            <Text style={s.sep}>vs</Text>
            <Text style={s.valor}>{item.valor.toFixed(2)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#1c0a00',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#7c2d12',
    padding: 16,
    gap: 10,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { fontSize: 18, color: '#fb923c' },
  title: { color: '#fb923c', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  subtitle: { color: '#92400e', fontSize: 11, fontWeight: '600', marginTop: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  itemTitle: { color: '#fdba74', fontSize: 11, fontWeight: '700', flex: 1, textTransform: 'uppercase' },
  amounts: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  soma: { color: '#f87171', fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
  sep: { color: '#92400e', fontSize: 10 },
  valor: { color: '#fdba74', fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
});
