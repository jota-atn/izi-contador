import { memo, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
      <View style={s.overlay}>
        <View style={s.container}>
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
        </View>
      </View>
    </Modal>
  );
});

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  container: {
    backgroundColor: '#0f172a',
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
