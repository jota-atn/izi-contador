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
import { loadChatHistory, saveChatMessages, clearChatHistory } from '../storage/chatHistory';
import { IconTrash } from '../components/icons/IconTrash';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

const PROACTIVE_PROMPT =
  'Faça uma análise do mês mais recente. Sem introdução, vá direto aos insights. ' +
  'Mencione: variação vs mês anterior (se houver), quem mais gastou e o que puxou, ' +
  'algum gasto recorrente relevante. Máximo 4 frases, texto simples.';

const CHIPS_PROMPT =
  'Com base na análise acima, sugira exatamente 3 perguntas curtas (máximo 6 palavras cada) ' +
  'que o usuário pode querer perguntar sobre seus gastos. ' +
  'Retorne somente um array JSON de strings, sem mais nenhum texto. ' +
  'Exemplo: ["Quem gastou mais?","Maiores gastos do mês","Compare meses anteriores"]';

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
  const [chips, setChips] = useState<string[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const analyzedMesRef = useRef('');

  // Carrega histórico do SQLite ao trocar de mês ou usuário
  useEffect(() => {
    const currentMes = meses[0];
    if (!currentMes || !userEmail) {
      setMessages([]);
      setHistoryReady(true);
      return;
    }
    setMessages([]);
    setHistoryReady(false);
    loadChatHistory(db, userEmail, currentMes)
      .then((rows) => {
        if (rows.length > 0) {
          setMessages(
            rows.map((r) => ({
              id: String(r.id),
              role: r.role,
              text: r.content,
              isHidden: r.is_hidden === 1,
            })),
          );
          // Já há conversa — bloqueia análise proativa para este mês
          analyzedMesRef.current = currentMes;
        }
        setHistoryReady(true);
      })
      .catch((e) => {
        console.error('[IziBotScreen] loadChatHistory falhou:', e);
        setHistoryReady(true);
      });
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

  // Análise proativa — dispara uma vez por mês, só após checar o histórico
  useEffect(() => {
    if (!historyReady) return;
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
    let botTextBuffer = '';
    cancelRef.current = streamGemini(
      API_KEY,
      systemPrompt,
      [{ role: 'user', text: PROACTIVE_PROMPT }],
      (chunk) => {
        botTextBuffer += chunk;
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
        // Busca chips de forma silenciosa após a análise proativa
        if (botTextBuffer) {
          let chipsBuffer = '';
          streamGemini(
            API_KEY,
            systemPromptRef.current,
            [
              { role: 'user', text: PROACTIVE_PROMPT },
              { role: 'model', text: botTextBuffer },
              { role: 'user', text: CHIPS_PROMPT },
            ],
            (chunk) => { chipsBuffer += chunk; },
            () => {
              try {
                const match = chipsBuffer.match(/\[[\s\S]*?\]/);
                if (match) {
                  const parsed = JSON.parse(match[0]);
                  if (Array.isArray(parsed)) {
                    setChips(parsed.slice(0, 3).filter((x): x is string => typeof x === 'string'));
                  }
                }
              } catch {}
            },
            () => {}, // chips são best-effort; ignora erros
          );
        }
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
  }, [historyReady, meses, systemPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = useCallback((textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || streaming || meses.length === 0) return;

    setChips([]);
    if (!textOverride) setInput('');

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
      return;
    }

    const snapshot = messages;
    const mes = meses[0];
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

  const handleClear = useCallback(() => {
    const currentMes = meses[0];
    if (!currentMes || !userEmail) return;
    cancelRef.current?.();
    cancelRef.current = null;
    setStreaming(false);
    setMessages([]);
    setChips([]);
    setHistoryReady(true);
    analyzedMesRef.current = '';
    clearChatHistory(db, userEmail, currentMes).catch((e) =>
      console.error('[IziBotScreen] clearChatHistory falhou:', e),
    );
  }, [db, userEmail, meses]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <View style={s.header}>
        <Text style={s.headerTitle}>
          Izi<Text style={s.headerAccent}>Bot</Text>
        </Text>
        {visibleMessages.length > 0 && !streaming && (
          <TouchableOpacity
            onPress={handleClear}
            style={s.clearBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconTrash size={15} color="#475569" />
          </TouchableOpacity>
        )}
      </View>
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

      {chips.length > 0 && !streaming && (
        <View style={s.chipsRow}>
          {chips.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={s.chip}
              onPress={() => send(chip)}
              activeOpacity={0.7}
            >
              <Text style={s.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={s.inputBar}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="Pergunte sobre seus gastos..."
          placeholderTextColor="#475569"
          multiline
          maxLength={500}
          onSubmitEditing={() => send()}
          blurOnSubmit={false}
          editable={!streaming}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || streaming) && s.sendBtnDisabled]}
          onPress={() => send()}
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  headerAccent: { color: '#7c3aed' },
  clearBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },

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

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#020617',
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4c1d95',
    backgroundColor: '#1e1040',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { color: '#a78bfa', fontSize: 12, fontWeight: '600' },

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
