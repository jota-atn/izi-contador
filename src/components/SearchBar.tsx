import { StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';
import { haptic } from '../utils/haptic';
import { IconSearch } from './icons/IconSearch';
import { IconClose } from './icons/IconClose';

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
        <IconSearch size={14} color="#475569" />
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
          <TouchableOpacity
            onPress={() => {
              haptic.light();
              onChange('');
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconClose size={14} color="#475569" />
          </TouchableOpacity>
        )}
      </View>
      {ativo && (
        <Text style={[s.resultado, semResultado && s.resultadoVazio]}>
          {semResultado ? 'Nenhum item encontrado' : `${totalFiltrados} de ${totalItens} itens`}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 4, gap: 6 },
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
  input: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  resultado: { color: '#64748b', fontSize: 11, fontWeight: '600', paddingHorizontal: 4 },
  resultadoVazio: { color: '#f87171' },
});
