import { useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Edicao, EdicaoKey } from '../storage/edicoesFatura';
import { descreverEdicao } from '../utils/descreverEdicao';
import { IconClose } from './icons/IconClose';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  visible: boolean;
  onClose: () => void;
  edicoes: Edicao[];
  onRestaurar: (key: EdicaoKey) => void;
}

export function EdicoesModal({ visible, onClose, edicoes, onRestaurar }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Edições deste mês</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Text style={s.closeBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll}>
          <Text style={s.hint}>
            Itens reatribuídos, renomeados ou removidos no app neste mês. Restaurar volta o item ao
            estado original da fatura.
          </Text>

          {edicoes.map((ed) => (
            <View key={`${ed.item_desc}|${ed.item_data}|${ed.item_valor}`} style={s.row}>
              <View style={s.rowInfo}>
                <Text style={s.desc} numberOfLines={1}>
                  {ed.item_desc}
                </Text>
                <Text style={s.mudanca}>{descreverEdicao(ed)}</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  onRestaurar({
                    mes: ed.mes,
                    item_desc: ed.item_desc,
                    item_data: ed.item_data,
                    item_valor: ed.item_valor,
                  })
                }
                style={s.restaurarBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconClose size={12} color={colors.accentLight} />
                <Text style={s.restaurarText}>Restaurar</Text>
              </TouchableOpacity>
            </View>
          ))}

          {edicoes.length === 0 && <Text style={s.empty}>Nenhuma edição feita neste mês.</Text>}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerTitle: { color: c.textPrimary, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
    closeBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    closeBtnText: { color: c.textMuted, fontSize: 13, fontWeight: '700' },
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
      paddingVertical: 14,
      marginBottom: 8,
      gap: 12,
    },
    rowInfo: { flex: 1 },
    desc: {
      color: c.textValue,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    mudanca: { color: c.accentLight, fontSize: 11, fontWeight: '600', marginTop: 2 },
    restaurarBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    restaurarText: { color: c.accentLight, fontSize: 11, fontWeight: '700' },
    empty: { color: c.borderStrong, fontSize: 13, textAlign: 'center', marginVertical: 24 },
  });
}
