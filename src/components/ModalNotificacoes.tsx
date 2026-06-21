import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface Props {
  visible: boolean;
  diaAtual: number | null;
  onSalvar: (dia: number) => Promise<void>;
  onCancelar: () => Promise<void>;
  onFechar: () => void;
}

export function ModalNotificacoes({ visible, diaAtual, onSalvar, onCancelar, onFechar }: Props) {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTexto(diaAtual ? String(diaAtual) : '');
      setErro('');
    }
  }, [visible, diaAtual]);

  async function handleSalvar() {
    const dia = parseInt(texto, 10);
    if (!texto || isNaN(dia) || dia < 1 || dia > 31) {
      setErro('Digite um dia válido (1–31)');
      return;
    }
    setLoading(true);
    setErro('');
    try {
      await onSalvar(dia);
      onFechar();
    } catch (e: any) {
      if (e?.message === 'permission_denied') {
        setErro('Permissão de notificação negada. Ative nas configurações do celular.');
      } else {
        setErro('Erro ao salvar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDesativar() {
    setLoading(true);
    try {
      await onCancelar();
      onFechar();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={s.overlay} onPress={onFechar}>
        <Pressable style={s.card} onPress={() => {}}>
          <Text style={s.titulo}>Lembrete de fatura</Text>
          <Text style={s.descricao}>
            Te avisamos 1 dia antes do fechamento para você sincronizar as contas.
          </Text>

          <Text style={s.label}>Dia de fechamento</Text>
          <TextInput
            ref={inputRef}
            style={s.input}
            value={texto}
            onChangeText={(t) => {
              setErro('');
              setTexto(t.replace(/[^0-9]/g, ''));
            }}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="Ex: 10"
            placeholderTextColor="#475569"
            returnKeyType="done"
            onSubmitEditing={handleSalvar}
          />

          {!!erro && <Text style={s.erro}>{erro}</Text>}

          <View style={s.botoes}>
            {diaAtual !== null && (
              <Pressable
                style={[s.btn, s.btnDesativar]}
                onPress={handleDesativar}
                disabled={loading}
              >
                <Text style={s.btnDesativarTxt}>Desativar</Text>
              </Pressable>
            )}
            <Pressable
              style={[s.btn, s.btnSalvar, loading && s.btnDisabled]}
              onPress={handleSalvar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.btnSalvarTxt}>{diaAtual !== null ? 'Atualizar' : 'Ativar'}</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 12,
  },
  titulo: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '700',
  },
  descricao: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#334155',
  },
  erro: {
    color: '#f87171',
    fontSize: 13,
  },
  botoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSalvar: {
    backgroundColor: '#7c3aed',
  },
  btnSalvarTxt: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  btnDesativar: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  btnDesativarTxt: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
