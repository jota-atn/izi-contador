import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { IconCard } from './icons/IconCard';
import { IconGoogle } from './icons/IconGoogle';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  onSignIn: () => void;
}

export function LoginScreen({ onSignIn }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <SafeAreaView style={s.safeArea}>
      <Animated.View entering={FadeIn.duration(350)} style={s.content}>
        <View style={s.iconWrap}>
          <IconCard size={36} color="#ffffff" />
        </View>

        <Text style={s.title}>
          Izi<Text style={s.titleAccent}>Contador</Text>
        </Text>
        <Text style={s.subtitle}>
          Conecte sua conta Google para{'\n'}acessar o extrato da fatura Nubank
        </Text>

        <TouchableOpacity onPress={onSignIn} activeOpacity={0.85} style={s.btn}>
          <IconGoogle size={20} />
          <Text style={s.btnText}>Entrar com Google</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.bg },
    content: { flex: 1, paddingHorizontal: 32, justifyContent: 'center', alignItems: 'center' },
    iconWrap: {
      width: 80,
      height: 80,
      // tom levemente distinto do accent padrão, específico dessa tela cheia — mantido
      backgroundColor: '#9333ea',
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
    },
    title: {
      color: c.textPrimary,
      fontSize: 36,
      fontWeight: '900',
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    titleAccent: { color: '#a855f7' },
    subtitle: {
      color: c.textMuted,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 48,
      lineHeight: 24,
    },
    btn: {
      // botão de marca do Google — branco fixo nos dois temas
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      backgroundColor: '#fff',
      paddingVertical: 16,
      borderRadius: 16,
    },
    btnText: { color: '#0f172a', fontWeight: '700', fontSize: 16 },
  });
}
