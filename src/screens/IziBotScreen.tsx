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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useSQLiteContext } from 'expo-sqlite';
import { Historico } from '../hooks/useHistorico';
import { streamGemini, GeminiMessage } from '../services/geminiApi';
import { serializarHistorico } from '../utils/serializarHistorico';
import {
  loadChatHistory,
  saveChatMessages,
  clearChatHistory,
  loadChips,
  saveChips,
} from '../storage/chatHistory';
import { IconTrash } from '../components/icons/IconTrash';
import { IconSparkle } from '../components/icons/IconSparkle';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

function TypingDot({ delay }: { delay: number }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(-5, { duration: 280 }), withTiming(0, { duration: 280 })),
        -1,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: 280 }), withTiming(0.4, { duration: 280 })),
        -1,
      ),
    );
  }, [delay, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[s.typingDot, style]} />;
}

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
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const systemPrompt = useMemo(() => {
    if (meses.length === 0) return '';
    return (
      `Você é o IziBot, assistente financeiro do IziContador. O app divide faturas do cartão ` +
      `Nubank entre pessoas — amigos ou família que compartilham um cartão.\n\n` +
      `O usuário que usa o app é ${userName}.\n\n` +
      `Dados das faturas disponíveis:\n\n` +
      `${serializarHistorico(historico, meses)}\n\n` +
      `Instruções:\n` +
      `- "Não identificados" no contexto acima são gastos que ainda não têm uma pessoa definida — ` +
      `trate como uma categoria à parte, nunca como se fosse o nome de alguém\n` +
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

  const userEmailRef = useRef(userEmail);
  useEffect(() => {
    userEmailRef.current = userEmail;
  }, [userEmail]);

  const mesesRef = useRef(meses);
  useEffect(() => {
    mesesRef.current = meses;
  }, [meses]);

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
    setChips([]);
    setHistoryReady(false);
    Promise.all([loadChatHistory(db, userEmail, currentMes), loadChips(db, userEmail, currentMes)])
      .then(([rows, savedChips]) => {
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
        if (savedChips.length > 0) setChips(savedChips);
        setHistoryReady(true);
      })
      .catch((e) => {
        console.error('[IziBotScreen] load falhou:', e);
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
            (chunk) => {
              chipsBuffer += chunk;
            },
            () => {
              try {
                const match = chipsBuffer.match(/\[[\s\S]*?\]/);
                if (match) {
                  const parsed = JSON.parse(match[0]);
                  if (Array.isArray(parsed)) {
                    const valid = parsed
                      .slice(0, 3)
                      .filter((x): x is string => typeof x === 'string');
                    setChips(valid);
                    if (valid.length > 0) {
                      saveChips(db, userEmail, mes, valid).catch(() => {});
                    }
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

  const send = useCallback(
    (textOverride?: string) => {
      const meses = mesesRef.current;
      const userEmail = userEmailRef.current;
      const text = (textOverride ?? input).trim();
      if (!text || streaming || meses.length === 0) return;

      setChips([]);
      saveChips(db, userEmail, meses[0], []).catch(() => {});
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
    },
    [input, streaming, messages, db],
  );

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
  }, [db, userEmail, meses]);

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
            <IconTrash size={15} color={colors.placeholder} />
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
            {msg.role === 'bot' && (
              <View style={s.avatar}>
                <IconSparkle size={11} color={colors.accentLight} />
              </View>
            )}
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
            <View style={s.avatar}>
              <IconSparkle size={11} color={colors.accentLight} />
            </View>
            <View style={[s.bubbleBot, s.typingBubble]}>
              <TypingDot delay={0} />
              <TypingDot delay={160} />
              <TypingDot delay={320} />
            </View>
          </View>
        )}
      </ScrollView>

      {chips.length > 0 && !streaming && (
        <View style={s.chipsScroll}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipsContent}
            keyboardShouldPersistTaps="handled"
          >
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
          </ScrollView>
        </View>
      )}

      <View style={s.inputBar}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="Pergunte sobre seus gastos..."
          placeholderTextColor={colors.placeholder}
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

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyText: { color: c.placeholder, fontSize: 14, textAlign: 'center' },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerTitle: { color: c.textPrimary, fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
    headerAccent: { color: c.accent },
    clearBtn: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: c.bgElevated,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    scroll: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'flex-end',
      padding: 16,
      gap: 8,
      paddingBottom: 12,
    },

    bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    bubbleWrapUser: { justifyContent: 'flex-end' },
    bubbleWrapBot: { justifyContent: 'flex-start' },

    // tom de fundo do avatar específico deste chat — mantido
    avatar: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#150d2e',
      borderWidth: 1,
      borderColor: c.accentSurfaceBorder,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    bubble: { maxWidth: '78%', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
    // roxo específico da bolha do usuário, distinto do accent padrão — mantido
    bubbleUser: { backgroundColor: '#6d28d9', borderBottomRightRadius: 5 },
    bubbleBot: {
      backgroundColor: c.bgElevated,
      borderWidth: 1,
      borderColor: c.border,
      borderBottomLeftRadius: 5,
    },
    typingBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 18,
      paddingVertical: 14,
      gap: 6,
      borderRadius: 20,
      borderBottomLeftRadius: 5,
    },

    bubbleText: { fontSize: 14, lineHeight: 22 },
    bubbleTextUser: { color: c.textPrimary },
    bubbleTextBot: { color: c.textSecondary },

    cursor: { color: c.accent },

    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.accent,
    },

    chipsScroll: {
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.bg,
      height: 52,
      justifyContent: 'center',
    },
    chipsContent: {
      gap: 8,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    chip: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.accentSurfaceBorder,
      backgroundColor: c.accentSurface,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    chipText: { color: c.accentLight, fontSize: 12, fontWeight: '600' },

    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.bg,
    },
    input: {
      flex: 1,
      backgroundColor: c.bgElevated,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: c.textPrimary,
      fontSize: 14,
      maxHeight: 100,
    },
    sendBtn: {
      backgroundColor: c.accent,
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    // tom apagado específico do botão desabilitado deste chat — mantido
    sendBtnDisabled: { backgroundColor: '#3b1c7a', opacity: 0.5 },
    sendBtnText: { color: c.textPrimary, fontSize: 13, fontWeight: '700' },
  });
}
