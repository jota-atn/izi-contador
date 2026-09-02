import { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { IconUsers } from './icons/IconUsers';
import { IconPdf } from './icons/IconPdf';
import { nomeMes } from '../utils/meses';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  total: number;
  numeroPessoas: number;
  totalAnterior?: number;
  mesAnterior?: string;
  totalPago: number;
  numPago: number;
  totalPendente: number;
  numPendente: number;
  onPagarFatura?: () => void;
  onCobrarPendentes?: () => void;
  onExportarPdf?: () => void;
}

export const TotalCard = memo(function TotalCard({
  total,
  numeroPessoas,
  totalAnterior,
  mesAnterior,
  totalPago,
  numPago,
  totalPendente,
  numPendente,
  onPagarFatura,
  onCobrarPendentes,
  onExportarPdf,
}: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const diff = totalAnterior !== undefined ? total - totalAnterior : null;
  const isUp = diff !== null && diff > 0;
  const isDown = diff !== null && diff < 0;
  const ratio = total > 0 ? totalPago / total : 0;
  const quitada = numeroPessoas > 0 && numPendente === 0;

  return (
    <View style={[s.card, quitada && s.cardQuitada]}>
      <View style={s.headerRow}>
        <Text style={s.headerLabel}>Fatura Total</Text>
        <View style={s.headerRight}>
          {quitada && (
            <View style={s.quitadaBadge}>
              <Text style={s.quitadaText}>✓ Quitada</Text>
            </View>
          )}
          {onExportarPdf && (
            <TouchableOpacity
              onPress={onExportarPdf}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconPdf size={18} color={colors.placeholder} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={s.totalValor}>R$ {total.toFixed(2)}</Text>

      <View style={s.badgesRow}>
        <View style={s.pessoasBadge}>
          <View style={{ marginRight: 6 }}>
            <IconUsers size={12} color="#c084fc" />
          </View>
          <Text style={s.pessoasBadgeText}>{numeroPessoas} pessoas</Text>
        </View>

        {diff !== null && mesAnterior && (
          <View
            style={[
              s.diffBadge,
              {
                backgroundColor: isUp
                  ? colors.dangerSurface
                  : isDown
                    ? '#071c0f'
                    : colors.bgElevated,
                borderColor: isUp
                  ? colors.dangerBorder
                  : isDown
                    ? colors.successBorder
                    : colors.border,
              },
            ]}
          >
            <Text
              style={{
                color: isUp ? colors.danger : isDown ? colors.success : colors.textFaint,
                fontSize: 11,
                fontWeight: '700',
              }}
            >
              {isUp ? '↑' : isDown ? '↓' : '='} R$ {Math.abs(diff).toFixed(2)} vs{' '}
              {nomeMes(mesAnterior)}
            </Text>
          </View>
        )}
      </View>

      {numeroPessoas > 0 && (
        <View style={s.painel}>
          <View style={s.barTrack}>
            <Animated.View
              layout={LinearTransition.duration(300)}
              style={[s.barFill, { flex: ratio }]}
            />
            <View style={{ flex: 1 - ratio }} />
          </View>

          <View style={s.rows}>
            <View style={s.row}>
              <View style={[s.dot, { backgroundColor: colors.success }]} />
              <Text style={s.label}>Pago</Text>
              <Text style={[s.pessoas, { color: colors.success }]}>
                {numPago} {numPago === 1 ? 'pessoa' : 'pessoas'}
              </Text>
              <Text style={[s.valor, { color: colors.success }]}>R$ {totalPago.toFixed(2)}</Text>
            </View>

            <View style={s.row}>
              <View style={[s.dot, { backgroundColor: colors.pending }]} />
              <Text style={s.label}>Pendente</Text>
              <Text style={[s.pessoas, { color: '#78716c' }]}>
                {numPendente} {numPendente === 1 ? 'pessoa' : 'pessoas'}
              </Text>
              <Text style={[s.valor, { color: colors.pending }]}>
                R$ {totalPendente.toFixed(2)}
              </Text>
            </View>
          </View>

          {numPendente > 0 && (onPagarFatura || onCobrarPendentes) && (
            <View style={s.acoesPendentes}>
              {onCobrarPendentes && (
                <TouchableOpacity
                  style={s.btnCobrar}
                  onPress={onCobrarPendentes}
                  activeOpacity={0.8}
                >
                  <Text style={s.btnCobrarText}>Cobrar pendentes</Text>
                </TouchableOpacity>
              )}
              {onPagarFatura && (
                <TouchableOpacity style={s.btnPagar} onPress={onPagarFatura} activeOpacity={0.8}>
                  <Text style={s.btnPagarText}>Pagar fatura</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
});

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.bgElevated,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardQuitada: { borderColor: c.successBorder },
    headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    headerLabel: {
      color: c.textFaint,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 8,
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    totalValor: {
      color: c.textPrimary,
      fontSize: 48,
      fontWeight: '900',
      letterSpacing: -2.4,
      marginBottom: 12,
    },
    badgesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    pessoasBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: c.accentSurface,
      borderWidth: 1,
      borderColor: c.accentSurfaceBorder,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 999,
    },
    // tom puxado pro roxo-400 do Tailwind (badge de pessoas), sem token equivalente exato
    pessoasBadgeText: {
      color: '#c084fc',
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    diffBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
    },
    quitadaBadge: {
      backgroundColor: c.successSurface,
      borderWidth: 1,
      borderColor: c.successBorder,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    quitadaText: { color: c.success, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    acoesPendentes: { flexDirection: 'row', gap: 8, marginTop: 4 },
    btnPagar: {
      flex: 1,
      backgroundColor: c.bgElevated2,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    btnPagarText: { color: c.textValue, fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
    btnCobrar: {
      flex: 1,
      backgroundColor: 'transparent',
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.accentSurfaceBorder,
    },
    btnCobrarText: { color: c.accentLight, fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
    painel: {
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 14,
      gap: 10,
    },
    barTrack: {
      flexDirection: 'row',
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      overflow: 'hidden',
      marginBottom: 4,
    },
    barFill: {
      backgroundColor: c.success,
      borderRadius: 2,
    },
    rows: { gap: 8 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    label: {
      color: c.textFaint,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      flex: 1,
    },
    pessoas: {
      fontSize: 10,
      fontWeight: '600',
    },
    valor: {
      fontFamily: 'monospace',
      fontSize: 13,
      fontWeight: '700',
      minWidth: 80,
      textAlign: 'right',
    },
  });
}
