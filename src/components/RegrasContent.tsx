import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RegrasAlocacao } from '../config/regrasAlocacao';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { IconClose } from './icons/IconClose';

interface Props {
  regras: RegrasAlocacao;
  addRegra: (keyword: string, pessoa: string) => void;
  removeRegra: (keyword: string) => void;
}

export function RegrasContent({ regras, addRegra, removeRegra }: Props) {
  const [keyword, setKeyword] = useState('');
  const [pessoa, setPessoa] = useState('');
  const kbHeight = useKeyboardHeight();

  function handleAdd() {
    if (!keyword.trim() || !pessoa.trim()) return;
    addRegra(keyword.trim(), pessoa.trim());
    setKeyword('');
    setPessoa('');
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[s.scroll, kbHeight > 0 && { paddingBottom: kbHeight + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={s.hint}>
        Define que compras com certa palavra vão para uma pessoa específica. Tem prioridade menor
        que o sufixo &ldquo;- Nome&rdquo; no título, mas decide o dono quando o item bate com uma
        categoria (ex.: Almoço, Streaming) e não tem sufixo. Sem regra nesses casos, o item vai para
        Não identificados.
      </Text>

      {Object.entries(regras).map(([kw, p]) => (
        <View key={kw} style={s.row}>
          <View style={s.rowLabels}>
            <Text style={s.keyword}>{kw}</Text>
            <Text style={s.arrow}>→</Text>
            <Text style={s.pessoa}>{p}</Text>
          </View>
          <TouchableOpacity
            onPress={() => removeRegra(kw)}
            style={s.removeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconClose size={12} color="#f87171" />
          </TouchableOpacity>
        </View>
      ))}

      {Object.keys(regras).length === 0 && <Text style={s.empty}>Nenhuma regra cadastrada.</Text>}

      <View style={s.addCard}>
        <Text style={s.addLabel}>Nova regra</Text>
        <View style={s.inputs}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            placeholder="Palavra-chave"
            placeholderTextColor="#475569"
            value={keyword}
            onChangeText={setKeyword}
            autoCapitalize="characters"
            returnKeyType="next"
          />
          <Text style={s.arrow}>→</Text>
          <TextInput
            style={[s.input, { flex: 1 }]}
            placeholder="Pessoa"
            placeholderTextColor="#475569"
            value={pessoa}
            onChangeText={setPessoa}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity onPress={handleAdd} style={s.addBtn}>
            <Text style={s.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  hint: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  rowLabels: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  keyword: { color: '#a78bfa', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  arrow: { color: '#475569', fontSize: 13, fontWeight: '700' },
  pessoa: { color: '#e2e8f0', fontSize: 13, fontWeight: '700' },
  removeBtn: {
    padding: 4,
  },
  empty: { color: '#334155', fontSize: 13, textAlign: 'center', marginVertical: 24 },
  addCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginTop: 8,
  },
  addLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  inputs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    backgroundColor: '#1e293b',
    color: '#fff',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 26 },
});
