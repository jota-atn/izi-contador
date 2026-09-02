import { useEffect, useState } from 'react';
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
import { DivisaoItem, DivisaoShare } from '../storage/divisoesFatura';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { haptic } from '../utils/haptic';
import { IconClose } from './icons/IconClose';

interface Props {
  visible: boolean;
  item: Gasto | null;
  donoAtual: string;
  pessoas: string[];
  divisaoExistente: DivisaoItem | null;
  onSalvar: (shares: DivisaoShare[]) => void;
  onRemover: () => void;
  onClose: () => void;
}

interface ShareForm {
  pessoa: string;
  valor: string;
}

const SHARE_VAZIO: ShareForm = { pessoa: '', valor: '' };

export function DividirItemModal({
  visible,
  item,
  donoAtual,
  pessoas,
  divisaoExistente,
  onSalvar,
  onRemover,
  onClose,
}: Props) {
  const [shares, setShares] = useState<ShareForm[]>([SHARE_VAZIO]);
  const kbHeight = useKeyboardHeight();

  useEffect(() => {
    if (!item) return;
    setShares(
      divisaoExistente && divisaoExistente.shares.length > 0
        ? divisaoExistente.shares.map((s) => ({ pessoa: s.pessoa, valor: String(s.valor) }))
        : [SHARE_VAZIO],
    );
  }, [item, divisaoExistente]);

  if (!item) return null;

  function handleShareChange(idx: number, campo: keyof ShareForm, valor: string) {
    setShares((prev) => prev.map((s, i) => (i === idx ? { ...s, [campo]: valor } : s)));
  }

  function handleAddShareRapido(pessoa: string) {
    setShares((prev) => {
      if (prev.length === 1 && !prev[0].pessoa && !prev[0].valor) {
        return [{ pessoa, valor: '' }];
      }
      return [...prev, { pessoa, valor: '' }];
    });
  }

  function handleAddShareRow() {
    setShares((prev) => [...prev, SHARE_VAZIO]);
  }

  function handleRemoveShareRow(idx: number) {
    setShares((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  }

  function handleSalvar() {
    const validos: DivisaoShare[] = shares
      .map((s) => ({ pessoa: s.pessoa.trim().toUpperCase(), valor: parseFloat(s.valor.replace(',', '.')) }))
      .filter((s) => s.pessoa && !isNaN(s.valor) && s.valor > 0);

    if (validos.length === 0) {
      Alert.alert('Divisão incompleta', 'Adicione ao menos uma pessoa com valor válido.');
      return;
    }

    onSalvar(validos);
    onClose();
  }

  function handleRemover() {
    Alert.alert('Remover divisão', `"${item!.descricao}" volta a ser um item único.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          haptic.warning();
          onRemover();
          onClose();
        },
      },
    ]);
  }

  const nomesJaAdicionados = new Set(
    shares.map((s) => s.pessoa.trim().toUpperCase()).filter(Boolean),
  );
  const pessoasRapidas = pessoas.filter(
    (p) => p !== donoAtual && !nomesJaAdicionados.has(p.trim().toUpperCase()),
  );

  const somaShares = shares.reduce((acc, s) => {
    const v = parseFloat(s.valor.replace(',', '.'));
    return acc + (isNaN(v) ? 0 : v);
  }, 0);
  const restante = parseFloat((item.valor - somaShares).toFixed(2));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>{divisaoExistente ? 'Editar divisão' : 'Dividir compra'}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconClose size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[s.scroll, kbHeight > 0 && { paddingBottom: kbHeight + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.valorDisplay}>R$ {item.valor.toFixed(2)}</Text>
          <Text style={s.descDisplay}>{item.descricao}</Text>
          <Text style={s.hint}>
            Adicione quem mais participou dessa compra e o valor de cada um. O que sobrar fica com{' '}
            {donoAtual}.
          </Text>

          {shares.map((sh, idx) => (
            <View key={idx} style={s.shareRow}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Pessoa"
                placeholderTextColor="#475569"
                value={sh.pessoa}
                onChangeText={(t) => handleShareChange(idx, 'pessoa', t)}
                autoCapitalize="words"
              />
              <TextInput
                style={[s.input, { width: 90 }]}
                placeholder="Valor"
                placeholderTextColor="#475569"
                value={sh.valor}
                onChangeText={(t) => handleShareChange(idx, 'valor', t)}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                onPress={() => handleRemoveShareRow(idx)}
                style={s.removeShareBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconClose size={12} color="#f87171" />
              </TouchableOpacity>
            </View>
          ))}

          {pessoasRapidas.length > 0 && (
            <View style={s.rapidasWrap}>
              <Text style={s.rapidasLabel}>Adicionar</Text>
              <View style={s.rapidasChips}>
                {pessoasRapidas.map((p) => (
                  <TouchableOpacity key={p} style={s.chipRapido} onPress={() => handleAddShareRapido(p)}>
                    <Text style={s.chipRapidoText}>+ {p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity onPress={handleAddShareRow} style={s.addShareBtn}>
            <Text style={s.addShareText}>+ Novo nome</Text>
          </TouchableOpacity>

          <Text style={s.restante}>
            {restante > 0.01
              ? `Fica com ${donoAtual}: R$ ${restante.toFixed(2)}`
              : restante < -0.01
                ? `Acerto: R$ ${Math.abs(restante).toFixed(2)} além do valor da compra`
                : 'Soma bate exatamente com o total'}
          </Text>
        </ScrollView>

        <View style={s.footer}>
          {divisaoExistente && (
            <TouchableOpacity style={s.btnRemover} onPress={handleRemover}>
              <Text style={s.btnRemoverText}>Remover divisão</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.btnSalvar} onPress={handleSalvar}>
            <Text style={s.btnSalvarText}>Salvar divisão</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  scroll: { padding: 24, gap: 10 },
  valorDisplay: {
    color: '#a78bfa',
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  descDisplay: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  hint: { color: '#475569', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  removeShareBtn: { padding: 4 },
  rapidasWrap: { marginTop: 2, marginBottom: 8, gap: 6 },
  rapidasLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rapidasChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipRapido: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1e1040',
    borderWidth: 1,
    borderColor: '#4c1d95',
  },
  chipRapidoText: { color: '#c4b5fd', fontSize: 12, fontWeight: '700' },
  addShareBtn: { paddingVertical: 8, alignItems: 'flex-start' },
  addShareText: { color: '#a78bfa', fontSize: 12, fontWeight: '700' },
  restante: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    gap: 10,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  btnRemover: {
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#1c0707',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    alignItems: 'center',
  },
  btnRemoverText: { color: '#f87171', fontSize: 13, fontWeight: '800' },
  btnSalvar: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#4c1d95',
    alignItems: 'center',
  },
  btnSalvarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
