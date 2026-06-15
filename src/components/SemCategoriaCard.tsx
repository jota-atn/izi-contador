import { StyleSheet, Text, View } from 'react-native';
import { RelatorioPessoa } from '../types';
import { IconWarning } from './icons/IconWarning';

interface Props {
  grupo: RelatorioPessoa;
}

export function SemCategoriaCard({ grupo }: Props) {
  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <IconWarning size={14} color="#fb923c" />
          <Text style={s.title}>Não identificados</Text>
        </View>
        <Text style={s.total}>R$ {grupo.total_individual.toFixed(2)}</Text>
      </View>

      <View style={s.body}>
        {grupo.itens.map((item, idx) => (
          <View key={idx} style={s.row}>
            <View style={s.descCol}>
              <Text style={s.desc}>{item.descricao}</Text>
              <Text style={s.date}>{item.data}</Text>
            </View>
            <View style={s.badge}>
              <Text style={s.badgeText}>R$ {item.valor.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#431407',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#1c0a00',
    borderBottomWidth: 1,
    borderBottomColor: '#431407',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: '#fb923c', fontSize: 13, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' },
  total: { color: '#fb923c', fontFamily: 'monospace', fontWeight: '700', fontSize: 16 },
  body: { paddingHorizontal: 24, paddingVertical: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  descCol: { flex: 1, marginRight: 16 },
  desc: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  date: { color: '#475569', fontSize: 10, marginTop: 2 },
  badge: { backgroundColor: '#1c0a00', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#431407' },
  badgeText: { color: '#fb923c', fontFamily: 'monospace', fontSize: 11, fontWeight: '700' },
});
