import './global.css';
import { useState } from 'react';
import { RefreshControl, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useGoogleAuth } from './src/auth/useGoogleAuth';
import { useRelatorio } from './src/hooks/useRelatorio';
import { useCategorias } from './src/hooks/useCategorias';
import { LoadingScreen } from './src/components/LoadingScreen';
import { ErrorScreen } from './src/components/ErrorScreen';
import { LoginScreen } from './src/components/LoginScreen';
import { TotalCard } from './src/components/TotalCard';
import { PieChartCard } from './src/components/PieChartCard';
import { PersonCard } from './src/components/PersonCard';
import { CategoriasModal } from './src/components/CategoriasModal';
import { HeaderMenu } from './src/components/HeaderMenu';

export default function App() {
  const { status: authStatus, userName, signIn, signOut, getAccessToken } = useGoogleAuth();
  const { categorias, addKeyword, removeKeyword, addCategoria, removeCategoria, reset } = useCategorias();
  const { state, refresh } = useRelatorio(getAccessToken, authStatus, userName, categorias);
  const [showCategorias, setShowCategorias] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

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

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: '#020617' }}>

      {authStatus === 'loading' && <LoadingScreen message="Verificando autenticação..." />}

      {authStatus === 'unauthenticated' && <LoginScreen onSignIn={signIn} />}

      {authStatus === 'authenticated' && state.status === 'auth_expired' && (
        <ErrorScreen message="Sessão expirada. Faça login novamente." onRetry={signOut} />
      )}

      {authStatus === 'authenticated' &&
        (state.status === 'loading' || state.status === 'idle') && (
          <LoadingScreen message="Sincronizando faturas..." />
        )}

      {authStatus === 'authenticated' && state.status === 'error' && (
        <ErrorScreen message={state.message} onRetry={refresh} />
      )}

      {authStatus === 'authenticated' && state.status === 'success' && (
        <SafeAreaView className="flex-1 bg-slate-950">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800">
            <Text className="text-white text-xl font-black tracking-tight">
              Izi<Text className="text-purple-500">Contador</Text>
            </Text>
            <HeaderMenu
              items={[
                { label: 'Compartilhar', onPress: compartilharResumo },
                { label: 'Categorias', onPress: () => setShowCategorias(true) },
                { label: 'Sair', onPress: signOut, danger: true },
              ]}
            />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, gap: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" colors={['#7c3aed']} />}
          >
            <TotalCard
              total={state.data.total_fatura}
              numeroPessoas={state.data.relatorio_por_pessoa.length}
            />
            <PieChartCard pessoas={state.data.relatorio_por_pessoa} />
            {state.data.relatorio_por_pessoa.map((pessoa) => (
              <PersonCard key={pessoa.dono} pessoa={pessoa} />
            ))}
            <Text className="text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em] text-center py-4">
              IziContador • Automático • {new Date().getFullYear()}
            </Text>
          </ScrollView>
        </SafeAreaView>
      )}
      </View>
      <CategoriasModal
        visible={showCategorias}
        onClose={() => setShowCategorias(false)}
        categorias={categorias}
        addKeyword={addKeyword}
        removeKeyword={removeKeyword}
        addCategoria={addCategoria}
        removeCategoria={removeCategoria}
        reset={reset}
      />
    </SafeAreaProvider>
  );
}
