import { memo, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconClose } from './icons/IconClose';

interface Props {
  visible: boolean;
  pixKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

export const PixKeyModal = memo(function PixKeyModal({ visible, pixKey, onSave, onClose }: Props) {
  const [value, setValue] = useState(pixKey);

  useEffect(() => {
    if (visible) setValue(pixKey);
  }, [visible, pixKey]);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.overlay}
      >
        <SafeAreaView style={s.container}>
          <View style={s.header}>
            <Text style={s.title}>Minha chave Pix</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={8}>
              <IconClose size={18} color="#94a3b8" />
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
            placeholderTextColor="#475569"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

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
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  title: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  label: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f1f5f9',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingBottom: 8,
  },
  btnPrimary: {
    backgroundColor: '#7c3aed',
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
    borderColor: '#334155',
  },
  btnSecondaryText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
});
