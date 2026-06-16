import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  value: string;
  onChange: (v: string) => void;
  totalItens: number;
  totalFiltrados: number;
}

export function SearchBar({ value, onChange, totalItens, totalFiltrados }: Props) {
  const ativo = value.length > 0;
  const semResultado = ativo && totalFiltrados === 0;

  return (
    <View style={s.wrap}>
      <View style={[s.inputWrap, ativo && s.inputWrapAtivo]}>
        <Text style={s.icon}>🔍</Text>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChange}
          placeholder="Buscar item..."
          placeholderTextColor="#475569"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {ativo && (
          <TouchableOpacity onPress={() => onChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.clear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      {ativo && (
        <Text style={[s.resultado, semResultado && s.resultadoVazio]}>
          {semResultado
            ? 'Nenhum item encontrado'
            : `${totalFiltrados} de ${totalItens} itens`}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingBottom: 4, gap: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  inputWrapAtivo: { borderColor: '#7c3aed' },
  icon: { fontSize: 14 },
  input: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  clear: { color: '#475569', fontSize: 14, fontWeight: '700' },
  resultado: { color: '#64748b', fontSize: 11, fontWeight: '600', paddingHorizontal: 4 },
  resultadoVazio: { color: '#f87171' },
});
