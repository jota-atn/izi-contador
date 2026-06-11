import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconWarning } from './icons/IconWarning';

interface Props {
  message: string;
  onRetry: () => void;
}

export function ErrorScreen({ message, onRetry }: Props) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-slate-950 px-8">
      <View className="mb-4">
        <IconWarning size={52} color="#f59e0b" />
      </View>
      <Text className="text-white text-lg font-bold text-center mb-6">{message}</Text>
      <TouchableOpacity onPress={onRetry} className="bg-purple-600 px-8 py-3 rounded-full">
        <Text className="text-white font-bold uppercase tracking-wider text-sm">
          Tentar novamente
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
