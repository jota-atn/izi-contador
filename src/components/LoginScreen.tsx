import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { IconCard } from './icons/IconCard';
import { IconGoogle } from './icons/IconGoogle';

interface Props {
  onSignIn: () => void;
}

export function LoginScreen({ onSignIn }: Props) {
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

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617' },
  content: { flex: 1, paddingHorizontal: 32, justifyContent: 'center', alignItems: 'center' },
  iconWrap: {
    width: 80,
    height: 80,
    backgroundColor: '#9333ea',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: -0.5, marginBottom: 8 },
  titleAccent: { color: '#a855f7' },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  btn: {
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
