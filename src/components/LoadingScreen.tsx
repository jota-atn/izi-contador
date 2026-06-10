import { ActivityIndicator, Text, View } from 'react-native';

interface Props {
  message?: string;
}

export function LoadingScreen({ message = 'Carregando...' }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <ActivityIndicator size="large" color="#7C3AED" />
      <Text className="text-slate-400 mt-4 font-semibold">{message}</Text>
    </View>
  );
}
