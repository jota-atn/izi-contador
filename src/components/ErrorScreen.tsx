import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { IconWarning } from './icons/IconWarning';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  message: string;
  onRetry: () => void;
}

export function ErrorScreen({ message, onRetry }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <SafeAreaView style={s.safeArea}>
      <Animated.View entering={FadeIn.duration(300)} style={s.content}>
        <View style={s.iconWrap}>
          <IconWarning size={52} color={colors.pending} />
        </View>
        <Text style={s.message}>{message}</Text>
        <TouchableOpacity onPress={onRetry} style={s.btn}>
          <Text style={s.btnText}>Tentar novamente</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.bg },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    iconWrap: { marginBottom: 16 },
    message: {
      color: c.textPrimary,
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 24,
    },
    btn: {
      // tom levemente distinto do accent padrão, específico dessa tela cheia — mantido
      backgroundColor: '#9333ea',
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 999,
    },
    btnText: {
      color: '#fff',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontSize: 13,
    },
  });
}
