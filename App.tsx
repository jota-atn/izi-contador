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
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';

import { Gasto, RelatorioPessoa } from './src/types';
import { DivisaoShare } from './src/storage/divisoesFatura';
import { migrateDbAsync } from './src/storage/db';
import { useGoogleAuth } from './src/auth/useGoogleAuth';
import { useRelatorio } from './src/hooks/useRelatorio';
import { useCategorias } from './src/hooks/useCategorias';
import { useHistorico } from './src/hooks/useHistorico';
import { useRegrasAlocacao } from './src/hooks/useRegrasAlocacao';
import { useAssinaturas } from './src/hooks/useAssinaturas';
import { useOrcamentos } from './src/hooks/useOrcamentos';
import { useOrcamentoAlertas } from './src/hooks/useOrcamentoAlertas';
import { useEstadoFatura } from './src/hooks/useEstadoFatura';
import { useAvisosDispensados } from './src/hooks/useAvisosDispensados';
import { useEdicoesFatura } from './src/hooks/useEdicoesFatura';
import { useEdicoesOrfas } from './src/hooks/useEdicoesOrfas';
import { useDivisoesFatura } from './src/hooks/useDivisoesFatura';
import { useDivisoesOrfas } from './src/hooks/useDivisoesOrfas';
import { useEdicoesTodosMeses } from './src/hooks/useEdicoesTodosMeses';
import { useDivisoesTodosMeses } from './src/hooks/useDivisoesTodosMeses';
import { usePixKey } from './src/hooks/usePixKey';
import { LoadingScreen } from './src/components/LoadingScreen';
import { ErrorScreen } from './src/components/ErrorScreen';
import { LoginScreen } from './src/components/LoginScreen';
import { TotalCard } from './src/components/TotalCard';
import { PieChartCard } from './src/components/PieChartCard';
import { PersonCard } from './src/components/PersonCard';
import { SemCategoriaCard } from './src/components/SemCategoriaCard';
import { AnotacoesInvalidasCard } from './src/components/AnotacoesInvalidasCard';
import { EdicoesOrfasCard, OrfaRow } from './src/components/EdicoesOrfasCard';
import { EdicoesModal } from './src/components/EdicoesModal';
import { DividirItemModal } from './src/components/DividirItemModal';
import { AutomacaoModal } from './src/components/AutomacaoModal';
import { BackupModal } from './src/components/BackupModal';
import { EditarItemModal } from './src/components/EditarItemModal';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { TutorialModal } from './src/components/TutorialModal';
import { PixKeyModal } from './src/components/PixKeyModal';
import { QRCodeModal } from './src/components/QRCodeModal';
import { HeaderMenu } from './src/components/HeaderMenu';
import { MonthSelector } from './src/components/MonthSelector';
import { SearchBar } from './src/components/SearchBar';
import { IconShare } from './src/components/icons/IconShare';
import { IconSliders } from './src/components/icons/IconSliders';
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
import { aplicarDivisoes } from './src/utils/aplicarDivisoes';
import { aplicarHistoricoCompleto } from './src/utils/aplicarHistoricoCompleto';
import { descreverEdicao, descreverDivisao } from './src/utils/descreverEdicao';
import { filtrarPessoas } from './src/utils/busca';
import { haptic } from './src/utils/haptic';
import { hashFatura } from './src/utils/hashFatura';
import { exportarPdf } from './src/utils/exportarPdf';
import { exportarBackup, importarBackup } from './src/utils/backupIO';
import { exportarCsv } from './src/utils/exportarCsv';
import { reconciliarEdicoesResync, reconciliarDivisoesResync } from './src/utils/reconciliarFatura';
import { verificarOrcamentos } from './src/utils/verificarOrcamentos';
import { notificarOrcamentosEstourados } from './src/utils/notificarOrcamentos';
import { IconDatabase } from './src/components/icons/IconDatabase';
import { IconEdit } from './src/components/icons/IconEdit';
import { IconSun } from './src/components/icons/IconSun';
import { IconMoon } from './src/components/icons/IconMoon';
import { ThemeProvider, useTheme } from './src/hooks/useTheme';
import { ThemeColors } from './src/theme/tokens';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SQLiteProvider databaseName="izicont.db" onInit={migrateDbAsync}>
            <ErrorBoundary>
              <AppShell />
            </ErrorBoundary>
          </SQLiteProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  const { mode } = useTheme();
  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <AppContent />
    </>
  );
}

