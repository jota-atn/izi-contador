import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  message: string;
  onRetry: () => void;
}

export function ErrorScreen({ message, onRetry }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-900 px-8">
      <Text className="text-5xl mb-4">⚠️</Text>
      <Text className="text-white text-lg font-bold text-center mb-6">{message}</Text>
      <TouchableOpacity onPress={onRetry} className="bg-purple-600 px-8 py-3 rounded-full">
        <Text className="text-white font-bold uppercase tracking-wider text-sm">
          Tentar novamente
        </Text>
      </TouchableOpacity>
    </View>
  );
}
