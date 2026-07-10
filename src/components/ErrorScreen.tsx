import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { IconWarning } from './icons/IconWarning';

interface Props {
  message: string;
  onRetry: () => void;
}

export function ErrorScreen({ message, onRetry }: Props) {
  return (
    <SafeAreaView style={s.safeArea}>
      <Animated.View entering={FadeIn.duration(300)} style={s.content}>
        <View style={s.iconWrap}>
          <IconWarning size={52} color="#f59e0b" />
        </View>
        <Text style={s.message}>{message}</Text>
        <TouchableOpacity onPress={onRetry} style={s.btn}>
          <Text style={s.btnText}>Tentar novamente</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconWrap: { marginBottom: 16 },
  message: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  btn: {
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
