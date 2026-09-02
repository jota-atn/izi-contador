import { memo, useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { sanitizarChavePix } from '../utils/pixPayload';
import { IconClose } from './icons/IconClose';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  visible: boolean;
  pixKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

export const PixKeyModal = memo(function PixKeyModal({ visible, pixKey, onSave, onClose }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [value, setValue] = useState(pixKey);

  useEffect(() => {
    if (visible) setValue(pixKey);
  }, [visible, pixKey]);

  const sanitized = sanitizarChavePix(value);
  const showPreview = value.trim().length > 0 && sanitized !== value.trim().replace(/\s+/g, '');

  const handleSave = () => {
    onSave(sanitized);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Animated.View entering={ZoomIn.duration(220)} style={s.container}>
          <View style={s.header}>
            <Text style={s.title}>Minha chave Pix</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={8}>
              <IconClose size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={s.label}>
            A chave será incluída no final das mensagens de compartilhamento.
          </Text>

          <TextInput
            style={s.input}
            value={value}
            onChangeText={setValue}
            placeholder="CPF, e-mail, telefone ou chave aleatória"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          {showPreview && <Text style={s.preview}>Será salvo como: {sanitized}</Text>}

          <View style={s.actions}>
            {value.trim().length > 0 && (
              <TouchableOpacity
                style={s.btnSecondary}
                onPress={() => {
                  onSave('');
                  onClose();
                }}
              >
                <Text style={s.btnSecondaryText}>Remover</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.btnPrimary} onPress={handleSave}>
              <Text style={s.btnPrimaryText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingBottom: 80,
    },
    container: {
      backgroundColor: c.bgElevated,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 20,
      gap: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      color: c.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    closeBtn: {
      padding: 4,
    },
    label: {
      color: c.textFaint,
      fontSize: 13,
      lineHeight: 18,
    },
    input: {
      backgroundColor: c.bgElevated2,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.borderStrong,
      color: c.textPrimary,
      fontSize: 15,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },
    btnPrimary: {
      backgroundColor: c.accent,
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    btnPrimaryText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
    btnSecondary: {
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    btnSecondaryText: {
      color: c.textMuted,
      fontWeight: '600',
      fontSize: 14,
    },
    preview: {
      color: c.success,
      fontSize: 12,
      fontFamily: 'monospace',
      marginTop: -4,
    },
  });
}
