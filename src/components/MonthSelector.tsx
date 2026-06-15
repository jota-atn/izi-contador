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

      <Text style={s.label}>{selected ? formatMesAno(selected) : '—'}</Text>

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
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    minWidth: 170,
    textAlign: 'center',
  },
});