function AppContent() {
  const { colors, mode, toggle: toggleTema } = useTheme();
  const insets = useSafeAreaInsets();
  const tabS = useMemo(() => createTabStyles(colors), [colors]);
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
  const { orcamentos, setLimite } = useOrcamentos(userEmail);
  const { jaAlertado: jaAlertadoOrcamento, marcarAlertado: marcarAlertadoOrcamento } =
    useOrcamentoAlertas(userEmail);
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
  const {
    edicoes,
    salvar: salvarEdicao,
    remover: removerEdicao,
    reload: reloadEdicoes,
  } = useEdicoesFatura(userEmail, mesSelecionado);
  const {
    orfas,
    remover: dispensarOrfa,
    reload: reloadOrfas,
  } = useEdicoesOrfas(userEmail, mesSelecionado);
  const {
    divisoes,
    salvar: salvarDivisaoItem,
    remover: removerDivisaoItem,
    reload: reloadDivisoes,
  } = useDivisoesFatura(userEmail, mesSelecionado);
  const {
    orfas: divisoesOrfas,
    remover: dispensarDivisaoOrfa,
    reload: reloadDivisoesOrfas,
  } = useDivisoesOrfas(userEmail, mesSelecionado);
  const { edicoesPorMes, reload: reloadEdicoesTodosMeses } = useEdicoesTodosMeses(userEmail);
  const { divisoesPorMes, reload: reloadDivisoesTodosMeses } = useDivisoesTodosMeses(userEmail);
  const { pixKey, salvarPixKey } = usePixKey(userEmail);
  const {
    diaFechamento,
    salvar: salvarNotif,
    cancelar: cancelarNotif,
  } = useNotificacoes(userEmail);
  const {
    mostrar: mostrarOnboarding,
    marcarVisto,
    rever: reverOnboarding,
  } = useOnboarding(userEmail);
  const [showAutomacao, setShowAutomacao] = useState(false);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPixKey, setShowPixKey] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showEdicoes, setShowEdicoes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [itemEditando, setItemEditando] = useState<{ item: Gasto; donoAtual: string } | null>(null);
  const [itemDividindo, setItemDividindo] = useState<{ item: Gasto; donoAtual: string } | null>(
    null,
  );
  const [pessoaQR, setPessoaQR] = useState<{ pessoa: RelatorioPessoa; mes: string } | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [activeTab, setActiveTab] = useState<'fatura' | 'stats' | 'bot'>('fatura');
  const [tabBarHeight, setTabBarHeight] = useState(0);
  const donoAtualRef = useRef('');
  const historicoRef = useRef(historico);
  const promptadoRef = useRef<string | null>(null);
  const mesSelecionadoRef = useRef(mesSelecionado);

  useEffect(() => {
    historicoRef.current = historico;
  }, [historico]);

  useEffect(() => {
    mesSelecionadoRef.current = mesSelecionado;
  }, [mesSelecionado]);

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
      notificarOrcamentosEstourados(
        verificarOrcamentos(state.data, categorias, orcamentos),
        mes,
        jaAlertadoOrcamento,
        marcarAlertadoOrcamento,
      );
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
          onPress: async () => {
            upsert(mes, { ...state.data, sincronizadoEm: new Date().toISOString() });
            notificarOrcamentosEstourados(
              verificarOrcamentos(state.data, categorias, orcamentos),
              mes,
              jaAlertadoOrcamento,
              marcarAlertadoOrcamento,
            );
            // preserva as edições/divisões cuja chave (desc|data|valor) ainda existe nos itens
            // novos; as que não existem mais viram avisos de divergência em vez de sumir sem aviso
            const [{ houveOrfas: houveEdicoesOrfas }, { houveOrfas: houveDivisoesOrfas }] =
              await Promise.all([
                reconciliarEdicoesResync(db, userEmail, mes, state.data),
                reconciliarDivisoesResync(db, userEmail, mes, state.data),
              ]);
            if (mes === mesSelecionadoRef.current) {
              await Promise.all([reloadEdicoes(), reloadDivisoes()]);
              if (houveEdicoesOrfas) await reloadOrfas();
              if (houveDivisoesOrfas) await reloadDivisoesOrfas();
            }
            // "todos os meses" alimenta IziStats/IziBot, que agregam o histórico inteiro —
            // recarrega sempre, independente de qual mês ressincronizou
            await Promise.all([reloadEdicoesTodosMeses(), reloadDivisoesTodosMeses()]);
          },
        },
      ],
    );
  }, [
    state,
    upsert,
    db,
    userEmail,
    reloadEdicoes,
    reloadOrfas,
    reloadDivisoes,
    reloadEdicoesTodosMeses,
    reloadDivisoesTodosMeses,
    reloadDivisoesOrfas,
    categorias,
    orcamentos,
    jaAlertadoOrcamento,
    marcarAlertadoOrcamento,
  ]);

  const dadosBrutos = useMemo(
    () =>
      (mesSelecionado && historico[mesSelecionado]) ||
      (state.status === 'success' ? state.data : null),
    [mesSelecionado, historico, state],
  );

  const dadosComDivisoes = useMemo(
    () => (dadosBrutos ? aplicarDivisoes(dadosBrutos, divisoes) : null),
    [dadosBrutos, divisoes],
  );

  const dadosExibidos = useMemo(
    () => (dadosComDivisoes ? aplicarEdicoes(dadosComDivisoes, edicoes) : null),
    [dadosComDivisoes, edicoes],
  );

  // histórico com edições/divisões aplicadas em todos os meses — só pra telas que agregam
  // vários meses de uma vez (IziStats, IziBot); a aba Fatura usa dadosExibidos acima
  const historicoCompleto = useMemo(
    () => aplicarHistoricoCompleto(historico, edicoesPorMes, divisoesPorMes),
    [historico, edicoesPorMes, divisoesPorMes],
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

  const itensOrfaos = useMemo<OrfaRow[]>(() => {
    const deEdicoes: OrfaRow[] = orfas.map((ed) => ({
      key: `ed-${ed.item_desc}-${ed.item_data}-${ed.item_valor}`,
      titulo: ed.item_desc,
      descricaoPerda: descreverEdicao(ed),
      onDispensar: () => dispensarOrfa(ed),
    }));
    const deDivisoes: OrfaRow[] = divisoesOrfas.map((d) => ({
      key: `div-${d.item_desc}-${d.item_data}-${d.item_valor}`,
      titulo: d.item_desc,
      descricaoPerda: descreverDivisao(d),
      onDispensar: () =>
        dispensarDivisaoOrfa({
          mes: mesSelecionado,
          item_desc: d.item_desc,
          item_data: d.item_data,
          item_valor: d.item_valor,
        }),
    }));
    return [...deEdicoes, ...deDivisoes];
  }, [orfas, divisoesOrfas, mesSelecionado, dispensarOrfa, dispensarDivisaoOrfa]);

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
    const novo_dono = novoDono !== donoAtualRef.current ? novoDono : null;
    const nova_desc = novaDesc !== item.descricao ? novaDesc : null;
    if (novo_dono === null && nova_desc === null) return; // nada mudou, não grava edição vazia
    await salvarEdicao({
      mes: mesSelecionado,
      item_desc: item.descricao,
      item_data: item.data,
      item_valor: item.valor,
      novo_dono,
      nova_desc,
      deletado: false,
    });
    await reloadEdicoesTodosMeses();
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
    await reloadEdicoesTodosMeses();
  }

  const divisaoExistente = useMemo(() => {
    if (!itemDividindo) return null;
    const chave = itemDividindo.item.origemDivisao ?? {
      item_desc: itemDividindo.item.descricao,
      item_data: itemDividindo.item.data,
      item_valor: itemDividindo.item.valor,
    };
    return (
      divisoes.find(
        (d) =>
          d.item_desc === chave.item_desc &&
          d.item_data === chave.item_data &&
          d.item_valor === chave.item_valor,
      ) ?? null
    );
  }, [divisoes, itemDividindo]);

  async function handleSalvarDivisao(shares: DivisaoShare[]) {
    if (!itemDividindo) return;
    const { item } = itemDividindo;
    const chave = item.origemDivisao ?? {
      item_desc: item.descricao,
      item_data: item.data,
      item_valor: item.valor,
    };
    await salvarDivisaoItem(chave, shares);
    await reloadDivisoesTodosMeses();
  }

  async function handleRemoverDivisao() {
    if (!itemDividindo) return;
    const { item } = itemDividindo;
    const chave = item.origemDivisao ?? {
      item_desc: item.descricao,
      item_data: item.data,
      item_valor: item.valor,
    };
    await removerDivisaoItem({ mes: mesSelecionado, ...chave });
    await reloadDivisoesTodosMeses();
  }

  function handleSignOut() {
    Alert.alert('Sair', 'Deseja mesmo sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  function handleToggleTema() {
    const proximo = mode === 'dark' ? 'claro' : 'escuro';
    Alert.alert(`Mudar para tema ${proximo}?`, undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Mudar', onPress: toggleTema },
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

  const compartilharPendentes = async () => {
    const pendentes = pessoas.filter((p) => !getEstado(mesSelecionado, p.dono).pago);
    if (pendentes.length === 0) return;
    const linhas = pendentes.map((p) => {
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

  const handleExportarCsv = async () => {
    try {
      await exportarCsv(historicoCompleto, meses, categorias, getEstado);
    } catch (e) {
      console.error('[App] exportarCsv falhou:', e);
      Alert.alert('Erro', 'Não foi possível gerar a planilha.');
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
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
        <SafeAreaView
          style={{ flex: 1, backgroundColor: colors.bg }}
          edges={['top', 'left', 'right']}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 20,
                  fontWeight: '900',
                  letterSpacing: -0.5,
                }}
              >
                Izi<Text style={{ color: colors.accent }}>Contador</Text>
              </Text>
              <Text
                style={{
                  color: colors.textFaint,
                  fontSize: 12,
                  fontWeight: '600',
                  letterSpacing: 0.3,
                }}
              >
                {userName.split(' ')[0]}
              </Text>
              {dadosExibidos.sincronizadoEm && (
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 10,
                    fontWeight: '500',
                    letterSpacing: 0.3,
                  }}
                >
                  sinc. {formatSincronizacao(dadosExibidos.sincronizadoEm)}
                </Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <TouchableOpacity
                onPress={handleToggleTema}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {mode === 'dark' ? (
                  <IconSun size={18} color={colors.accentLight} />
                ) : (
                  <IconMoon size={18} color={colors.accentLight} />
                )}
              </TouchableOpacity>
              <HeaderMenu
                items={[
                  {
                    label: 'Compartilhar',
                    onPress: compartilharResumo,
                    icon: <IconShare size={15} color={colors.accentLight} />,
                    section: 'Ações',
                  },
                  {
                    label: 'Edições deste mês',
                    onPress: () => setShowEdicoes(true),
                    icon: <IconEdit size={15} color={colors.accentLight} />,
                    section: 'Ações',
                  },
                  {
                    label: 'Automação',
                    onPress: () => setShowAutomacao(true),
                    icon: <IconSliders size={15} color={colors.accentLight} />,
                    section: 'Configuração',
                  },
                  {
                    label: 'Chave Pix',
                    onPress: () => setShowPixKey(true),
                    icon: <IconCard size={15} color={colors.accentLight} />,
                    section: 'Configuração',
                  },
                  {
                    label: diaFechamento ? `Notificações (dia ${diaFechamento})` : 'Notificações',
                    onPress: () => setShowNotificacoes(true),
                    icon: <IconBell size={15} color={colors.accentLight} />,
                    section: 'Configuração',
                  },
                  {
                    label: 'Backup',
                    onPress: () => setShowBackup(true),
                    icon: <IconDatabase size={15} color={colors.accentLight} />,
                    section: 'Dados',
                  },
                  {
                    label: 'Como anotar',
                    onPress: () => setShowTutorial(true),
                    icon: <IconBook size={15} color={colors.accentLight} />,
                    section: 'Ajuda',
                  },
                  {
                    label: 'Sair',
                    onPress: handleSignOut,
                    danger: true,
                    icon: <IconLogOut size={15} color={colors.danger} />,
                    section: 'Conta',
                  },
                ]}
              />
            </View>
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
                    onCobrarPendentes={compartilharPendentes}
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
                {itensOrfaos.length > 0 && (
                  <View style={{ marginHorizontal: 16 }}>
                    <EdicoesOrfasCard itens={itensOrfaos} />
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
                <Text
                  style={{
                    color: colors.textFaint,
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 3,
                    textAlign: 'center',
                    paddingVertical: 16,
                  }}
                >
                  IziContador • Automático • {new Date().getFullYear()}
                </Text>
              </ScrollView>
            </>
          )}

          {activeTab === 'stats' && (
            <EstatsScreen
              historico={historicoCompleto}
              meses={meses}
              refreshing={refreshing}
              onRefresh={onRefresh}
              categorias={categorias}
              orcamentos={orcamentos}
            />
          )}

          <View style={{ flex: 1, display: activeTab === 'bot' ? 'flex' : 'none' }}>
            <IziBotScreen
              historico={historicoCompleto}
              meses={meses}
              userName={userName}
              userEmail={userEmail}
              tabBarHeight={tabBarHeight}
            />
          </View>

          <View
            style={[tabS.bar, { paddingBottom: insets.bottom }]}
            onLayout={(e) => setTabBarHeight(e.nativeEvent.layout.height)}
          >
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
                  <Icon size={20} color={active ? colors.accentLight : colors.textFaint} />
                  <Text style={[tabS.label, active && tabS.labelActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      )}

      <TutorialModal
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
        onRevisarOnboarding={reverOnboarding}
      />
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
      <AutomacaoModal
        visible={showAutomacao}
        onClose={() => setShowAutomacao(false)}
        categorias={categorias}
        addKeyword={addKeyword}
        removeKeyword={removeKeyword}
        addCategoria={addCategoria}
        removeCategoria={removeCategoria}
        resetCategorias={reset}
        regras={regras}
        addRegra={addRegra}
        removeRegra={removeRegra}
        assinaturas={assinaturas}
        pessoas={pessoas.map((p) => p.dono)}
        salvarAssinatura={salvarAssinatura}
        removerAssinatura={removerAssinatura}
        orcamentos={orcamentos}
        setLimite={setLimite}
      />
      <BackupModal
        visible={showBackup}
        onClose={() => setShowBackup(false)}
        onExportar={handleExportarBackup}
        onImportar={handleImportarBackup}
        onExportarCsv={handleExportarCsv}
      />
      <EdicoesModal
        visible={showEdicoes}
        onClose={() => setShowEdicoes(false)}
        edicoes={edicoes}
        onRestaurar={removerEdicao}
      />
      <EditarItemModal
        visible={itemEditando !== null}
        item={itemEditando?.item ?? null}
        donoAtual={itemEditando?.donoAtual ?? ''}
        pessoas={pessoas.map((p) => p.dono)}
        onSalvar={handleSalvarEdicao}
        onDeletar={handleDeletarItem}
        onDividir={() => setItemDividindo(itemEditando)}
        onCriarRegra={addRegra}
        onClose={() => setItemEditando(null)}
      />
      <DividirItemModal
        visible={itemDividindo !== null}
        item={itemDividindo?.item ?? null}
        donoAtual={itemDividindo?.donoAtual ?? ''}
        pessoas={pessoas.map((p) => p.dono)}
        divisaoExistente={divisaoExistente}
        onSalvar={handleSalvarDivisao}
        onRemover={handleRemoverDivisao}
        onClose={() => setItemDividindo(null)}
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

function createTabStyles(colors: ThemeColors) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.bgElevated,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      gap: 3,
    },
    label: {
      color: colors.textFaint,
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    labelActive: { color: colors.accentLight },
  });
}
