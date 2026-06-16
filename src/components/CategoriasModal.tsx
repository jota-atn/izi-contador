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
import { Categorias } from '../config/categorias';
import { IconClose } from './icons/IconClose';

interface Props {
  visible: boolean;
  onClose: () => void;
  categorias: Categorias;
  addKeyword: (cat: string, kw: string) => void;
  removeKeyword: (cat: string, kw: string) => void;
  addCategoria: (nome: string) => void;
  removeCategoria: (nome: string) => void;
  reset: () => void;
}

export function CategoriasModal({
  visible, onClose, categorias,
  addKeyword, removeKeyword, addCategoria, removeCategoria, reset,
}: Props) {
  const [newCat, setNewCat] = useState('');
  const [kwInputs, setKwInputs] = useState<Record<string, string>>({});

  function handleAddCategoria() {
    if (!newCat.trim()) return;
    addCategoria(newCat.trim());
    setNewCat('');
  }

  function handleAddKeyword(cat: string) {
    const kw = kwInputs[cat] ?? '';
    if (!kw.trim()) return;
    addKeyword(cat, kw.trim());
    setKwInputs((prev) => ({ ...prev, [cat]: '' }));
  }

  function handleRemoveCategoria(nome: string) {
    Alert.alert('Remover categoria', `Remover "${nome}" e todas as suas palavras?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removeCategoria(nome) },
    ]);
  }

  function handleReset() {
    Alert.alert('Restaurar padrões', 'Todas as categorias serão substituídas pelos valores originais.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Restaurar', style: 'destructive', onPress: reset },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>

        <View style={s.header}>
          <Text style={s.headerTitle}>Categorias</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Text style={s.closeBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {Object.entries(categorias).map(([nome, palavras]) => (
            <View key={nome} style={s.card}>
              <View style={s.catHeader}>
                <Text style={s.catName}>{nome}</Text>
                <TouchableOpacity onPress={() => handleRemoveCategoria(nome)} style={s.removeBtn}>
                  <Text style={s.removeBtnText}>Remover</Text>
                </TouchableOpacity>
              </View>

              <View style={s.cardBody}>
                <View style={s.chips}>
                  {palavras.map((kw) => (
                    <TouchableOpacity
                      key={kw}
                      onPress={() => removeKeyword(nome, kw)}
                      style={s.chip}
                    >
                      <Text style={s.chipText}>{kw}</Text>
                      <IconClose size={10} color="#64748b" />
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={s.inputRow}>
                  <TextInput
                    style={s.input}
                    placeholder="Nova palavra-chave..."
                    placeholderTextColor="#475569"
                    value={kwInputs[nome] ?? ''}
                    onChangeText={(t) => setKwInputs((prev) => ({ ...prev, [nome]: t }))}
                    onSubmitEditing={() => handleAddKeyword(nome)}
                    returnKeyType="done"
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity onPress={() => handleAddKeyword(nome)} style={s.addBtn}>
                    <Text style={s.addBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={[s.card, { marginTop: 8 }]}>
            <Text style={s.newCatLabel}>Nova categoria</Text>
            <View style={[s.inputRow, { marginTop: 8 }]}>
              <TextInput
                style={s.input}
                placeholder="Ex: ACADEMIA"
                placeholderTextColor="#475569"
                value={newCat}
                onChangeText={setNewCat}
                onSubmitEditing={handleAddCategoria}
                returnKeyType="done"
                autoCapitalize="characters"
              />
              <TouchableOpacity onPress={handleAddCategoria} style={s.addBtn}>
                <Text style={s.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleReset} style={s.resetBtn}>
            <Text style={s.resetBtnText}>Restaurar padrões</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
    marginBottom: 12,
  },
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
  removeBtnText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    padding: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#fff',
    fontSize: 13,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  newCatLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  resetBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    marginTop: 4,
  },
  resetBtnText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
