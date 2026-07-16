import './global.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';

import { Gasto, RelatorioPessoa } from './src/types';
import { migrateDbAsync } from './src/storage/db';
import { useGoogleAuth } from './src/auth/useGoogleAuth';
import { useRelatorio } from './src/hooks/useRelatorio';
import { useCategorias } from './src/hooks/useCategorias';
import { useHistorico } from './src/hooks/useHistorico';
import { useRegrasAlocacao } from './src/hooks/useRegrasAlocacao';
import { useAssinaturas } from './src/hooks/useAssinaturas';
import { useEstadoFatura } from './src/hooks/useEstadoFatura';
import { useAvisosDispensados } from './src/hooks/useAvisosDispensados';
import { useEdicoesFatura } from './src/hooks/useEdicoesFatura';
import { usePixKey } from './src/hooks/usePixKey';
import { LoadingScreen } from './src/components/LoadingScreen';
import { ErrorScreen } from './src/components/ErrorScreen';
import { LoginScreen } from './src/components/LoginScreen';
import { TotalCard } from './src/components/TotalCard';
import { PieChartCard } from './src/components/PieChartCard';
import { PersonCard } from './src/components/PersonCard';
import { SemCategoriaCard } from './src/components/SemCategoriaCard';
import { AnotacoesInvalidasCard } from './src/components/AnotacoesInvalidasCard';
import { RegrasModal } from './src/components/RegrasModal';
import { AssinaturasModal } from './src/components/AssinaturasModal';
import { CategoriasModal } from './src/components/CategoriasModal';
import { EditarItemModal } from './src/components/EditarItemModal';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { TutorialModal } from './src/components/TutorialModal';
import { PixKeyModal } from './src/components/PixKeyModal';
import { QRCodeModal } from './src/components/QRCodeModal';
import { HeaderMenu } from './src/components/HeaderMenu';
import { MonthSelector } from './src/components/MonthSelector';
import { SearchBar } from './src/components/SearchBar';
import { IconShare } from './src/components/icons/IconShare';
import { IconSettings } from './src/components/icons/IconSettings';
import { IconSliders } from './src/components/icons/IconSliders';
import { IconUsers } from './src/components/icons/IconUsers';
import { IconBook } from './src/components/icons/IconBook';
import { IconCard } from './src/components/icons/IconCard';
import { IconLogOut } from './src/components/icons/IconLogOut';
import { IconBarChart } from './src/components/icons/IconBarChart';
import { IconSparkle } from './src/components/icons/IconSparkle';
import { IconBell } from './src/components/icons/IconBell';
import { ModalNotificacoes } from './src/components/ModalNotificacoes';
import { OnboardingModal } from './src/components/OnboardingModal';
import { useNotificacoes } from './src/hooks/useNotificacoes';
import { useOnboarding } from './src/hooks/useOnboarding';
import { EstatsScreen } from './src/screens/EstatsScreen';
import { IziBotScreen } from './src/screens/IziBotScreen';
import { SEM_CATEGORIA } from './src/parser/parseFatura';
import { formatSincronizacao, nomeMes } from './src/utils/meses';
import { aplicarEdicoes } from './src/utils/aplicarEdicoes';
import { filtrarPessoas } from './src/utils/busca';
import { haptic } from './src/utils/haptic';
import { hashFatura } from './src/utils/hashFatura';
import { exportarPdf } from './src/utils/exportarPdf';
import { exportarBackup, importarBackup } from './src/utils/backupIO';
import { IconDatabase } from './src/components/icons/IconDatabase';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SQLiteProvider databaseName="izicont.db" onInit={migrateDbAsync}>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const db = useSQLiteContext();
  const {
    status: authStatus,
    userName,
    userEmail,
    signIn,
    signOut,
    getAccessToken,
  } = useGoogleAuth();
  const { categorias, addKeyword, removeKeyword, addCategoria, removeCategoria, reset } =
    useCategorias(userEmail);
  const { regras, addRegra, removeRegra } = useRegrasAlocacao(userEmail);
  const { assinaturas, salvarAssinatura, removerAssinatura } = useAssinaturas(userEmail);
  const { getEstado, toggleOculto, togglePago, marcarTodosPago } = useEstadoFatura(userEmail);
  const { isDispensado, dispensar } = useAvisosDispensados(userEmail);
  const { state, refresh } = useRelatorio(
    getAccessToken,
    authStatus,
    userName,
    categorias,
    regras,
    assinaturas,
  );
  const { historico, meses, upsert } = useHistorico(userEmail);
  const [mesSelecionado, setMesSelecionado] = useState('');
  const { edicoes, salvar: salvarEdicao, limparMes } = useEdicoesFatura(userEmail, mesSelecionado);
  const { pixKey, salvarPixKey } = usePixKey(userEmail);
  const {
    diaFechamento,
    salvar: salvarNotif,
    cancelar: cancelarNotif,
  } = useNotificacoes(userEmail);
  const { mostrar: mostrarOnboarding, marcarVisto } = useOnboarding(userEmail);
  const [showCategorias, setShowCategorias] = useState(false);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [showRegras, setShowRegras] = useState(false);
  const [showAssinaturas, setShowAssinaturas] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPixKey, setShowPixKey] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [itemEditando, setItemEditando] = useState<{ item: Gasto; donoAtual: string } | null>(null);
  const [pessoaQR, setPessoaQR] = useState<{ pessoa: RelatorioPessoa; mes: string } | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [activeTab, setActiveTab] = useState<'fatura' | 'stats' | 'bot'>('fatura');
  const [tabBarHeight, setTabBarHeight] = useState(0);
  const donoAtualRef = useRef('');
  const historicoRef = useRef(historico);
  const promptadoRef = useRef<string | null>(null);

  useEffect(() => {
    historicoRef.current = historico;
  }, [historico]);

  useEffect(() => {
    if (!userEmail) {
      setMesSelecionado('');
    }
  }, [userEmail]);

  useEffect(() => {
    if (state.status !== 'success') return;
    const { mes } = state.data;
    // só define o mês inicial — não força o usuário a sair do mês que ele
    // navegou manualmente toda vez que a fatura ressincroniza (pull-to-refresh, reload)
    setMesSelecionado((atual) => atual || mes);

    const existing = historicoRef.current[mes];
    if (!existing || hashFatura(existing) === hashFatura(state.data)) {
      upsert(mes, { ...state.data, sincronizadoEm: new Date().toISOString() });
      // nada mudou (ou é a primeira sincronização) — não há motivo para apagar
      // as edições/alocações já feitas pelo usuário nesse mês
      return;
    }

    const alertKey = `${mes}:${hashFatura(state.data)}`;
    if (promptadoRef.current === alertKey) return;
    promptadoRef.current = alertKey;

    Alert.alert(
      'Fatura atualizada',
      `A fatura de ${nomeMes(mes)} mudou desde a última sincronização. Deseja atualizar?`,
      [
        { text: 'Agora não', style: 'cancel' },
        {
          text: 'Atualizar',
          onPress: () => {
            upsert(mes, { ...state.data, sincronizadoEm: new Date().toISOString() });
            limparMes(mes);
          },
        },
      ],
    );
  }, [state, upsert, limparMes]);

  const dadosBrutos = useMemo(
    () =>
      (mesSelecionado && historico[mesSelecionado]) ||
      (state.status === 'success' ? state.data : null),
    [mesSelecionado, historico, state],
  );

  const dadosExibidos = useMemo(
    () => (dadosBrutos ? aplicarEdicoes(dadosBrutos, edicoes) : null),
    [dadosBrutos, edicoes],
  );

  const pessoas = useMemo(
    () => dadosExibidos?.relatorio_por_pessoa.filter((p) => p.dono !== SEM_CATEGORIA) ?? [],
    [dadosExibidos],
  );

  const semCategoria = useMemo(
    () => dadosExibidos?.relatorio_por_pessoa.find((p) => p.dono === SEM_CATEGORIA),
    [dadosExibidos],
  );

  // só mostra avisos de anotação inválida no mês mais recente — meses antigos ficam
  // arquivados sem o aviso, e itens já dispensados não voltam a aparecer nesse mês
  // a não ser que o próprio item mude (soma/valor diferentes na resincronização)
  const avisosAtivos = useMemo(() => {
    if (!dadosExibidos || mesSelecionado !== meses[0]) return [];
    return (dadosExibidos.anotacoes_invalidas ?? []).filter(
      (item) => !isDispensado(mesSelecionado, item),
    );
  }, [dadosExibidos, mesSelecionado, meses, isDispensado]);

  const idxMes = meses.indexOf(mesSelecionado);
  const mesAnterior = meses[idxMes + 1];
  const totalAnterior = mesAnterior ? historico[mesAnterior]?.total_fatura : undefined;

  const buscaAtiva = termoBusca.trim().length > 0;

  const { pessoasFiltradas, totalItens, totalFiltrados } = useMemo(
    () => filtrarPessoas(pessoas, termoBusca),
    [pessoas, termoBusca],
  );

  const pessoasOrdenadas = useMemo(
    () =>
      pessoasFiltradas
        .map((pf) => pf.pessoa)
        .sort((a, b) => {
          if (buscaAtiva) return b.total_individual - a.total_individual;
          const aPago = getEstado(mesSelecionado, a.dono).pago ? 1 : 0;
          const bPago = getEstado(mesSelecionado, b.dono).pago ? 1 : 0;
          if (aPago !== bPago) return aPago - bPago;
          return b.total_individual - a.total_individual;
        }),
    [pessoasFiltradas, buscaAtiva, getEstado, mesSelecionado],
  );

  const pagamentoStatus = useMemo(
    () =>
      pessoas.reduce(
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
      ),
    [pessoas, getEstado, mesSelecionado],
  );

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  const handleEditarItem = useCallback((item: Gasto, dono: string) => {
    donoAtualRef.current = dono;
    setItemEditando({ item, donoAtual: dono });
  }, []);

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

  function handleSignOut() {
    Alert.alert('Sair', 'Deseja mesmo sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  function handlePagarFatura() {
    const donos = pessoas.map((p) => p.dono);
    Alert.alert(
      'Pagar fatura',
      `Marcar ${donos.length} ${donos.length === 1 ? 'pessoa' : 'pessoas'} como pagas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar tudo',
          onPress: () => {
            marcarTodosPago(mesSelecionado, donos);
            haptic.success();
          },
        },
      ],
    );
  }

  const compartilharResumo = async () => {
    if (!dadosExibidos) return;
    const linhas = dadosExibidos.relatorio_por_pessoa
      .filter((p) => p.dono !== SEM_CATEGORIA)
      .map((p) => {
        const itens = p.itens.map((i) => `${i.descricao} - ${i.valor.toFixed(2)}`).join('\n');
        return `${p.dono}\n${itens}\nTotal = ${p.total_individual.toFixed(2)}`;
      });
    if (pixKey) linhas.push(`Pix: ${pixKey}`);
    await Share.share({ message: linhas.join('\n\n') });
  };

  const exportarRelatorioPdf = async () => {
    if (!dadosExibidos) return;
    const estadoPorPessoa: Record<string, { pago: boolean }> = {};
    dadosExibidos.relatorio_por_pessoa.forEach((p) => {
      const est = getEstado(mesSelecionado, p.dono);
      estadoPorPessoa[p.dono] = { pago: est.pago };
    });
    await exportarPdf(dadosExibidos, estadoPorPessoa);
  };

  const handleExportarBackup = async () => {
    try {
      await exportarBackup(db, userEmail);
    } catch (e) {
      console.error('[App] exportarBackup falhou:', e);
      Alert.alert('Erro', 'Não foi possível gerar o backup.');
    }
  };

  const handleImportarBackup = () => {
    Alert.alert(
      'Importar backup',
      'Isso substitui todos os dados atuais deste usuário (faturas, edições, categorias, regras, assinaturas e chave Pix) pelos dados do arquivo escolhido. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          style: 'destructive',
          onPress: async () => {
            try {
              const backup = await importarBackup(db, userEmail);
              if (!backup) return; // usuário cancelou a seleção do arquivo
              try {
                const Updates = await import('expo-updates');
                if (Updates.isEnabled) {
                  await Updates.reloadAsync();
                  return;
                }
              } catch {}
              Alert.alert(
                'Backup importado',
                'Feche e abra o app novamente para ver os dados restaurados.',
              );
            } catch (e) {
              console.error('[App] importarBackup falhou:', e);
              Alert.alert(
                'Erro',
                'Não foi possível importar o backup. Verifique se o arquivo é válido.',
              );
            }
          },
        },
      ],
    );
  };

  return (
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
                {
                  label: 'Compartilhar',
                  onPress: compartilharResumo,
                  icon: <IconShare size={15} color="#a78bfa" />,
                  section: 'Ações',
                },
                {
                  label: 'Categorias',
                  onPress: () => setShowCategorias(true),
                  icon: <IconSettings size={15} color="#a78bfa" />,
                  section: 'Configuração',
                },
                {
                  label: 'Regras',
                  onPress: () => setShowRegras(true),
                  icon: <IconSliders size={15} color="#a78bfa" />,
                  section: 'Configuração',
                },
                {
                  label: 'Assinaturas',
                  onPress: () => setShowAssinaturas(true),
                  icon: <IconUsers size={15} color="#a78bfa" />,
                  section: 'Configuração',
                },
                {
                  label: 'Chave Pix',
                  onPress: () => setShowPixKey(true),
                  icon: <IconCard size={15} color="#a78bfa" />,
                  section: 'Configuração',
                },
                {
                  label: diaFechamento ? `Notificações (dia ${diaFechamento})` : 'Notificações',
                  onPress: () => setShowNotificacoes(true),
                  icon: <IconBell size={15} color="#a78bfa" />,
                  section: 'Configuração',
                },
                {
                  label: 'Exportar backup',
                  onPress: handleExportarBackup,
                  icon: <IconDatabase size={15} color="#a78bfa" />,
                  section: 'Dados',
                },
                {
                  label: 'Importar backup',
                  onPress: handleImportarBackup,
                  icon: <IconDatabase size={15} color="#a78bfa" />,
                  section: 'Dados',
                },
                {
                  label: 'Como anotar',
                  onPress: () => setShowTutorial(true),
                  icon: <IconBook size={15} color="#a78bfa" />,
                  section: 'Ajuda',
                },
                {
                  label: 'Sair',
                  onPress: handleSignOut,
                  danger: true,
                  icon: <IconLogOut size={15} color="#f87171" />,
                  section: 'Conta',
                },
              ]}
            />
          </View>

          {activeTab === 'fatura' && (
            <>
              {meses.length > 1 && (
                <MonthSelector
                  meses={meses}
                  selected={mesSelecionado}
                  onChange={setMesSelecionado}
                />
              )}

              <SearchBar
                value={termoBusca}
                onChange={setTermoBusca}
                totalItens={totalItens}
                totalFiltrados={totalFiltrados}
              />

              <ScrollView
                className="flex-1"
                contentContainerStyle={{
                  paddingTop: 4,
                  paddingBottom: 16,
                  gap: 16,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#7c3aed"
                    colors={['#7c3aed']}
                  />
                }
              >
                <View style={{ marginHorizontal: 16 }}>
                  <TotalCard
                    total={dadosExibidos.total_fatura}
                    numeroPessoas={pessoas.length}
                    totalAnterior={totalAnterior}
                    mesAnterior={mesAnterior}
                    {...pagamentoStatus}
                    onPagarFatura={handlePagarFatura}
                    onExportarPdf={exportarRelatorioPdf}
                  />
                </View>
                <View style={{ marginHorizontal: 16 }}>
                  <PieChartCard pessoas={pessoas} />
                </View>
                {semCategoria && (
                  <View style={{ marginHorizontal: 16 }}>
                    <SemCategoriaCard grupo={semCategoria} onEditarItem={handleEditarItem} />
                  </View>
                )}
                {avisosAtivos.length > 0 && (
                  <View style={{ marginHorizontal: 16 }}>
                    <AnotacoesInvalidasCard
                      itens={avisosAtivos}
                      onDispensar={(item) => dispensar(mesSelecionado, item)}
                    />
                  </View>
                )}
                {pessoasOrdenadas.map((pessoa) => {
                  const ep = getEstado(mesSelecionado, pessoa.dono);
                  return (
                    <Animated.View key={pessoa.dono} layout={LinearTransition.duration(200)}>
                      <PersonCard
                        pessoa={pessoa}
                        mes={dadosExibidos.mes}
                        oculto={buscaAtiva ? false : ep.oculto}
                        pago={ep.pago}
                        pixKey={pixKey}
                        onToggleOculto={toggleOculto}
                        onTogglePago={togglePago}
                        onEditarItem={handleEditarItem}
                        onCompartilharQR={(p, m) => setPessoaQR({ pessoa: p, mes: m })}
                      />
                    </Animated.View>
                  );
                })}
                <Text className="text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em] text-center py-4">
                  IziContador • Automático • {new Date().getFullYear()}
                </Text>
              </ScrollView>
            </>
          )}

          {activeTab === 'stats' && (
            <EstatsScreen
              historico={historico}
              meses={meses}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )}

          <View style={{ flex: 1, display: activeTab === 'bot' ? 'flex' : 'none' }}>
            <IziBotScreen
              historico={historico}
              meses={meses}
              userName={userName}
              userEmail={userEmail}
              kbOffset={tabBarHeight}
            />
          </View>

          <View style={tabS.bar} onLayout={(e) => setTabBarHeight(e.nativeEvent.layout.height)}>
            {(
              [
                { key: 'fatura', label: 'Fatura', Icon: IconCard },
                { key: 'stats', label: 'IziStats', Icon: IconBarChart },
                { key: 'bot', label: 'IziBot', Icon: IconSparkle },
              ] as const
            ).map(({ key, label, Icon }) => {
              const active = activeTab === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={tabS.item}
                  onPress={() => setActiveTab(key)}
                  activeOpacity={0.7}
                >
                  <Icon size={20} color={active ? '#a78bfa' : '#475569'} />
                  <Text style={[tabS.label, active && tabS.labelActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      )}

      <TutorialModal visible={showTutorial} onClose={() => setShowTutorial(false)} />
      <PixKeyModal
        visible={showPixKey}
        pixKey={pixKey}
        onSave={salvarPixKey}
        onClose={() => setShowPixKey(false)}
      />
      <QRCodeModal
        visible={pessoaQR !== null}
        pessoa={pessoaQR?.pessoa ?? null}
        mes={pessoaQR?.mes ?? ''}
        pixKey={pixKey}
        userName={userName}
        onClose={() => setPessoaQR(null)}
      />
      <RegrasModal
        visible={showRegras}
        onClose={() => setShowRegras(false)}
        regras={regras}
        addRegra={addRegra}
        removeRegra={removeRegra}
      />
      <AssinaturasModal
        visible={showAssinaturas}
        onClose={() => setShowAssinaturas(false)}
        assinaturas={assinaturas}
        pessoas={pessoas.map((p) => p.dono)}
        salvarAssinatura={salvarAssinatura}
        removerAssinatura={removerAssinatura}
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
        pessoas={pessoas.map((p) => p.dono)}
        onSalvar={handleSalvarEdicao}
        onDeletar={handleDeletarItem}
        onClose={() => setItemEditando(null)}
      />
      <ModalNotificacoes
        visible={showNotificacoes}
        diaAtual={diaFechamento}
        onSalvar={salvarNotif}
        onCancelar={cancelarNotif}
        onFechar={() => setShowNotificacoes(false)}
      />
      <OnboardingModal visible={mostrarOnboarding} onClose={marcarVisto} />
    </View>
  );
}

const tabS = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0a0f1a',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 3,
  },
  label: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelActive: { color: '#a78bfa' },
});
