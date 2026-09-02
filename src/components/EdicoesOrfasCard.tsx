import { memo, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { haptic } from '../utils/haptic';
import { IconWarning } from './icons/IconWarning';
import { IconClose } from './icons/IconClose';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

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
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const swipeableRef = useRef<SwipeableMethods>(null);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={() => (
        <View style={s.swipeAction}>
          <IconClose size={14} color={colors.textMuted} />
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
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  if (itens.length === 0) return null;

  return (
    <Animated.View style={s.card} layout={LinearTransition.duration(200)}>
      <View style={s.header}>
        <IconWarning size={16} color={colors.warning} />
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

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.warningSurface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.warningBorder,
      padding: 16,
      gap: 10,
      overflow: 'hidden',
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerTexts: { flex: 1 },
    title: {
      color: c.warning,
      fontSize: 13,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    // tom âmbar bem apagado, específico deste card — mantido
    subtitle: { color: '#92400e', fontSize: 11, fontWeight: '600', marginTop: 1 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      backgroundColor: c.warningSurface,
      paddingVertical: 4,
    },
    itemTitle: {
      color: c.warningTextOn,
      fontSize: 11,
      fontWeight: '700',
      flex: 1,
      textTransform: 'uppercase',
    },
    perda: { color: c.danger, fontSize: 10, fontWeight: '700', flexShrink: 0 },
    hint: {
      color: c.warningBorder,
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
      backgroundColor: c.bgElevated,
      borderRadius: 10,
      marginVertical: 2,
    },
    swipeText: {
      color: c.textMuted,
      fontSize: 9,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
  });
}
