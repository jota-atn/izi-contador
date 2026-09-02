import { memo, useMemo, useRef } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import { RelatorioPessoa } from '../types';
import { formatMesAnoUpper } from '../utils/meses';
import { gerarPixPayload } from '../utils/pixPayload';
import { IconClose } from './icons/IconClose';
import { IconShare } from './icons/IconShare';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  visible: boolean;
  pessoa: RelatorioPessoa | null;
  mes: string;
  pixKey: string;
  userName: string;
  onClose: () => void;
}

export const QRCodeModal = memo(function QRCodeModal({
  visible,
  pessoa,
  mes,
  pixKey,
  userName,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const qrRef = useRef<{ toDataURL: (cb: (data: string) => void) => void } | null>(null);

  if (!pessoa) return null;

  const payload = gerarPixPayload(pixKey, userName, pessoa.total_individual);

  const handleCompartilhar = async () => {
    qrRef.current?.toDataURL(async (data) => {
      try {
        const [fs, sharing] = await Promise.all([
          import('expo-file-system/legacy'),
          import('expo-sharing'),
        ]);
        const path = `${fs.cacheDirectory}pix_qr_${pessoa.dono}.png`;
        await fs.writeAsStringAsync(path, data, { encoding: fs.EncodingType.Base64 });
        await sharing.shareAsync(path, {
          mimeType: 'image/png',
          dialogTitle: 'Compartilhar QR Pix',
        });
      } catch {
        Alert.alert(
          'Indisponível',
          'Compartilhamento de imagem requer uma atualização do app instalada.',
        );
      }
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Animated.View entering={ZoomIn.duration(220)} style={s.container}>
          <View style={s.header}>
            <View>
              <Text style={s.name}>{pessoa.dono}</Text>
              <Text style={s.mes}>{formatMesAnoUpper(mes)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={8}>
              <IconClose size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={s.qrWrap}>
            <QRCode
              value={payload}
              size={220}
              backgroundColor="#ffffff"
              color="#000000"
              getRef={(ref) => {
                qrRef.current = ref as typeof qrRef.current;
              }}
            />
          </View>

          <Text style={s.amount}>R$ {pessoa.total_individual.toFixed(2)}</Text>
          <Text style={s.key}>{pixKey}</Text>

          <TouchableOpacity style={s.shareBtn} onPress={handleCompartilhar}>
            <IconShare size={14} color="#fff" />
            <Text style={s.shareBtnText}>Compartilhar QR</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
});

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingBottom: 80,
    },
    container: {
      backgroundColor: c.bgElevated,
      borderRadius: 20,
      paddingHorizontal: 24,
      paddingVertical: 24,
      alignItems: 'center',
      gap: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      width: '100%',
    },
    name: {
      color: c.textPrimary,
      fontSize: 18,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: -0.3,
    },
    mes: {
      color: c.textFaint,
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
    },
    closeBtn: {
      padding: 4,
    },
    // fundo do QR precisa continuar branco puro pra leitura confiável do leitor
    qrWrap: {
      backgroundColor: '#ffffff',
      padding: 16,
      borderRadius: 16,
    },
    amount: {
      color: c.accentLight,
      fontSize: 28,
      fontWeight: '900',
      fontFamily: 'monospace',
    },
    key: {
      color: c.placeholder,
      fontSize: 12,
      fontWeight: '500',
    },
    shareBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.accent,
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginTop: 4,
    },
    shareBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
  });
}
