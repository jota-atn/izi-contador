import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatMesAno } from '../utils/meses';

interface Props {
  meses: string[];
  selected: string;
  onChange: (mes: string) => void;
}

export function MonthSelector({ meses, selected, onChange }: Props) {
  const idx = meses.indexOf(selected);
  const canPrev = idx < meses.length - 1;
  const canNext = idx > 0;

  return (
    <View style={s.row}>
      <TouchableOpacity
        onPress={() => onChange(meses[idx + 1])}
        style={[s.arrow, !canPrev && s.arrowDisabled]}
        disabled={!canPrev}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[s.arrowText, !canPrev && s.arrowTextDisabled]}>←</Text>
      </TouchableOpacity>

      <View style={s.labelWrap}>
        <Text style={s.label}>{selected ? formatMesAno(selected) : '—'}</Text>
        <Text style={s.counter}>
          {meses.length - idx} de {meses.length}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => onChange(meses[idx - 1])}
        style={[s.arrow, !canNext && s.arrowDisabled]}
        disabled={!canNext}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[s.arrowText, !canNext && s.arrowTextDisabled]}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  arrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#1e293b',
    marginHorizontal: 12,
  },
  arrowDisabled: { backgroundColor: '#0f172a' },
  arrowText: { color: '#a78bfa', fontSize: 18, fontWeight: '700' },
  arrowTextDisabled: { color: '#334155' },
  labelWrap: {
    minWidth: 170,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  counter: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
