import './global.css';
import { SafeAreaView, ScrollView, Share, StatusBar, Text, TouchableOpacity, View } from 'react-native';

import { useGoogleAuth } from './src/auth/useGoogleAuth';
import { useRelatorio } from './src/hooks/useRelatorio';
import { LoadingScreen } from './src/components/LoadingScreen';
import { ErrorScreen } from './src/components/ErrorScreen';
import { LoginScreen } from './src/components/LoginScreen';
import { TotalCard } from './src/components/TotalCard';
import { PieChartCard } from './src/components/PieChartCard';
import { PersonCard } from './src/components/PersonCard';

export default function App() {
  const { status: authStatus, signIn, signOut, getAccessToken } = useGoogleAuth();
  const { state, refresh } = useRelatorio(getAccessToken, authStatus);
  const compartilharResumo = async () => {
    if (state.status !== 'success') return;
    const texto = state.data.relatorio_por_pessoa
      .map((p) => {
        const itens = p.itens.map((i) => `${i.descricao} - ${i.valor.toFixed(2)}`).join('\n');
        return `${p.dono}\n${itens}\nTotal = ${p.total_individual.toFixed(2)}`;
      })
      .join('\n\n');
    await Share.share({ message: texto });
  };

  if (authStatus === 'loading') {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  if (authStatus === 'unauthenticated') {
    return <LoginScreen onSignIn={signIn} />;
  }

  if (state.status === 'auth_expired') {
    return (
      <ErrorScreen
        message="Sessão expirada. Faça login novamente."
        onRetry={signOut}
      />
    );
  }

  if (state.status === 'loading' || state.status === 'idle') {
    return <LoadingScreen message="Sincronizando faturas..." />;
  }

  if (state.status === 'error') {
    return <ErrorScreen message={state.message} onRetry={refresh} />;
  }

  const { data } = state;

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800">
        <Text className="text-white text-xl font-black tracking-tight">
          Izi<Text className="text-purple-500">Contador</Text>
        </Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={compartilharResumo}
            className="px-4 py-2 rounded-full border bg-slate-900 border-slate-700"
          >
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Compartilhar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={signOut} className="px-3 py-2 rounded-full border border-slate-700">
            <Text className="text-slate-500 text-xs font-bold">Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <TotalCard
          total={data.total_fatura}
          numeroPessoas={data.relatorio_por_pessoa.length}
        />

        <PieChartCard pessoas={data.relatorio_por_pessoa} />

        {data.relatorio_por_pessoa.map((pessoa) => (
          <PersonCard key={pessoa.dono} pessoa={pessoa} />
        ))}

        <Text className="text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em] text-center py-4">
          IziContador • Automático • 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
