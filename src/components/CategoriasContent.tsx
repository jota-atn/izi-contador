import { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Categorias } from '../config/categorias';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { IconClose } from './icons/IconClose';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  categorias: Categorias;
  addKeyword: (cat: string, kw: string) => void;
  removeKeyword: (cat: string, kw: string) => void;
  addCategoria: (nome: string) => void;
  removeCategoria: (nome: string) => void;
  reset: () => void;
}

export function CategoriasContent({
  categorias,
  addKeyword,
  removeKeyword,
  addCategoria,
  removeCategoria,
  reset,
}: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [newCat, setNewCat] = useState('');
  const [kwInputs, setKwInputs] = useState<Record<string, string>>({});
  const kbHeight = useKeyboardHeight();

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
    Alert.alert(
      'Restaurar padrões',
      'Todas as categorias serão substituídas pelos valores originais.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restaurar', style: 'destructive', onPress: reset },
      ],
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[s.scroll, kbHeight > 0 && { paddingBottom: kbHeight + 24 }]}
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
                <TouchableOpacity key={kw} onPress={() => removeKeyword(nome, kw)} style={s.chip}>
                  <Text style={s.chipText}>{kw}</Text>
                  <IconClose size={10} color={colors.textFaint} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="Nova palavra-chave..."
                placeholderTextColor={colors.placeholder}
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
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    scroll: {
      padding: 16,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: c.bgElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
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
      borderBottomColor: c.border,
    },
    catName: {
      color: c.accentLight,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    // tom de vermelho bem escuro específico deste botão — mantido
    removeBtn: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: '#1e0a0a',
      borderWidth: 1,
      borderColor: c.dangerBorder,
    },
    removeBtnText: {
      color: c.danger,
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
      backgroundColor: c.bgElevated2,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    chipText: {
      color: c.textSecondary,
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
      backgroundColor: c.bgElevated2,
      color: c.textPrimary,
      fontSize: 13,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.borderStrong,
      marginRight: 8,
    },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: c.accent,
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
      color: c.textFaint,
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
      borderColor: c.border,
      alignItems: 'center',
      marginTop: 4,
    },
    resetBtnText: {
      color: c.placeholder,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
  });
}
