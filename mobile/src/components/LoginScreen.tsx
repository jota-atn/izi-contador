import { Text, TouchableOpacity, View } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import type { AuthRequest } from 'expo-auth-session';

interface Props {
  onSignIn: () => void;
  request: AuthRequest | null;
}

export function LoginScreen({ onSignIn, request }: Props) {
  const redirectUri = makeRedirectUri();

  return (
    <View className="flex-1 bg-slate-950 px-8 justify-center items-center">
      {/* Logo */}
      <View className="w-20 h-20 bg-purple-600 rounded-3xl items-center justify-center mb-8 shadow-lg">
        <Text className="text-4xl">💳</Text>
      </View>

      <Text className="text-white text-4xl font-black tracking-tight mb-2">
        Izi<Text className="text-purple-500">Contador</Text>
      </Text>
      <Text className="text-slate-400 text-sm text-center mb-12 leading-6">
        Conecte sua conta Google para{'\n'}acessar o extrato da fatura Nubank
      </Text>

      {/* Botão login */}
      <TouchableOpacity
        onPress={onSignIn}
        disabled={!request}
        activeOpacity={0.85}
        className="w-full flex-row items-center justify-center gap-3 bg-white py-4 rounded-2xl"
        style={{ opacity: request ? 1 : 0.4 }}
      >
        <Text className="text-xl">G</Text>
        <Text className="text-slate-900 font-bold text-base">Entrar com Google</Text>
      </TouchableOpacity>

      {/* Redirect URI para debug — remove depois de configurar o Google Cloud Console */}
      {__DEV__ && (
        <View className="mt-10 bg-slate-900 border border-slate-700 rounded-xl p-4 w-full">
          <Text className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">
            Redirect URI (adicione no Google Cloud Console)
          </Text>
          <Text className="text-yellow-400 text-xs font-mono" selectable>
            {redirectUri}
          </Text>
        </View>
      )}
    </View>
  );
}
