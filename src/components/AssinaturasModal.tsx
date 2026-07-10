import { useState } from 'react';
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
import { Assinatura } from '../config/assinaturas';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { IconClose } from './icons/IconClose';

interface Props {
  visible: boolean;
  onClose: () => void;
  assinaturas: Assinatura[];
  pessoas: string[];
  salvarAssinatura: (assinatura: Assinatura) => void;
  removerAssinatura: (keyword: string) => void;
}

interface ParticipanteForm {
  pessoa: string;
  valor: string;
}

const PARTICIPANTE_VAZIO: ParticipanteForm = { pessoa: '', valor: '' };

export function AssinaturasModal({
  visible,
  onClose,
  assinaturas,
  pessoas,
  salvarAssinatura,
  removerAssinatura,
}: Props) {
  const [keyword, setKeyword] = useState('');
  const [participantes, setParticipantes] = useState<ParticipanteForm[]>([PARTICIPANTE_VAZIO]);
  const [editandoOriginal, setEditandoOriginal] = useState<string | null>(null);
  const kbHeight = useKeyboardHeight();

  function resetForm() {
    setKeyword('');
    setParticipantes([PARTICIPANTE_VAZIO]);
    setEditandoOriginal(null);
  }

  function handleEditar(a: Assinatura) {
    setKeyword(a.keyword);
    setParticipantes(a.participantes.map((p) => ({ pessoa: p.pessoa, valor: String(p.valor) })));
    setEditandoOriginal(a.keyword);
  }

  function handleParticipanteChange(idx: number, campo: keyof ParticipanteForm, valor: string) {
    setParticipantes((prev) => prev.map((p, i) => (i === idx ? { ...p, [campo]: valor } : p)));
  }

  function handleAddParticipanteRapido(pessoa: string) {
    setParticipantes((prev) => {
      // se só tem uma linha vazia, preenche ela em vez de criar uma nova
      if (prev.length === 1 && !prev[0].pessoa && !prev[0].valor) {
        return [{ pessoa, valor: '' }];
      }
      return [...prev, { pessoa, valor: '' }];
    });
  }

  function handleAddParticipanteRow() {
    setParticipantes((prev) => [...prev, PARTICIPANTE_VAZIO]);
  }

  function handleRemoveParticipanteRow(idx: number) {
    setParticipantes((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  }

  function handleSalvar() {
    const kw = keyword.trim();
    if (!kw) return;

    const validos = participantes
      .map((p) => ({ pessoa: p.pessoa.trim(), valor: parseFloat(p.valor.replace(',', '.')) }))
      .filter((p) => p.pessoa && !isNaN(p.valor) && p.valor > 0);

    if (validos.length === 0) {
      Alert.alert('Assinatura incompleta', 'Adicione ao menos uma pessoa com valor válido.');
      return;
    }

    // renomeou a palavra-chave durante a edição — remove a entrada antiga
    if (editandoOriginal && editandoOriginal !== kw) {
      removerAssinatura(editandoOriginal);
    }

    salvarAssinatura({ keyword: kw, participantes: validos });
    resetForm();
  }

  function handleRemover(kw: string) {
    Alert.alert('Remover assinatura', `Remover a divisão automática de "${kw}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          if (editandoOriginal === kw) resetForm();
          removerAssinatura(kw);
        },
      },
    ]);
  }

  const nomesJaAdicionados = new Set(
    participantes.map((p) => p.pessoa.trim().toUpperCase()).filter(Boolean),
  );
  const pessoasRapidas = pessoas.filter((p) => !nomesJaAdicionados.has(p.trim().toUpperCase()));

  const totalConfigurado = participantes.reduce((s, p) => {
    const v = parseFloat(p.valor.replace(',', '.'));
    return s + (isNaN(v) ? 0 : v);
  }, 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        resetForm();
        onClose();
      }}
    >
      <SafeAreaView style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Assinaturas</Text>
          <TouchableOpacity
            onPress={() => {
              resetForm();
              onClose();
            }}
            style={s.closeBtn}
          >
            <Text style={s.closeBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[s.scroll, kbHeight > 0 && { paddingBottom: kbHeight + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.hint}>
            Cadastre uma assinatura recorrente (ex.: Netflix) e quem divide ela com você. Todo mês o
            valor real da fatura já entra dividido nesses valores fixos automaticamente — sem
            precisar anotar nada. Uma anotação manual no título daquele mês sempre tem prioridade.
          </Text>

          {assinaturas.map((a) => (
            <TouchableOpacity
              key={a.keyword}
              style={[s.card, editandoOriginal === a.keyword && s.cardEditando]}
              onPress={() => handleEditar(a)}
              activeOpacity={0.8}
            >
              <View style={s.catHeader}>
                <Text style={s.catName}>{a.keyword}</Text>
                <TouchableOpacity onPress={() => handleRemover(a.keyword)} style={s.removeBtn}>
                  <Text style={s.removeBtnText}>Remover</Text>
                </TouchableOpacity>
              </View>
              <View style={s.chips}>
                {a.participantes.map((p, idx) => (
                  <View key={idx} style={s.chip}>
                    <Text style={s.chipText}>
                      {p.pessoa}: R$ {p.valor.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}

          {assinaturas.length === 0 && <Text style={s.empty}>Nenhuma assinatura cadastrada.</Text>}

          <View style={[s.card, { marginTop: 8 }]}>
            <View style={s.formHeaderRow}>
              <Text style={s.newCatLabel}>
                {editandoOriginal ? 'Editando assinatura' : 'Nova assinatura'}
              </Text>
              {editandoOriginal && (
                <TouchableOpacity
                  onPress={resetForm}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={s.cancelarEdicaoText}>Cancelar edição</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={s.cardBody}>
              <TextInput
                style={s.input}
                placeholder="Palavra-chave (ex: NETFLIX)"
                placeholderTextColor="#475569"
                value={keyword}
                onChangeText={setKeyword}
                autoCapitalize="characters"
                returnKeyType="next"
              />

              {participantes.map((p, idx) => (
                <View key={idx} style={s.participanteRow}>
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    placeholder="Pessoa"
                    placeholderTextColor="#475569"
                    value={p.pessoa}
                    onChangeText={(t) => handleParticipanteChange(idx, 'pessoa', t)}
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={[s.input, { width: 90 }]}
                    placeholder="Valor"
                    placeholderTextColor="#475569"
                    value={p.valor}
                    onChangeText={(t) => handleParticipanteChange(idx, 'valor', t)}
                    keyboardType="decimal-pad"
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveParticipanteRow(idx)}
                    style={s.removeParticipanteBtn}
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
                      <TouchableOpacity
                        key={p}
                        style={s.chipRapido}
                        onPress={() => handleAddParticipanteRapido(p)}
                      >
                        <Text style={s.chipRapidoText}>+ {p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity onPress={handleAddParticipanteRow} style={s.addParticipanteBtn}>
                <Text style={s.addParticipanteText}>+ Novo nome</Text>
              </TouchableOpacity>

              {totalConfigurado > 0 && (
                <Text style={s.totalConfigurado}>
                  Total configurado: R$ {totalConfigurado.toFixed(2)}
                </Text>
              )}

              <TouchableOpacity onPress={handleSalvar} style={s.saveBtn}>
                <Text style={s.saveBtnText}>
                  {editandoOriginal ? 'Salvar alterações' : 'Salvar assinatura'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  closeBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  hint: { color: '#475569', fontSize: 12, lineHeight: 18, marginBottom: 20 },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardEditando: { borderColor: '#7c3aed' },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  catName: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#1e0a0a',
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  removeBtnText: { color: '#f87171', fontSize: 11, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 14 },
  chip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipText: { color: '#cbd5e1', fontSize: 12, fontWeight: '700' },
  empty: { color: '#334155', fontSize: 13, textAlign: 'center', marginVertical: 24 },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  cancelarEdicaoText: { color: '#f87171', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 14, gap: 10 },
  newCatLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#fff',
    fontSize: 13,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  participanteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  removeParticipanteBtn: { padding: 4 },
  rapidasWrap: { marginTop: 2, gap: 6 },
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
  addParticipanteBtn: { paddingVertical: 8, alignItems: 'flex-start' },
  addParticipanteText: { color: '#a78bfa', fontSize: 12, fontWeight: '700' },
  totalConfigurado: { color: '#64748b', fontSize: 11, fontWeight: '600', textAlign: 'right' },
  saveBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
