import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSparkle } from './icons/IconSparkle';
import { IconCard } from './icons/IconCard';
import { IconBook } from './icons/IconBook';
import { IconBell } from './icons/IconBell';
import { IconEdit } from './icons/IconEdit';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

const { width: W } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

type SlideKey = 'welcome' | 'como' | 'anotar' | 'editar' | 'notif';
const SLIDES: SlideKey[] = ['welcome', 'como', 'anotar', 'editar', 'notif'];

export function OnboardingModal({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function avancar() {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: next * W, animated: true });
      setCurrentIndex(next);
    } else {
      onClose();
    }
  }

  function handleScroll(x: number) {
    const idx = Math.round(x / W);
    if (idx !== currentIndex) setCurrentIndex(idx);
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        {/* Pular */}
        <View style={s.topBar}>
          {currentIndex < SLIDES.length - 1 ? (
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={s.pular}>Pular</Text>
            </Pressable>
          ) : (
            <View />
          )}
        </View>

        {/* Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => handleScroll(e.nativeEvent.contentOffset.x)}
          style={s.pager}
          contentContainerStyle={s.pagerContent}
        >
          {SLIDES.map((key) => (
            <View key={key} style={s.slide}>
              {key === 'welcome' && <SlideWelcome />}
              {key === 'como' && <SlideComo />}
              {key === 'anotar' && <SlideAnotar />}
              {key === 'editar' && <SlideEditar />}
              {key === 'notif' && <SlideNotif />}
            </View>
          ))}
        </ScrollView>

        {/* Dots + botão */}
        <View style={s.footer}>
          <View style={s.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[s.dot, i === currentIndex && s.dotActive]} />
            ))}
          </View>
          <Pressable style={s.btn} onPress={avancar}>
            <Text style={s.btnTxt}>{currentIndex < SLIDES.length - 1 ? 'Próximo' : 'Começar'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function SlideWelcome() {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={s.slideInner}>
      <View style={[s.iconCircle, { backgroundColor: '#1e1040' }]}>
        <IconSparkle size={40} color="#a78bfa" />
      </View>
      <Text style={s.slideTitle}>
        {'Bem-vindo ao\n'}
        <Text style={s.accent}>Izi</Text>
        <Text style={s.white}>Contador</Text>
      </Text>
      <Text style={s.slideBody}>
        Divide os gastos da fatura Nubank automaticamente entre as pessoas da casa — sem planilha,
        sem conta manual.
      </Text>
    </View>
  );
}

function SlideComo() {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={s.slideInner}>
      <View style={[s.iconCircle, { backgroundColor: '#082f49' }]}>
        <IconCard size={40} color="#38bdf8" />
      </View>
      <Text style={s.slideTitle}>
        <Text style={s.white}>Como</Text>
        {' funciona'}
      </Text>
      <Text style={s.slideBody}>
        Conectamos ao seu Gmail, encontramos o CSV da fatura Nubank e importamos os gastos
        automaticamente.
      </Text>
      <View style={s.stepList}>
        <StepItem n="1" text="Faça login com sua conta Google" />
        <StepItem n="2" text="Puxe a tela para baixo para sincronizar" />
        <StepItem n="3" text="Os gastos aparecem divididos por pessoa" />
      </View>
      <View style={s.privacyBox}>
        <Text style={s.privacyTxt}>
          Nenhum dado sai do celular. Tudo fica armazenado localmente.
        </Text>
      </View>
    </View>
  );
}

function SlideAnotar() {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={s.slideInner}>
      <View style={[s.iconCircle, { backgroundColor: '#500724' }]}>
        <IconBook size={40} color="#fb7185" />
      </View>
      <Text style={s.slideTitle}>
        <Text style={s.white}>Como</Text>
        {' anotar'}
      </Text>
      <Text style={s.slideBody}>
        No app do Nubank, edite a descrição do gasto e adicione o nome da pessoa:
      </Text>
      <View style={s.exampleBox}>
        <ExampleRow input="RESTAURANTE - João" output="João paga tudo" />
        <View style={s.exDivider} />
        <ExampleRow input="NETFLIX (metade Maria)" output="Você e Maria dividem 50/50" />
        <View style={s.exDivider} />
        <ExampleRow input="MERCADO (menos 30 Pedro)" output="Pedro paga R$30, você o resto" />
      </View>
      <Text style={s.hint}>Ver todos os formatos em Menu ⋮ › Como anotar</Text>
    </View>
  );
}

