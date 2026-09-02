import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Edicao, EdicaoKey } from '../storage/edicoesFatura';
import { descreverEdicao } from '../utils/descreverEdicao';
import { IconClose } from './icons/IconClose';

interface Props {
  visible: boolean;
  onClose: () => void;
  edicoes: Edicao[];
  onRestaurar: (key: EdicaoKey) => void;
}

export function EdicoesModal({ visible, onClose, edicoes, onRestaurar }: Props) {
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
                <IconClose size={12} color="#a78bfa" />
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

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  closeBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },
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
    paddingVertical: 14,
    marginBottom: 8,
    gap: 12,
  },
  rowInfo: { flex: 1 },
  desc: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  mudanca: { color: '#a78bfa', fontSize: 11, fontWeight: '600', marginTop: 2 },
  restaurarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  restaurarText: { color: '#a78bfa', fontSize: 11, fontWeight: '700' },
  empty: { color: '#334155', fontSize: 13, textAlign: 'center', marginVertical: 24 },
});
