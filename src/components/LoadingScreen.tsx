import { ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  message?: string;
}

export function LoadingScreen({ message = 'Carregando...' }: Props) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-slate-950">
      <ActivityIndicator size="large" color="#7C3AED" />
      <Text className="text-slate-400 mt-4 font-semibold">{message}</Text>
    </SafeAreaView>
  );
}
