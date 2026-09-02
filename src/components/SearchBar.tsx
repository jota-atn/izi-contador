import { useMemo } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';
import { haptic } from '../utils/haptic';
import { IconSearch } from './icons/IconSearch';
import { IconClose } from './icons/IconClose';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  value: string;
  onChange: (v: string) => void;
  totalItens: number;
  totalFiltrados: number;
}

export function SearchBar({ value, onChange, totalItens, totalFiltrados }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const ativo = value.length > 0;
  const semResultado = ativo && totalFiltrados === 0;

  return (
    <View style={s.wrap}>
      <View style={[s.inputWrap, ativo && s.inputWrapAtivo]}>
        <IconSearch size={14} color={colors.placeholder} />
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChange}
          placeholder="Buscar item..."
          placeholderTextColor={colors.placeholder}
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
            <IconClose size={14} color={colors.placeholder} />
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

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    wrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, gap: 6 },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bgElevated,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 10,
    },
    inputWrapAtivo: { borderColor: c.accent },
    input: {
      flex: 1,
      color: c.textValue,
      fontSize: 14,
      fontWeight: '600',
    },
    resultado: { color: c.textFaint, fontSize: 11, fontWeight: '600', paddingHorizontal: 4 },
    resultadoVazio: { color: c.danger },
  });
}