function SlideEditar() {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={s.slideInner}>
      <View style={[s.iconCircle, { backgroundColor: '#052e16' }]}>
        <IconEdit size={40} color="#4ade80" />
      </View>
      <Text style={s.slideTitle}>
        <Text style={s.white}>Ajuste</Text>
        {' direto no app'}
      </Text>
      <Text style={s.slideBody}>
        Errou a divisão ou quer mudar alguma coisa depois? Não precisa editar nada no Nubank — toque
        no item.
      </Text>
      <View style={s.stepList}>
        <StepItem n="1" text="Toque num item pra reatribuir, renomear ou remover" />
        <StepItem n="2" text="Use 'Dividir compra' pra separar entre várias pessoas" />
        <StepItem n="3" text="Marque 'sempre atribuir' pra criar uma regra automática" />
      </View>
      <Text style={s.hint}>Veja tudo em Menu ⋮ › Edições deste mês</Text>
    </View>
  );
}

function SlideNotif() {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={s.slideInner}>
      <View style={[s.iconCircle, { backgroundColor: '#1a1a2e' }]}>
        <IconBell size={40} color="#818cf8" />
      </View>
      <Text style={s.slideTitle}>
        <Text style={s.white}>Nunca perca</Text>
        {' o fechamento'}
      </Text>
      <Text style={s.slideBody}>
        Configure o dia de fechamento da sua fatura e te avisamos 1 dia antes para sincronizar.
      </Text>
      <View style={s.notifBox}>
        <View style={s.notifHeader}>
          <Text style={s.notifApp}>IziContador</Text>
          <Text style={s.notifTime}>09:00</Text>
        </View>
        <Text style={s.notifTitle}>Ei! Sua fatura fecha amanhã</Text>
        <Text style={s.notifBody}>Bora organizar as contas?</Text>
      </View>
      <Text style={s.hint}>Ative em Menu ⋮ › Notificações</Text>
    </View>
  );
}

function StepItem({ n, text }: { n: string; text: string }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={s.stepItem}>
      <View style={s.stepNum}>
        <Text style={s.stepNumTxt}>{n}</Text>
      </View>
      <Text style={s.stepTxt}>{text}</Text>
    </View>
  );
}

function ExampleRow({ input, output }: { input: string; output: string }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={s.exRow}>
      <Text style={s.exInput}>{input}</Text>
      <Text style={s.exOutput}>{output}</Text>
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },

    topBar: {
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 4,
      alignItems: 'flex-end',
      minHeight: 44,
    },
    pular: { color: c.placeholder, fontSize: 14, fontWeight: '600' },

    pager: { flex: 1 },
    pagerContent: { alignItems: 'stretch' },

    slide: { width: W },
    slideInner: {
      flex: 1,
      paddingHorizontal: 28,
      paddingTop: 16,
      gap: 16,
    },

    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    slideTitle: {
      color: c.placeholder,
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: -0.5,
      lineHeight: 36,
    },
    accent: { color: c.accentLight },
    white: { color: c.textPrimary },
    slideBody: { color: c.textFaint, fontSize: 15, lineHeight: 24 },

    stepList: { gap: 10 },
    stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    stepNum: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: c.bgElevated2,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    stepNumTxt: { color: c.accent, fontSize: 12, fontWeight: '800' },
    stepTxt: { color: c.textMuted, fontSize: 14, lineHeight: 22, flex: 1 },

    privacyBox: {
      backgroundColor: c.bgElevated,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      padding: 12,
    },
    privacyTxt: { color: c.borderStrong, fontSize: 12, lineHeight: 18 },

    exampleBox: {
      backgroundColor: c.bgElevated,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
    },
    exRow: { padding: 14, gap: 4 },
    exInput: { color: c.textValue, fontSize: 13, fontWeight: '600', fontFamily: 'monospace' },
    exOutput: { color: c.success, fontSize: 11, fontWeight: '500' },
    exDivider: { height: 1, backgroundColor: c.border },

    hint: { color: c.borderStrong, fontSize: 12 },

    notifBox: {
      backgroundColor: c.bgElevated2,
      borderRadius: 14,
      padding: 14,
      gap: 4,
    },
    notifHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    notifApp: {
      color: c.textFaint,
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    notifTime: { color: c.placeholder, fontSize: 11 },
    notifTitle: { color: c.textPrimary, fontSize: 14, fontWeight: '700' },
    notifBody: { color: c.textMuted, fontSize: 13 },

    footer: {
      paddingHorizontal: 28,
      paddingBottom: 16,
      paddingTop: 12,
      gap: 20,
    },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.bgElevated2 },
    dotActive: { width: 20, backgroundColor: c.accent },
    btn: {
      backgroundColor: c.accent,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
    },
    btnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  });
}
