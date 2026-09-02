import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gasto } from '../types';
import { haptic } from '../utils/haptic';
import { IconCheck } from './icons/IconCheck';
import { IconClose } from './icons/IconClose';
import { IconSplit } from './icons/IconSplit';
import { IconWarning } from './icons/IconWarning';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  visible: boolean;
  item: Gasto | null;
  donoAtual: string;
  pessoas: string[];
  onSalvar: (novaDono: string, novaDesc: string) => void;
  onDeletar: () => void;
  onDividir: () => void;
  onCriarRegra: (keyword: string, pessoa: string) => void;
  onClose: () => void;
}

export function EditarItemModal({
  visible,
  item,
  donoAtual,
  pessoas,
  onSalvar,
  onDeletar,
  onDividir,
  onCriarRegra,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [desc, setDesc] = useState('');
  const [donoPicker, setDonoPicker] = useState('');
  const [donoCustom, setDonoCustom] = useState('');
  const [modoCustom, setModoCustom] = useState(false);
  const [criarRegra, setCriarRegra] = useState(false);

  useEffect(() => {
    if (item) {
      setDesc(item.descricao);
      setDonoPicker(donoAtual);
      setDonoCustom('');
      setModoCustom(false);
      setCriarRegra(false);
    }
  }, [item, donoAtual]);

  if (!item) return null;

  const donoFinal = modoCustom ? donoCustom.trim().toUpperCase() : donoPicker;
  const mudouDono = !!donoFinal && donoFinal !== donoAtual;

  function handleSalvar() {
    if (!donoFinal) return;
    onSalvar(donoFinal, desc.trim() || item!.descricao);
    if (criarRegra && mudouDono) {
      onCriarRegra(item!.descricao, donoFinal);
    }
    onClose();
  }

  function handleDeletar() {
    Alert.alert('Deletar item', `Remover "${item!.descricao}" da fatura?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: () => {
          haptic.warning();
          onDeletar();
          onClose();
        },
      },
    ]);
  }

  function handleDividir() {
    if (item!.editado) {
      Alert.alert(
        'Restaure a edição primeiro',
        'Este item já foi reatribuído ou renomeado no app. Restaure a edição original (menu → Edições deste mês) antes de dividir.',
      );
      return;
    }
    onDividir();
    onClose();
  }

  function handleSelecionarPessoa(p: string) {
    setDonoPicker(p);
    setModoCustom(false);
    setDonoCustom('');
  }

  function handleNovoNome() {
    setModoCustom(true);
    setDonoPicker('');
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Editar item</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconClose size={18} color={colors.textFaint} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.valorDisplay}>R$ {item.valor.toFixed(2)}</Text>
          <Text style={s.dataDisplay}>{item.data}</Text>

          <Text style={s.label}>Descrição</Text>
          <TextInput
            style={s.input}
            value={desc}
            onChangeText={setDesc}
            autoCapitalize="characters"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={s.label}>Dono</Text>

          <View style={s.pickerGrid}>
            {pessoas.map((p) => (
              <TouchableOpacity
                key={p}
                style={[s.chip, donoPicker === p && !modoCustom && s.chipAtivo]}
                onPress={() => handleSelecionarPessoa(p)}
              >
                <Text style={[s.chipText, donoPicker === p && !modoCustom && s.chipTextAtivo]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[s.chip, modoCustom && s.chipAtivo]} onPress={handleNovoNome}>
              <Text style={[s.chipText, modoCustom && s.chipTextAtivo]}>+ Novo nome</Text>
            </TouchableOpacity>
          </View>

          {modoCustom && (
            <View>
              <TextInput
                style={[s.input, { marginTop: 8 }]}
                value={donoCustom}
                onChangeText={setDonoCustom}
                placeholder="Nome do novo dono"
                autoCapitalize="characters"
                placeholderTextColor={colors.placeholder}
                autoFocus
              />
              <View style={s.aviso}>
                <IconWarning size={13} color={colors.pending} />
                <Text style={s.avisoText}>
                  Novos nomes não são reconhecidos pelo parser. Use com cuidado.
                </Text>
              </View>
            </View>
          )}

          {mudouDono && (
            <TouchableOpacity
              style={s.regraRow}
              onPress={() => setCriarRegra((v) => !v)}
              activeOpacity={0.7}
            >
              <View style={[s.checkbox, criarRegra && s.checkboxAtivo]}>
                {criarRegra && <IconCheck size={10} color="#fff" />}
                {/* branco fixo — sobre checkbox roxo preenchido nos dois temas */}
              </View>
              <Text style={s.regraText}>
                Sempre atribuir &ldquo;{item.descricao}&rdquo; a {donoFinal}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity style={s.btnDividir} onPress={handleDividir}>
            <IconSplit size={13} color={colors.accentLight} />
            <Text style={s.btnDividirText}>
              {item.origemDivisao ? 'Editar divisão' : 'Dividir compra'}
            </Text>
          </TouchableOpacity>
          <View style={s.footerRow}>
            <TouchableOpacity style={s.btnDeletar} onPress={handleDeletar}>
              <Text style={s.btnDeletarText}>Deletar item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnSalvar} onPress={handleSalvar}>
              <Text style={s.btnSalvarText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    title: { color: c.textPrimary, fontSize: 17, fontWeight: '800' },
    scroll: { flex: 1 },
    content: { padding: 24, gap: 8 },
    valorDisplay: {
      color: c.accentLight,
      fontSize: 32,
      fontWeight: '900',
      fontFamily: 'monospace',
      marginBottom: 2,
    },
    dataDisplay: { color: c.placeholder, fontSize: 12, fontWeight: '600', marginBottom: 16 },
    label: {
      color: c.textFaint,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 8,
      marginBottom: 6,
    },
    input: {
      backgroundColor: c.bgElevated,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: c.textValue,
      fontSize: 14,
      fontWeight: '600',
    },
    pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: c.bgElevated,
      borderWidth: 1,
      borderColor: c.border,
    },
    chipAtivo: { backgroundColor: c.accentSurfaceBorder, borderColor: c.accent },
    chipText: { color: c.textFaint, fontSize: 12, fontWeight: '700' },
    chipTextAtivo: { color: c.accentTextOn },
    aviso: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8 },
    avisoText: { color: c.pending, fontSize: 11, fontWeight: '600', lineHeight: 16, flex: 1 },
    regraRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: c.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxAtivo: { backgroundColor: c.accent, borderColor: c.accent },
    regraText: { color: c.textMuted, fontSize: 12, fontWeight: '600', flex: 1 },
    footer: {
      gap: 10,
      padding: 24,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    footerRow: { flexDirection: 'row', gap: 12 },
    btnDividir: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    btnDividirText: { color: c.accentLight, fontSize: 13, fontWeight: '700' },
    btnDeletar: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: c.dangerSurface,
      borderWidth: 1,
      borderColor: c.dangerBorder,
      alignItems: 'center',
    },
    btnDeletarText: { color: c.danger, fontSize: 14, fontWeight: '800' },
    btnSalvar: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: c.accentSurfaceBorder,
      alignItems: 'center',
    },
    btnSalvarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  });
}
