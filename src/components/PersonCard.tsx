import { memo, useRef, useState } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Gasto, RelatorioPessoa } from '../types';
import { formatMesAnoUpper } from '../utils/meses';
import { haptic } from '../utils/haptic';
import { IconShare } from './icons/IconShare';
import { IconChevron } from './icons/IconChevron';
import { IconCheck } from './icons/IconCheck';
import { IconQR } from './icons/IconQR';

interface Props {
  pessoa: RelatorioPessoa;
  mes: string;
  oculto: boolean;
  pago: boolean;
  pixKey?: string;
  onToggleOculto: (mes: string, dono: string) => void;
  onTogglePago: (mes: string, dono: string) => void;
  onEditarItem: (item: Gasto, dono: string) => void;
  onCompartilharQR: (pessoa: RelatorioPessoa, mes: string) => void;
}

function formatItemShare(item: Gasto): string {
  const parcelaMatch = / - (\d+\/\d+)$/.exec(item.descricao);
  if (parcelaMatch) {
    const base = item.descricao.slice(0, parcelaMatch.index);
    return `- ${base} - ${item.valor.toFixed(2)} - ${parcelaMatch[1]}`;
  }
  return `- ${item.descricao} - ${item.valor.toFixed(2)}`;
}

export const PersonCard = memo(function PersonCard({
  pessoa,
  mes,
  oculto,
  pago,
  pixKey,
  onToggleOculto,
  onTogglePago,
  onEditarItem,
  onCompartilharQR,
}: Props) {
  const accentColor = pago ? '#4ade80' : '#7c3aed';
  const expanded = !oculto;
  const [shared, setShared] = useState(false);
  const swipeableRef = useRef<SwipeableMethods>(null);

  const handleCompartilhar = async () => {
    const itens = pessoa.itens.map(formatItemShare).join('\n');
    const linhas = [
      `*FATURA ${formatMesAnoUpper(mes)}*`,
      `*${pessoa.dono}*`,
      itens,
      '————————',
      `*TOTAL = R$${pessoa.total_individual.toFixed(2)}*`,
    ];
    if (pixKey) linhas.push(`*CHAVE PIX:* ${pixKey}`);
    const result = await Share.share({ message: linhas.join('\n') });
    if (result.action === Share.sharedAction) {
      haptic.success();
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    }
  };

  const handleSwipe = () => {
    haptic.success();
    onTogglePago(mes, pessoa.dono);
    swipeableRef.current?.close();
  };

  const renderLeftAction = () => (
    <View style={[s.swipeAction, pago ? s.swipeActionUndo : s.swipeActionPay]}>
      <View style={[s.swipeActionFill, pago ? s.swipeActionUndo : s.swipeActionPay]} />
      <IconCheck size={20} color={pago ? '#f97316' : '#4ade80'} />
      <Text style={[s.swipeText, pago && s.swipeTextUndo]}>
        {pago ? 'Desfazer' : 'Pago'}
      </Text>
    </View>
  );

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftAction}
      onSwipeableOpen={() => handleSwipe()}
      leftThreshold={60}
      friction={2}
      overshootLeft={false}
    >
      <Animated.View style={[s.card, pago && s.cardPago]} layout={LinearTransition.duration(300)}>
        <TouchableOpacity
          style={s.header}
          onPress={() => {
            haptic.light();
            onToggleOculto(mes, pessoa.dono);
          }}
          activeOpacity={0.7}
        >
          <View style={s.left}>
            <View style={[s.bar, { backgroundColor: accentColor }]} />
            <View style={s.nameValueCol}>
              <Text style={s.name}>{pessoa.dono}</Text>
              <Text style={[s.total, pago && s.totalPago]}>
                R$ {pessoa.total_individual.toFixed(2)}
              </Text>
              {!expanded && (
                <Text style={s.itemCount}>
                  {pessoa.itens.length} {pessoa.itens.length === 1 ? 'item' : 'itens'}
                </Text>
              )}
            </View>
          </View>

          <View style={s.right}>
            <TouchableOpacity
              onPress={handleCompartilhar}
              style={[s.iconBtn, shared && s.iconBtnShared]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconShare size={13} color={shared ? '#4ade80' : '#a78bfa'} />
            </TouchableOpacity>

            {pixKey && (
              <TouchableOpacity
                onPress={() => onCompartilharQR(pessoa, mes)}
                style={s.iconBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconQR size={13} color="#a78bfa" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => {
                haptic.light();
                onToggleOculto(mes, pessoa.dono);
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
                  onPress={() => onEditarItem(item, pessoa.dono)}
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
    </ReanimatedSwipeable>
  );
});

const s = StyleSheet.create({
  swipeAction: {
    width: 88,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  swipeActionFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: -30,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  swipeActionPay: { backgroundColor: '#052e16' },
  swipeActionUndo: { backgroundColor: '#431407' },
  swipeText: {
    color: '#4ade80',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  swipeTextUndo: { color: '#f97316' },

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
  bar: { width: 6, borderRadius: 3, alignSelf: 'stretch' },
  nameValueCol: { flex: 1, gap: 3 },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.3,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 8 },
  total: { color: '#a78bfa', fontFamily: 'monospace', fontWeight: '700', fontSize: 15 },
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
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
