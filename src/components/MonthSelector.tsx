import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatMesAno } from '../utils/meses';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  meses: string[];
  selected: string;
  onChange: (mes: string) => void;
}

export function MonthSelector({ meses, selected, onChange }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
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

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    arrow: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: c.border,
      marginHorizontal: 12,
    },
    arrowDisabled: { backgroundColor: c.bgElevated },
    arrowText: { color: c.accentLight, fontSize: 18, fontWeight: '700' },
    arrowTextDisabled: { color: c.borderStrong },
    labelWrap: {
      minWidth: 170,
      alignItems: 'center',
      gap: 2,
    },
    label: {
      color: c.textPrimary,
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: -0.3,
      textAlign: 'center',
    },
    counter: {
      color: c.borderStrong,
      fontSize: 10,
      fontWeight: '600',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
}
