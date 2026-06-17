import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { Gasto, RelatorioPessoa } from '../types';
import { formatMesAnoUpper } from '../utils/meses';
import { haptic } from '../utils/haptic';
import { IconShare } from './icons/IconShare';
import { IconChevron } from './icons/IconChevron';
import { IconCheck } from './icons/IconCheck';

interface Props {
  pessoa: RelatorioPessoa;
  mes: string;
  oculto: boolean;
  pago: boolean;
  onToggleOculto: () => void;
  onTogglePago: () => void;
  onEditarItem: (item: Gasto) => void;
}

function formatItemShare(item: Gasto): string {
  const parcelaMatch = / - (\d+\/\d+)$/.exec(item.descricao);
  if (parcelaMatch) {
    const base = item.descricao.slice(0, parcelaMatch.index);
    return `- ${base} - ${item.valor.toFixed(2)} - ${parcelaMatch[1]}`;
  }
  return `- ${item.descricao} - ${item.valor.toFixed(2)}`;
}

export function PersonCard({
  pessoa,
  mes,
  oculto,
  pago,
  onToggleOculto,
  onTogglePago,
  onEditarItem,
}: Props) {
  const accentColor = pago ? '#4ade80' : '#7c3aed';
  const expanded = !oculto;
  const [shared, setShared] = useState(false);

  const handleCompartilhar = async () => {
    const itens = pessoa.itens.map(formatItemShare).join('\n');
    const texto = [
      `*FATURA ${formatMesAnoUpper(mes)}*`,
      `*${pessoa.dono}*`,
      itens,
      '————————',
      `*TOTAL = R$${pessoa.total_individual.toFixed(2)}*`,
    ].join('\n');
    const result = await Share.share({ message: texto });
    if (result.action === Share.sharedAction) {
      haptic.success();
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    }
  };

  return (
    <Animated.View style={[s.card, pago && s.cardPago]} layout={LinearTransition.duration(300)}>
      <TouchableOpacity
        style={s.header}
        onPress={() => {
          haptic.light();
          onToggleOculto();
        }}
        activeOpacity={0.7}
      >
        <View style={s.left}>
          <View style={[s.bar, { backgroundColor: accentColor }]} />
          <Text style={s.name}>{pessoa.dono}</Text>
        </View>

        <View style={s.right}>
          <View style={s.totalCol}>
            <Text style={[s.total, pago && s.totalPago]}>
              R$ {pessoa.total_individual.toFixed(2)}
            </Text>
            {!expanded && (
              <Text style={s.itemCount}>
                {pessoa.itens.length} {pessoa.itens.length === 1 ? 'item' : 'itens'}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              haptic.light();
              onTogglePago();
            }}
            style={[s.iconBtn, pago && s.iconBtnPago]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconCheck size={12} color={pago ? '#4ade80' : '#334155'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleCompartilhar();
            }}
            style={[s.iconBtn, shared && s.iconBtnShared]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconShare size={13} color={shared ? '#4ade80' : '#a78bfa'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              haptic.light();
              onToggleOculto();
            }}
            style={s.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconChevron size={14} color="#475569" up={expanded} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {expanded && (
        <Animated.View entering={FadeIn.duration(150)} style={s.body}>
          {[...pessoa.itens]
            .sort((a, b) => b.valor - a.valor)
            .map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={s.row}
                onPress={() => onEditarItem(item)}
                activeOpacity={0.7}
              >
                <View style={s.descCol}>
                  <Text style={s.desc}>{item.descricao}</Text>
                  <Text style={s.date}>{item.data}</Text>
                </View>
                <View style={s.badge}>
                  <Text style={s.badgeText}>R$ {item.valor.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  cardPago: { borderColor: '#14532d' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#1e293b40',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  bar: { width: 6, height: 20, borderRadius: 3 },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.3,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  totalCol: { alignItems: 'flex-end', marginRight: 4 },
  total: { color: '#a78bfa', fontFamily: 'monospace', fontWeight: '700', fontSize: 16 },
  totalPago: { color: '#4ade80' },
  itemCount: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPago: { backgroundColor: '#052e16', borderWidth: 1, borderColor: '#14532d' },
  iconBtnShared: { backgroundColor: '#052e16', borderWidth: 1, borderColor: '#14532d' },
  body: { paddingHorizontal: 24, paddingVertical: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  descCol: { flex: 1, marginRight: 16 },
  desc: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  date: { color: '#475569', fontSize: 10, marginTop: 2 },
  badge: { backgroundColor: '#1e293b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#94a3b8', fontFamily: 'monospace', fontSize: 11, fontWeight: '700' },
});
