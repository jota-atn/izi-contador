import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  message?: string;
}

export function LoadingScreen({ message = 'Carregando...' }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <SafeAreaView style={s.safeArea}>
      <Animated.View entering={FadeIn.duration(300)} style={s.content}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={s.message}>{message}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.bg },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    message: { color: c.textMuted, marginTop: 16, fontWeight: '600' },
  });
}
