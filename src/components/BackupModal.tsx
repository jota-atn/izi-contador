import { useMemo } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconClose } from './icons/IconClose';
import { IconDatabase } from './icons/IconDatabase';
import { IconTable } from './icons/IconTable';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  visible: boolean;
  onClose: () => void;
  onExportar: () => void;
  onImportar: () => void;
  onExportarCsv: () => void;
}

export function BackupModal({ visible, onClose, onExportar, onImportar, onExportarCsv }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Backup</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconClose size={18} color={colors.textFaint} />
          </TouchableOpacity>
        </View>

        <View style={s.content}>
          <Text style={s.hint}>
            Exporte todos os seus dados (faturas, edições, categorias, regras, assinaturas e chave
            Pix) num arquivo, ou importe um arquivo exportado anteriormente.
          </Text>

          <TouchableOpacity
            style={s.btn}
            onPress={() => {
              onClose();
              onExportar();
            }}
          >
            <IconDatabase size={16} color={colors.accentLight} />
            <Text style={s.btnText}>Exportar backup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btn}
            onPress={() => {
              onClose();
              onImportar();
            }}
          >
            <IconDatabase size={16} color={colors.accentLight} />
            <Text style={s.btnText}>Importar backup</Text>
          </TouchableOpacity>

          <View style={s.divider} />

          <Text style={s.hint}>
            Ou exporte uma planilha (CSV) com uma linha por item de todo o histórico — pra abrir no
            Excel/Google Sheets e fazer suas próprias análises.
          </Text>

          <TouchableOpacity
            style={s.btn}
            onPress={() => {
              onClose();
              onExportarCsv();
            }}
          >
            <IconTable size={16} color={colors.accentLight} />
            <Text style={s.btnText}>Exportar planilha (CSV)</Text>
          </TouchableOpacity>
        </View>
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
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerTitle: { color: c.textPrimary, fontSize: 17, fontWeight: '800' },
    content: { padding: 24, gap: 14 },
    hint: { color: c.textFaint, fontSize: 12, lineHeight: 18, marginBottom: 4 },
    divider: { height: 1, backgroundColor: c.border, marginVertical: 4 },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 16,
      borderRadius: 14,
      backgroundColor: c.bgElevated,
      borderWidth: 1,
      borderColor: c.border,
    },
    btnText: { color: c.textValue, fontSize: 14, fontWeight: '800' },
  });
}
