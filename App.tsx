import './global.css';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useGoogleAuth } from './src/auth/useGoogleAuth';
import { useRelatorio } from './src/hooks/useRelatorio';
import { useCategorias } from './src/hooks/useCategorias';
import { useHistorico } from './src/hooks/useHistorico';
import { useRegrasAlocacao } from './src/hooks/useRegrasAlocacao';
import { useEstadoFatura } from './src/hooks/useEstadoFatura';
import { LoadingScreen } from './src/components/LoadingScreen';
import { ErrorScreen } from './src/components/ErrorScreen';
import { LoginScreen } from './src/components/LoginScreen';
import { TotalCard } from './src/components/TotalCard';
import { PieChartCard } from './src/components/PieChartCard';
import { PersonCard } from './src/components/PersonCard';
import { SemCategoriaCard } from './src/components/SemCategoriaCard';
import { RegrasModal } from './src/components/RegrasModal';
import { CategoriasModal } from './src/components/CategoriasModal';
import { HeaderMenu } from './src/components/HeaderMenu';
import { MonthSelector } from './src/components/MonthSelector';
import { SEM_CATEGORIA } from './src/parser/parseFatura';

export default function App() {
  const { status: authStatus, userName, userEmail, signIn, signOut, getAccessToken } = useGoogleAuth();
  const { categorias, addKeyword, removeKeyword, addCategoria, removeCategoria, reset } = useCategorias(userEmail);
  const { regras, addRegra, removeRegra } = useRegrasAlocacao(userEmail);
  const { getEstado, toggleOculto, togglePago } = useEstadoFatura(userEmail);
  const { state, refresh } = useRelatorio(getAccessToken, authStatus, userName, categorias, regras);
  const { historico, meses, upsert } = useHistorico(userEmail);
  const [mesSelecionado, setMesSelecionado] = useState('');
  const [showCategorias, setShowCategorias] = useState(false);
  const [showRegras, setShowRegras] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      setMesSelecionado('');
    }
  }, [userEmail]);

  useEffect(() => {
    if (state.status === 'success') {
      upsert(state.data.mes, state.data);
      setMesSelecionado(state.data.mes);
    }
  }, [state, upsert]);

  const dadosExibidos =
    (mesSelecionado && historico[mesSelecionado]) ||
    (state.status === 'success' ? state.data : null);

  const pessoas = dadosExibidos?.relatorio_por_pessoa.filter(p => p.dono !== SEM_CATEGORIA) ?? [];
  const semCategoria = dadosExibidos?.relatorio_por_pessoa.find(p => p.dono === SEM_CATEGORIA);
  const idxMes = meses.indexOf(mesSelecionado);
  const mesAnterior = meses[idxMes + 1];
  const totalAnterior = mesAnterior ? historico[mesAnterior]?.total_fatura : undefined;
  const isMesAtual = mesSelecionado === meses[0];
  const pessoasOrdenadas = [...pessoas].sort((a, b) => {
    const aPago = getEstado(mesSelecionado, a.dono).pago ? 1 : 0;
    const bPago = getEstado(mesSelecionado, b.dono).pago ? 1 : 0;
    return aPago - bPago;
  });

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  const compartilharResumo = async () => {
    if (!dadosExibidos) return;
    const texto = dadosExibidos.relatorio_por_pessoa
      .filter((p) => p.dono !== SEM_CATEGORIA)
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

        {authStatus === 'authenticated' && (state.status === 'loading' || state.status === 'idle') && (
          <LoadingScreen message="Sincronizando faturas..." />
        )}

        {authStatus === 'authenticated' && state.status === 'error' && (
          <ErrorScreen message={state.message} onRetry={refresh} />
        )}

        {authStatus === 'authenticated' && state.status === 'success' && dadosExibidos && (
          <SafeAreaView className="flex-1 bg-slate-950">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800">
              <Text className="text-white text-xl font-black tracking-tight">
                Izi<Text className="text-purple-500">Contador</Text>
              </Text>
              <HeaderMenu
                items={[
                  { label: 'Compartilhar', onPress: compartilharResumo },
                  { label: 'Categorias', onPress: () => setShowCategorias(true) },
                  { label: 'Regras', onPress: () => setShowRegras(true) },
                  { label: 'Sair', onPress: signOut, danger: true },
                ]}
              />
            </View>

            {meses.length > 1 && (
              <MonthSelector meses={meses} selected={mesSelecionado} onChange={setMesSelecionado} />
            )}

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ padding: 16, gap: 16 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" colors={['#7c3aed']} />}
            >
              <TotalCard
                total={dadosExibidos.total_fatura}
                numeroPessoas={pessoas.length}
                totalAnterior={totalAnterior}
                mesAnterior={mesAnterior}
              />
              <PieChartCard pessoas={pessoas} />
              {semCategoria && <SemCategoriaCard grupo={semCategoria} />}
              {pessoasOrdenadas.map((pessoa) => {
                const ep = getEstado(mesSelecionado, pessoa.dono);
                return (
                  <PersonCard
                    key={pessoa.dono}
                    pessoa={pessoa}
                    mes={dadosExibidos.mes}
                    isMesAtual={isMesAtual}
                    oculto={ep.oculto}
                    pago={ep.pago}
                    onToggleOculto={() => toggleOculto(mesSelecionado, pessoa.dono)}
                    onTogglePago={() => togglePago(mesSelecionado, pessoa.dono)}
                  />
                );
              })}
              <Text className="text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em] text-center py-4">
                IziContador • Automático • {new Date().getFullYear()}
              </Text>
            </ScrollView>
          </SafeAreaView>
        )}
      </View>

      <RegrasModal
        visible={showRegras}
        onClose={() => setShowRegras(false)}
        regras={regras}
        addRegra={addRegra}
        removeRegra={removeRegra}
      />
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
