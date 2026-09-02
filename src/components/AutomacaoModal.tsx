import { useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Categorias } from '../config/categorias';
import { RegrasAlocacao } from '../config/regrasAlocacao';
import { Assinatura } from '../config/assinaturas';
import { Orcamentos } from '../config/orcamentos';
import { CategoriasContent } from './CategoriasContent';
import { RegrasContent } from './RegrasContent';
import { AssinaturasContent } from './AssinaturasContent';
import { OrcamentoContent } from './OrcamentoContent';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

type Tab = 'categorias' | 'regras' | 'assinaturas' | 'orcamento';

const TABS: { key: Tab; label: string }[] = [
  { key: 'categorias', label: 'Categorias' },
  { key: 'regras', label: 'Regras' },
  { key: 'assinaturas', label: 'Assinaturas' },
  { key: 'orcamento', label: 'Orçamento' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  categorias: Categorias;
  addKeyword: (cat: string, kw: string) => void;
  removeKeyword: (cat: string, kw: string) => void;
  addCategoria: (nome: string) => void;
  removeCategoria: (nome: string) => void;
  resetCategorias: () => void;
  regras: RegrasAlocacao;
  addRegra: (keyword: string, pessoa: string) => void;
  removeRegra: (keyword: string) => void;
  assinaturas: Assinatura[];
  pessoas: string[];
  salvarAssinatura: (assinatura: Assinatura) => void;
  removerAssinatura: (keyword: string) => void;
  orcamentos: Orcamentos;
  setLimite: (categoria: string, limite: number | null) => void;
}

export function AutomacaoModal({
  visible,
  onClose,
  categorias,
  addKeyword,
  removeKeyword,
  addCategoria,
  removeCategoria,
  resetCategorias,
  regras,
  addRegra,
  removeRegra,
  assinaturas,
  pessoas,
  salvarAssinatura,
  removerAssinatura,
  orcamentos,
  setLimite,
}: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [tab, setTab] = useState<Tab>('categorias');

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Automação</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Text style={s.closeBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <View style={s.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[s.tab, tab === t.key && s.tabAtivo]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[s.tabText, tab === t.key && s.tabTextAtivo]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'categorias' && (
          <CategoriasContent
            categorias={categorias}
            addKeyword={addKeyword}
            removeKeyword={removeKeyword}
            addCategoria={addCategoria}
            removeCategoria={removeCategoria}
            reset={resetCategorias}
          />
        )}
        {tab === 'regras' && (
          <RegrasContent regras={regras} addRegra={addRegra} removeRegra={removeRegra} />
        )}
        {tab === 'assinaturas' && (
          <AssinaturasContent
            assinaturas={assinaturas}
            pessoas={pessoas}
            salvarAssinatura={salvarAssinatura}
            removerAssinatura={removerAssinatura}
          />
        )}
        {tab === 'orcamento' && (
          <OrcamentoContent categorias={categorias} orcamentos={orcamentos} setLimite={setLimite} />
        )}
      </SafeAreaView>
    </Modal>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerTitle: { color: c.textPrimary, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
    closeBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    closeBtnText: { color: c.textMuted, fontSize: 13, fontWeight: '700' },
    tabs: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: c.bgElevated,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
    },
    tabAtivo: { backgroundColor: c.accentSurfaceBorder, borderColor: c.accent },
    tabText: { color: c.textFaint, fontSize: 12, fontWeight: '700' },
    tabTextAtivo: { color: c.accentTextOn },
  });
}
