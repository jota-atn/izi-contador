import './global.css';
import { useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, Share, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';

import { Gasto } from './src/types';
import { migrateDbAsync } from './src/storage/db';
import { useGoogleAuth } from './src/auth/useGoogleAuth';
import { useRelatorio } from './src/hooks/useRelatorio';
import { useCategorias } from './src/hooks/useCategorias';
import { useHistorico } from './src/hooks/useHistorico';
import { useRegrasAlocacao } from './src/hooks/useRegrasAlocacao';
import { useEstadoFatura } from './src/hooks/useEstadoFatura';
import { useEdicoesFatura } from './src/hooks/useEdicoesFatura';
import { LoadingScreen } from './src/components/LoadingScreen';
import { ErrorScreen } from './src/components/ErrorScreen';
import { LoginScreen } from './src/components/LoginScreen';
import { TotalCard } from './src/components/TotalCard';
import { PieChartCard } from './src/components/PieChartCard';
import { PersonCard } from './src/components/PersonCard';
import { SemCategoriaCard } from './src/components/SemCategoriaCard';
import { AnotacoesInvalidasCard } from './src/components/AnotacoesInvalidasCard';
import { RegrasModal } from './src/components/RegrasModal';
import { CategoriasModal } from './src/components/CategoriasModal';
import { EditarItemModal } from './src/components/EditarItemModal';
import { HeaderMenu } from './src/components/HeaderMenu';
import { MonthSelector } from './src/components/MonthSelector';
import { SearchBar } from './src/components/SearchBar';
import { SEM_CATEGORIA } from './src/parser/parseFatura';
import { formatSincronizacao } from './src/utils/meses';
import { aplicarEdicoes } from './src/utils/aplicarEdicoes';
import { filtrarPessoas } from './src/utils/busca';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SQLiteProvider databaseName="izicont.db" onInit={migrateDbAsync}>
        <AppContent />
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { status: authStatus, userName, userEmail, signIn, signOut, getAccessToken } = useGoogleAuth();
  const { categorias, addKeyword, removeKeyword, addCategoria, removeCategoria, reset } = useCategorias(userEmail);
  const { regras, addRegra, removeRegra } = useRegrasAlocacao(userEmail);
  const { getEstado, toggleOculto, togglePago } = useEstadoFatura(userEmail);
  const { state, refresh } = useRelatorio(getAccessToken, authStatus, userName, categorias, regras);
  const { historico, meses, upsert } = useHistorico(userEmail);
  const [mesSelecionado, setMesSelecionado] = useState('');
  const { edicoes, salvar: salvarEdicao, limparMes } = useEdicoesFatura(userEmail, mesSelecionado);
  const [showCategorias, setShowCategorias] = useState(false);
  const [showRegras, setShowRegras] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [itemEditando, setItemEditando] = useState<{ item: Gasto; donoAtual: string } | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const donoAtualRef = useRef('');

  useEffect(() => {
    if (!userEmail) {
      setMesSelecionado('');
    }
  }, [userEmail]);

  useEffect(() => {
    if (state.status === 'success') {
      upsert(state.data.mes, { ...state.data, sincronizadoEm: new Date().toISOString() });
      limparMes(state.data.mes);
      setMesSelecionado(state.data.mes);
    }
  }, [state, upsert, limparMes]);

  const dadosBrutos =
    (mesSelecionado && historico[mesSelecionado]) ||
    (state.status === 'success' ? state.data : null);

  const dadosExibidos = dadosBrutos ? aplicarEdicoes(dadosBrutos, edicoes) : null;

  const pessoas = dadosExibidos?.relatorio_por_pessoa.filter(p => p.dono !== SEM_CATEGORIA) ?? [];
  const semCategoria = dadosExibidos?.relatorio_por_pessoa.find(p => p.dono === SEM_CATEGORIA);
  const idxMes = meses.indexOf(mesSelecionado);
  const mesAnterior = meses[idxMes + 1];
  const totalAnterior = mesAnterior ? historico[mesAnterior]?.total_fatura : undefined;

  const { pessoasFiltradas, totalItens, totalFiltrados } = filtrarPessoas(pessoas, termoBusca);
  const buscaAtiva = termoBusca.trim().length > 0;

  const pessoasOrdenadas = pessoasFiltradas
    .map(pf => pf.pessoa)
    .sort((a, b) => {
      if (buscaAtiva) return b.total_individual - a.total_individual;
      const aPago = getEstado(mesSelecionado, a.dono).pago ? 1 : 0;
      const bPago = getEstado(mesSelecionado, b.dono).pago ? 1 : 0;
      if (aPago !== bPago) return aPago - bPago;
      return b.total_individual - a.total_individual;
    });

  const pagamentoStatus = pessoas.reduce(
    (acc, p) => {
      if (getEstado(mesSelecionado, p.dono).pago) {
        acc.totalPago += p.total_individual;
        acc.numPago += 1;
      } else {
        acc.totalPendente += p.total_individual;
        acc.numPendente += 1;
      }
      return acc;
    },
    { totalPago: 0, numPago: 0, totalPendente: 0, numPendente: 0 },
  );

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  function handleEditarItem(item: Gasto, dono: string) {
    donoAtualRef.current = dono;
    setItemEditando({ item, donoAtual: dono });
  }

  async function handleSalvarEdicao(novoDono: string, novaDesc: string) {
    if (!itemEditando) return;
    const { item } = itemEditando;
    await salvarEdicao({
      mes: mesSelecionado,
      item_desc: item.descricao,
      item_data: item.data,
      item_valor: item.valor,
      novo_dono: novoDono !== donoAtualRef.current ? novoDono : null,
      nova_desc: novaDesc !== item.descricao ? novaDesc : null,
      deletado: false,
    });
  }

  async function handleDeletarItem() {
    if (!itemEditando) return;
    const { item } = itemEditando;
    await salvarEdicao({
      mes: mesSelecionado,
      item_desc: item.descricao,
      item_data: item.data,
      item_valor: item.valor,
      novo_dono: null,
      nova_desc: null,
      deletado: true,
    });
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
            <View>
              <Text className="text-white text-xl font-black tracking-tight">
                Izi<Text className="text-purple-500">Contador</Text>
              </Text>
              <Text className="text-slate-500 text-xs font-semibold tracking-wide">
                {userName.split(' ')[0]}
              </Text>
              {dadosExibidos.sincronizadoEm && (
                <Text className="text-slate-600 text-[10px] font-medium tracking-wide">
                  sinc. {formatSincronizacao(dadosExibidos.sincronizadoEm)}
                </Text>
              )}
            </View>
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

          <SearchBar
            value={termoBusca}
            onChange={setTermoBusca}
            totalItens={totalItens}
            totalFiltrados={totalFiltrados}
          />

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
              {...pagamentoStatus}
            />
            <PieChartCard pessoas={pessoas} />
            {semCategoria && <SemCategoriaCard grupo={semCategoria} />}
            {dadosExibidos.anotacoes_invalidas && dadosExibidos.anotacoes_invalidas.length > 0 && (
              <AnotacoesInvalidasCard itens={dadosExibidos.anotacoes_invalidas} />
            )}
            {pessoasOrdenadas.map((pessoa) => {
              const ep = getEstado(mesSelecionado, pessoa.dono);
              return (
                <Animated.View key={pessoa.dono} layout={LinearTransition.duration(300)}>
                  <PersonCard
                    pessoa={pessoa}
                    mes={dadosExibidos.mes}
                    oculto={buscaAtiva ? false : ep.oculto}
                    pago={ep.pago}
                    onToggleOculto={() => toggleOculto(mesSelecionado, pessoa.dono)}
                    onTogglePago={() => togglePago(mesSelecionado, pessoa.dono)}
                    onEditarItem={(item) => handleEditarItem(item, pessoa.dono)}
                  />
                </Animated.View>
              );
            })}
            <Text className="text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em] text-center py-4">
              IziContador • Automático • {new Date().getFullYear()}
            </Text>
          </ScrollView>
        </SafeAreaView>
      )}

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
      <EditarItemModal
        visible={itemEditando !== null}
        item={itemEditando?.item ?? null}
        donoAtual={itemEditando?.donoAtual ?? ''}
        pessoas={pessoas.map(p => p.dono)}
        onSalvar={handleSalvarEdicao}
        onDeletar={handleDeletarItem}
        onClose={() => setItemEditando(null)}
      />
    </View>
  );
}
