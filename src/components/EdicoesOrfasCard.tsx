import { memo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { haptic } from '../utils/haptic';
import { IconWarning } from './icons/IconWarning';
import { IconClose } from './icons/IconClose';

export interface OrfaRow {
  key: string;
  titulo: string;
  descricaoPerda: string;
  onDispensar: () => void;
}

interface Props {
  itens: OrfaRow[];
}

function LinhaOrfa({ item }: { item: OrfaRow }) {
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
        item.onDispensar();
      }}
      rightThreshold={60}
      friction={2}
      overshootRight={false}
    >
      <Animated.View exiting={FadeOut.duration(150)} style={s.row}>
        <Text style={s.itemTitle} numberOfLines={1}>
          {item.titulo}
        </Text>
        <Text style={s.perda} numberOfLines={1}>
          {item.descricaoPerda}
        </Text>
      </Animated.View>
    </ReanimatedSwipeable>
  );
}

export const EdicoesOrfasCard = memo(function EdicoesOrfasCard({ itens }: Props) {
  if (itens.length === 0) return null;

  return (
    <Animated.View style={s.card} layout={LinearTransition.duration(200)}>
      <View style={s.header}>
        <IconWarning size={16} color="#fb923c" />
        <View style={s.headerTexts}>
          <Text style={s.title}>Edições divergentes</Text>
          <Text style={s.subtitle}>
            {itens.length === 1
              ? '1 edição não pôde ser aplicada — a anotação do Nubank mudou'
              : `${itens.length} edições não puderam ser aplicadas — a anotação do Nubank mudou`}
          </Text>
        </View>
      </View>
      {itens.map((item) => (
        <LinhaOrfa key={item.key} item={item} />
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
  perda: { color: '#f87171', fontSize: 10, fontWeight: '700', flexShrink: 0 },
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
