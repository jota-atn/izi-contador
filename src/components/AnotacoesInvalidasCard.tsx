import { memo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { AnotacaoInvalida } from '../types';
import { haptic } from '../utils/haptic';
import { IconWarning } from './icons/IconWarning';
import { IconClose } from './icons/IconClose';

interface Props {
  itens: AnotacaoInvalida[];
  onDispensar: (item: AnotacaoInvalida) => void;
}

function AnotacaoRow({
  item,
  onDispensar,
}: {
  item: AnotacaoInvalida;
  onDispensar: (item: AnotacaoInvalida) => void;
}) {
  const swipeableRef = useRef<SwipeableMethods>(null);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={() => (
        <View style={s.swipeAction}>
          <IconClose size={14} color="#94a3b8" />
          <Text style={s.swipeText}>Entendi</Text>
        </View>
      )}
      onSwipeableOpen={() => {
        haptic.light();
        onDispensar(item);
      }}
      rightThreshold={60}
      friction={2}
      overshootRight={false}
    >
      <Animated.View exiting={FadeOut.duration(150)} style={s.row}>
        <Text style={s.itemTitle} numberOfLines={1}>
          {item.titulo}
        </Text>
        <View style={s.amounts}>
          <Text style={s.soma}>Σ {item.soma.toFixed(2)}</Text>
          <Text style={s.sep}>vs</Text>
          <Text style={s.valor}>{item.valor.toFixed(2)}</Text>
        </View>
      </Animated.View>
    </ReanimatedSwipeable>
  );
}

export const AnotacoesInvalidasCard = memo(function AnotacoesInvalidasCard({
  itens,
  onDispensar,
}: Props) {
  if (itens.length === 0) return null;

  return (
    <Animated.View style={s.card} layout={LinearTransition.duration(200)}>
      <View style={s.header}>
        <IconWarning size={16} color="#fb923c" />
        <View style={s.headerTexts}>
          <Text style={s.title}>Anotações inválidas</Text>
          <Text style={s.subtitle}>
            {itens.length === 1
              ? '1 item com anotação divergente'
              : `${itens.length} itens com anotação divergente`}
          </Text>
        </View>
      </View>
      {itens.map((item, idx) => (
        <AnotacaoRow
          key={`${item.titulo}-${item.valor}-${item.soma}-${idx}`}
          item={item}
          onDispensar={onDispensar}
        />
      ))}
      <Text style={s.hint}>Arraste um item pra dispensar o aviso</Text>
    </Animated.View>
  );
});

const s = StyleSheet.create({
  card: {
    backgroundColor: '#1c0a00',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#7c2d12',
    padding: 16,
    gap: 10,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTexts: { flex: 1 },
  title: {
    color: '#fb923c',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: { color: '#92400e', fontSize: 11, fontWeight: '600', marginTop: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: '#1c0a00',
    paddingVertical: 4,
  },
  itemTitle: {
    color: '#fdba74',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
    textTransform: 'uppercase',
  },
  amounts: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  soma: { color: '#f87171', fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
  sep: { color: '#92400e', fontSize: 10 },
  valor: { color: '#fdba74', fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
  hint: {
    color: '#7c2d12',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  swipeAction: {
    width: 76,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    marginVertical: 2,
  },
  swipeText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
