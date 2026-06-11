import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onSignIn: () => void;
}

export function LoginScreen({ onSignIn }: Props) {
  return (
    <View className="flex-1 bg-slate-950 px-8 justify-center items-center">
      <View className="w-20 h-20 bg-purple-600 rounded-3xl items-center justify-center mb-8 shadow-lg">
        <Text className="text-4xl">💳</Text>
      </View>

      <Text className="text-white text-4xl font-black tracking-tight mb-2">
        Izi<Text className="text-purple-500">Contador</Text>
      </Text>
      <Text className="text-slate-400 text-sm text-center mb-12 leading-6">
        Conecte sua conta Google para{'\n'}acessar o extrato da fatura Nubank
      </Text>

      <TouchableOpacity
        onPress={onSignIn}
        activeOpacity={0.85}
        className="w-full flex-row items-center justify-center gap-3 bg-white py-4 rounded-2xl"
      >
        <Text className="text-xl">G</Text>
        <Text className="text-slate-900 font-bold text-base">Entrar com Google</Text>
      </TouchableOpacity>
    </View>
  );
}
