import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { IconUsers } from './icons/IconUsers';
import { IconPdf } from './icons/IconPdf';
import { nomeMes } from '../utils/meses';

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
  onExportarPdf,
}: Props) {
  const diff = totalAnterior !== undefined ? total - totalAnterior : null;
  const isUp = diff !== null && diff > 0;
  const isDown = diff !== null && diff < 0;
  const ratio = total > 0 ? totalPago / total : 0;
  const quitada = numeroPessoas > 0 && numPendente === 0;

  return (
    <View
      className="bg-slate-900 rounded-3xl p-6 border border-slate-800"
      style={quitada ? s.cardQuitada : undefined}
    >
      <View style={s.headerRow}>
        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
          Fatura Total
        </Text>
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
              <IconPdf size={18} color="#475569" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text className="text-white text-5xl font-black tracking-tighter mb-3">
        R$ {total.toFixed(2)}
      </Text>

      <View className="flex-row items-center" style={{ gap: 8, marginBottom: 16 }}>
        <View className="flex-row items-center self-start bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
          <View style={{ marginRight: 6 }}>
            <IconUsers size={12} color="#c084fc" />
          </View>
          <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider">
            {numeroPessoas} pessoas
          </Text>
        </View>

        {diff !== null && mesAnterior && (
          <View
            className="flex-row items-center self-start px-3 py-1 rounded-full"
            style={{
              backgroundColor: isUp ? '#1c0707' : isDown ? '#071c0f' : '#0f172a',
              borderWidth: 1,
              borderColor: isUp ? '#7f1d1d' : isDown ? '#14532d' : '#1e293b',
            }}
          >
            <Text
              style={{
                color: isUp ? '#f87171' : isDown ? '#4ade80' : '#64748b',
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
              <View style={[s.dot, { backgroundColor: '#4ade80' }]} />
              <Text style={s.label}>Pago</Text>
              <Text style={[s.pessoas, { color: '#4ade80' }]}>
                {numPago} {numPago === 1 ? 'pessoa' : 'pessoas'}
              </Text>
              <Text style={[s.valor, { color: '#4ade80' }]}>R$ {totalPago.toFixed(2)}</Text>
            </View>

            <View style={s.row}>
              <View style={[s.dot, { backgroundColor: '#f59e0b' }]} />
              <Text style={s.label}>Pendente</Text>
              <Text style={[s.pessoas, { color: '#78716c' }]}>
                {numPendente} {numPendente === 1 ? 'pessoa' : 'pessoas'}
              </Text>
              <Text style={[s.valor, { color: '#f59e0b' }]}>R$ {totalPendente.toFixed(2)}</Text>
            </View>
          </View>

          {numPendente > 0 && onPagarFatura && (
            <TouchableOpacity style={s.btnPagar} onPress={onPagarFatura} activeOpacity={0.8}>
              <Text style={s.btnPagarText}>Pagar fatura</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

const s = StyleSheet.create({
  cardQuitada: { borderColor: '#14532d' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  quitadaBadge: {
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#14532d',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  quitadaText: { color: '#4ade80', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  btnPagar: {
    marginTop: 4,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  btnPagarText: { color: '#e2e8f0', fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
  painel: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 14,
    gap: 10,
  },
  barTrack: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
    marginBottom: 4,
  },
  barFill: {
    backgroundColor: '#4ade80',
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
    color: '#64748b',
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
