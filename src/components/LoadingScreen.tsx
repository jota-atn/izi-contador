import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Props {
  message?: string;
}

export function LoadingScreen({ message = 'Carregando...' }: Props) {
  return (
    <SafeAreaView style={s.safeArea}>
      <Animated.View entering={FadeIn.duration(300)} style={s.content}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={s.message}>{message}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  message: { color: '#94a3b8', marginTop: 16, fontWeight: '600' },
});
