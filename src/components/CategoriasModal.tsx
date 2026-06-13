import { useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Categorias } from '../config/categorias';

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

export function CategoriasModal({ visible, onClose, categorias, addKeyword, removeKeyword, addCategoria, removeCategoria, reset }: Props) {

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
      <SafeAreaView className="flex-1 bg-slate-950">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800">
          <Text className="text-white text-lg font-black tracking-tight">Categorias</Text>
          <TouchableOpacity onPress={onClose} className="px-3 py-1.5 rounded-full border border-slate-700">
            <Text className="text-slate-400 text-sm font-bold">Fechar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {Object.entries(categorias).map(([nome, palavras]) => (
            <View key={nome} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-800">
                <Text className="text-purple-400 font-black text-sm uppercase tracking-widest">
                  {nome}
                </Text>
                <TouchableOpacity onPress={() => handleRemoveCategoria(nome)}>
                  <Text className="text-red-500 text-xs font-bold">Remover</Text>
                </TouchableOpacity>
              </View>

              <View className="px-4 py-3 gap-3">
                <View className="flex-row flex-wrap gap-2">
                  {palavras.map((kw) => (
                    <TouchableOpacity
                      key={kw}
                      onPress={() => removeKeyword(nome, kw)}
                      className="flex-row items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700"
                    >
                      <Text className="text-slate-300 text-xs font-bold">{kw}</Text>
                      <Text className="text-slate-500 text-xs">✕</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="flex-row gap-2">
                  <TextInput
                    className="flex-1 bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700"
                    placeholder="Nova palavra-chave..."
                    placeholderTextColor="#475569"
                    value={kwInputs[nome] ?? ''}
                    onChangeText={(t) => setKwInputs((prev) => ({ ...prev, [nome]: t }))}
                    onSubmitEditing={() => handleAddKeyword(nome)}
                    returnKeyType="done"
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    onPress={() => handleAddKeyword(nome)}
                    className="bg-purple-700 px-3 py-2 rounded-xl items-center justify-center"
                  >
                    <Text className="text-white text-xs font-black">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View className="bg-slate-900 rounded-2xl border border-slate-800 p-4 gap-2">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Nova categoria
            </Text>
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 bg-slate-800 text-white text-sm px-3 py-2 rounded-xl border border-slate-700"
                placeholder="Ex: ACADEMIA"
                placeholderTextColor="#475569"
                value={newCat}
                onChangeText={setNewCat}
                onSubmitEditing={handleAddCategoria}
                returnKeyType="done"
                autoCapitalize="characters"
              />
              <TouchableOpacity
                onPress={handleAddCategoria}
                className="bg-purple-700 px-4 py-2 rounded-xl items-center justify-center"
              >
                <Text className="text-white text-sm font-black">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleReset}
            className="py-3 rounded-2xl border border-slate-800 items-center"
          >
            <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Restaurar padrões
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
