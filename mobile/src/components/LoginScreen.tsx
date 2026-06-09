import { Text, TouchableOpacity, View } from 'react-native';
import type { AuthRequest } from 'expo-auth-session';

interface Props {
  onSignIn: () => void;
  request: AuthRequest | null;
}

export function LoginScreen({ onSignIn, request }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-8">
      <View className="bg-purple-600 rounded-2xl p-5 mb-8">
        <Text className="text-white text-4xl">💳</Text>
      </View>

      <Text className="text-white text-3xl font-black tracking-tight mb-2">
        Izi<Text className="text-purple-500">Contador</Text>
      </Text>
      <Text className="text-slate-400 text-sm text-center mb-12">
        Conecte sua conta Google para acessar{'\n'}o extrato da sua fatura Nubank
      </Text>

      <TouchableOpacity
        onPress={onSignIn}
        disabled={!request}
        className="flex-row items-center gap-3 bg-white px-6 py-4 rounded-2xl disabled:opacity-50"
      >
        <Text className="text-lg">🔑</Text>
        <Text className="text-slate-900 font-bold text-base">Entrar com Google</Text>
      </TouchableOpacity>
    </View>
  );
}
