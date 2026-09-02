import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Categorias } from '../config/categorias';
import { Orcamentos } from '../config/orcamentos';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  categorias: Categorias;
  orcamentos: Orcamentos;
  setLimite: (categoria: string, limite: number | null) => void;
}

export function OrcamentoContent({ categorias, orcamentos, setLimite }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const kbHeight = useKeyboardHeight();
  const [textos, setTextos] = useState<Record<string, string>>({});

  useEffect(() => {
    const iniciais: Record<string, string> = {};
    for (const cat of Object.keys(categorias)) {
      iniciais[cat] = orcamentos[cat] ? String(orcamentos[cat]) : '';
    }
    setTextos(iniciais);
    // só reinicializa quando a lista de categorias muda (não a cada tecla digitada)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorias]);

  function handleBlur(categoria: string) {
    const texto = textos[categoria] ?? '';
    const valor = parseFloat(texto.replace(',', '.'));
    setLimite(categoria, texto.trim() === '' ? null : valor);
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[s.scroll, kbHeight > 0 && { paddingBottom: kbHeight + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={s.hint}>
        Defina um limite mensal por categoria. Quando o gasto do mês chegar perto (ou passar) do
        limite, o IziStats mostra o progresso e você recebe um aviso.
      </Text>

      {Object.keys(categorias).map((categoria) => (
        <View key={categoria} style={s.row}>
          <Text style={s.categoria}>{categoria}</Text>
          <View style={s.inputWrap}>
            <Text style={s.prefixo}>R$</Text>
            <TextInput
              style={s.input}
              placeholder="Sem limite"
              placeholderTextColor={colors.placeholder}
              value={textos[categoria] ?? ''}
              onChangeText={(t) => setTextos((prev) => ({ ...prev, [categoria]: t }))}
              onBlur={() => handleBlur(categoria)}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      ))}

      {Object.keys(categorias).length === 0 && (
        <Text style={s.empty}>Nenhuma categoria cadastrada ainda.</Text>
      )}
    </ScrollView>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    scroll: { padding: 16, paddingBottom: 40 },
    hint: { color: c.placeholder, fontSize: 12, lineHeight: 18, marginBottom: 20 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.bgElevated,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 8,
      gap: 12,
    },
    categoria: {
      color: c.accentLight,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
      flex: 1,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bgElevated2,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.borderStrong,
      paddingHorizontal: 10,
    },
    prefixo: { color: c.textFaint, fontSize: 12, fontWeight: '700' },
    input: {
      width: 70,
      color: c.textPrimary,
      fontSize: 13,
      fontWeight: '600',
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    empty: { color: c.borderStrong, fontSize: 13, textAlign: 'center', marginVertical: 24 },
  });
}
