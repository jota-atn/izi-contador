import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Historico } from '../hooks/useHistorico';
import { streamGemini, GeminiMessage } from '../services/geminiApi';
import { serializarHistorico } from '../utils/serializarHistorico';
import { nomeMes } from '../utils/meses';
import { loadChatHistory, saveChatMessages } from '../storage/chatHistory';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

const PROACTIVE_PROMPT =
  'Faça uma análise do mês mais recente. Sem introdução, vá direto aos insights. ' +
  'Mencione: variação vs mês anterior (se houver), quem mais gastou e o que puxou, ' +
  'algum gasto recorrente relevante. Máximo 4 frases, texto simples.';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  streaming?: boolean;
  isHidden?: boolean; // incluída no histórico da API mas não exibida no chat
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface Props {
  historico: Historico;
  meses: string[]; // desc
  userName: string;
  userEmail: string;
  kbOffset: number; // tabBarHeight medido via onLayout na tab bar
}

export function IziBotScreen({ historico, meses, userName, userEmail, kbOffset }: Props) {
  const systemPrompt = useMemo(() => {
    if (meses.length === 0) return '';
    return (
      `Você é o IziBot, assistente financeiro do IziContador. O app divide faturas do cartão ` +
      `Nubank entre pessoas — amigos ou família que compartilham um cartão.\n\n` +
      `O usuário que usa o app é ${userName}.\n\n` +
      `Dados das faturas disponíveis:\n\n` +
      `${serializarHistorico(historico, meses)}\n\n` +
      `Instruções:\n` +
      `- Responda em português brasileiro, de forma concisa e direta\n` +
      `- Use valores em R$ com separador de milhar (ex: R$ 1.234)\n` +
      `- Mencione meses por extenso (Janeiro, Fevereiro, etc.)\n` +
      `- Foque somente nos dados disponíveis, não invente valores\n` +
      `- Não use markdown: sem asteriscos, sem hashtags, sem traços de lista — texto simples\n` +
      `- Seja objetivo e amigável`
    );
  }, [historico, meses, userName]);

  const systemPromptRef = useRef(systemPrompt);
  useEffect(() => {
    systemPromptRef.current = systemPrompt;
  }, [systemPrompt]);

  const db = useSQLiteContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [kbHeight, setKbHeight] = useState(0);
  const cancelRef = useRef<(() => void) | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const analyzedMesRef = useRef('');

  // Carrega histórico do SQLite ao trocar de mês ou usuário
  useEffect(() => {
    const currentMes = meses[0];
    if (!currentMes || !userEmail) {
      setMessages([]);
      return;
    }
    setMessages([]);
    loadChatHistory(db, userEmail, currentMes)
      .then((rows) => {
        if (rows.length === 0) return;
        setMessages(
          rows.map((r) => ({
            id: String(r.id),
            role: r.role,
            text: r.content,
            isHidden: r.is_hidden === 1,
          })),
        );
        // Já há conversa para este mês — não dispara análise proativa
        analyzedMesRef.current = currentMes;
      })
      .catch((e) => console.error('[IziBotScreen] loadChatHistory falhou:', e));
  }, [db, userEmail, meses[0]]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => cancelRef.current?.();
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) =>
      setKbHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Análise proativa — dispara uma vez por mês
  useEffect(() => {
    const currentMes = meses[0];
    if (!currentMes || !systemPrompt || !API_KEY) return;
    if (analyzedMesRef.current === currentMes) return;

    analyzedMesRef.current = currentMes;
    setStreaming(true);
    setMessages([
      { id: uid(), role: 'user', text: PROACTIVE_PROMPT, isHidden: true },
      { id: uid(), role: 'bot', text: '', streaming: true },
    ]);

    const mes = currentMes;
    cancelRef.current = streamGemini(
      API_KEY,
      systemPrompt,
      [{ role: 'user', text: PROACTIVE_PROMPT }],
      (chunk) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== 'bot') return prev;
          return [...prev.slice(0, -1), { ...last, text: last.text + chunk }];
        });
      },
      () => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== 'bot') return prev;
          const final = [...prev.slice(0, -1), { ...last, streaming: false }];
          saveChatMessages(db, userEmail, mes, [
            { role: 'user', content: PROACTIVE_PROMPT, isHidden: true },
            { role: 'bot', content: last.text },
          ]).catch((e) => console.error('[IziBotScreen] saveChatMessages falhou:', e));
          return final;
        });
        setStreaming(false);
        cancelRef.current = null;
      },
      (err) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== 'bot') return prev;
          return [
            ...prev.slice(0, -1),
            { ...last, text: `Erro na análise: ${err}`, streaming: false },
          ];
        });
        setStreaming(false);
        cancelRef.current = null;
      },
    );
  }, [meses, systemPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || streaming || meses.length === 0) return;

    if (!API_KEY) {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'user', text },
        {
          id: uid(),
          role: 'bot',
          text: 'API key não configurada. Adicione EXPO_PUBLIC_GEMINI_API_KEY no arquivo .env.',
        },
      ]);
      setInput('');
      return;
    }

    const snapshot = messages;
    const mes = meses[0];
    setInput('');
    setStreaming(true);

    const apiMessages: GeminiMessage[] = [
      ...snapshot
        .filter((m) => !m.streaming)
        .map((m) => ({
          role: m.role === 'bot' ? ('model' as const) : ('user' as const),
          text: m.text,
        })),
      { role: 'user' as const, text },
    ];

    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'user', text },
      { id: uid(), role: 'bot', text: '', streaming: true },
    ]);

    cancelRef.current = streamGemini(
      API_KEY,
      systemPromptRef.current,
      apiMessages,
      (chunk) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== 'bot') return prev;
          return [...prev.slice(0, -1), { ...last, text: last.text + chunk }];
        });
      },
      () => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== 'bot') return prev;
          const final = [...prev.slice(0, -1), { ...last, streaming: false }];
          saveChatMessages(db, userEmail, mes, [
            { role: 'user', content: text },
            { role: 'bot', content: last.text },
          ]).catch((e) => console.error('[IziBotScreen] saveChatMessages falhou:', e));
          return final;
        });
        setStreaming(false);
        cancelRef.current = null;
      },
      (err) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== 'bot') return prev;
          return [...prev.slice(0, -1), { ...last, text: `Erro: ${err}`, streaming: false }];
        });
        setStreaming(false);
        cancelRef.current = null;
      },
    );
  }, [input, streaming, messages, meses.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (meses.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>Sincronize uma fatura para ativar o IziBot.</Text>
      </View>
    );
  }

  const visibleMessages = messages.filter((m) => !m.isHidden);

  return (
    <View style={[s.root, kbHeight > 0 && { paddingBottom: kbHeight - kbOffset }]}>
      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {visibleMessages.map((msg) => (
          <View
            key={msg.id}
            style={[s.bubbleWrap, msg.role === 'user' ? s.bubbleWrapUser : s.bubbleWrapBot]}
          >
            <View style={[s.bubble, msg.role === 'user' ? s.bubbleUser : s.bubbleBot]}>
              <Text
                style={[s.bubbleText, msg.role === 'user' ? s.bubbleTextUser : s.bubbleTextBot]}
              >
                {msg.text}
                {msg.streaming && <Text style={s.cursor}>▍</Text>}
              </Text>
            </View>
          </View>
        ))}
        {streaming && visibleMessages[visibleMessages.length - 1]?.text === '' && (
          <View style={s.bubbleWrapBot}>
            <View style={s.bubbleBot}>
              <Text style={s.typing}>digitando</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={s.inputBar}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="Pergunte sobre seus gastos..."
          placeholderTextColor="#475569"
          multiline
          maxLength={500}
          onSubmitEditing={send}
          blurOnSubmit={false}
          editable={!streaming}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || streaming) && s.sendBtnDisabled]}
          onPress={send}
          disabled={!input.trim() || streaming}
          activeOpacity={0.7}
        >
          <Text style={s.sendBtnText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { color: '#475569', fontSize: 14, textAlign: 'center' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 10, paddingBottom: 8 },

  bubbleWrap: { flexDirection: 'row' },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapBot: { justifyContent: 'flex-start' },

  bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: '#7c3aed', borderBottomRightRadius: 4 },
  bubbleBot: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderBottomLeftRadius: 4,
  },

  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: '#f1f5f9' },
  bubbleTextBot: { color: '#cbd5e1' },

  cursor: { color: '#7c3aed' },
  typing: { color: '#475569', fontSize: 13, fontStyle: 'italic' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#020617',
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#f1f5f9',
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendBtnDisabled: { backgroundColor: '#3b1c7a', opacity: 0.5 },
  sendBtnText: { color: '#f1f5f9', fontSize: 13, fontWeight: '700' },
});
