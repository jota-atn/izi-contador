import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Categorias } from '../config/categorias';
import { Orcamentos } from '../config/orcamentos';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';

interface Props {
  categorias: Categorias;
  orcamentos: Orcamentos;
  setLimite: (categoria: string, limite: number | null) => void;
}

export function OrcamentoContent({ categorias, orcamentos, setLimite }: Props) {
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
              placeholderTextColor="#475569"
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

const s = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  hint: { color: '#475569', fontSize: 12, lineHeight: 18, marginBottom: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 12,
  },
  categoria: { color: '#a78bfa', fontSize: 12, fontWeight: '800', letterSpacing: 0.5, flex: 1 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
  },
  prefixo: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  input: {
    width: 70,
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  empty: { color: '#334155', fontSize: 13, textAlign: 'center', marginVertical: 24 },
});
