import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSparkle } from './icons/IconSparkle';
import { IconCard } from './icons/IconCard';
import { IconBook } from './icons/IconBook';
import { IconBell } from './icons/IconBell';

const { width: W } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

type SlideKey = 'welcome' | 'como' | 'anotar' | 'notif';

interface Slide {
  key: SlideKey;
}

const SLIDES: Slide[] = [
  { key: 'welcome' },
  { key: 'como' },
  { key: 'anotar' },
  { key: 'notif' },
];

export function OnboardingModal({ visible, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  function avancar() {
    if (currentIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      onClose();
    }
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
        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          renderItem={({ item }) => <SlideView slideKey={item.key} />}
          style={{ flexGrow: 0 }}
        />

        {/* Dots + botão */}
        <View style={s.footer}>
          <View style={s.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[s.dot, i === currentIndex && s.dotActive]} />
            ))}
          </View>
          <Pressable style={s.btn} onPress={avancar}>
            <Text style={s.btnTxt}>
              {currentIndex < SLIDES.length - 1 ? 'Próximo' : 'Começar'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function SlideView({ slideKey }: { slideKey: SlideKey }) {
  return (
    <View style={[s.slide, { width: W }]}>
      {slideKey === 'welcome' && <SlideWelcome />}
      {slideKey === 'como' && <SlideComo />}
      {slideKey === 'anotar' && <SlideAnotar />}
      {slideKey === 'notif' && <SlideNotif />}
    </View>
  );
}

function SlideWelcome() {
  return (
    <View style={s.slideInner}>
      <View style={[s.iconCircle, { backgroundColor: '#1e1040' }]}>
        <IconSparkle size={40} color="#a78bfa" />
      </View>
      <Text style={s.slideTitle}>
        Bem-vindo ao{'\n'}
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
  return (
    <View style={s.slideInner}>
      <View style={[s.iconCircle, { backgroundColor: '#082f49' }]}>
        <IconCard size={40} color="#38bdf8" />
      </View>
      <Text style={s.slideTitle}>
        <Text style={s.white}>Como</Text> funciona
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
        <Text style={s.privacyTxt}>Nenhum dado sai do celular. Tudo fica armazenado localmente.</Text>
      </View>
    </View>
  );
}

function SlideAnotar() {
  return (
    <View style={s.slideInner}>
      <View style={[s.iconCircle, { backgroundColor: '#500724' }]}>
        <IconBook size={40} color="#fb7185" />
      </View>
      <Text style={s.slideTitle}>
        <Text style={s.white}>Como</Text> anotar
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

function SlideNotif() {
  return (
    <View style={s.slideInner}>
      <View style={[s.iconCircle, { backgroundColor: '#1a1a2e' }]}>
        <IconBell size={40} color="#818cf8" />
      </View>
      <Text style={s.slideTitle}>
        <Text style={s.white}>Nunca perca</Text> o fechamento
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
  return (
    <View style={s.exRow}>
      <Text style={s.exInput}>{input}</Text>
      <Text style={s.exOutput}>{output}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },

  topBar: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'flex-end',
    minHeight: 44,
  },
  pular: { color: '#475569', fontSize: 14, fontWeight: '600' },

  slide: { flex: 1 },
  slideInner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 8,
    gap: 14,
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  slideTitle: {
    color: '#475569',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  accent: { color: '#a78bfa' },
  white: { color: '#f1f5f9' },
  slideBody: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 24,
  },

  // Steps
  stepList: { gap: 10, marginTop: 4 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumTxt: { color: '#7c3aed', fontSize: 12, fontWeight: '800' },
  stepTxt: { color: '#94a3b8', fontSize: 14, lineHeight: 22, flex: 1 },

  privacyBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    marginTop: 4,
  },
  privacyTxt: { color: '#334155', fontSize: 12, lineHeight: 18 },

  // Examples
  exampleBox: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
    marginTop: 2,
  },
  exRow: { padding: 14, gap: 4 },
  exInput: { color: '#e2e8f0', fontSize: 13, fontWeight: '600', fontFamily: 'monospace' },
  exOutput: { color: '#4ade80', fontSize: 11, fontWeight: '500' },
  exDivider: { height: 1, backgroundColor: '#1e293b' },

  hint: { color: '#334155', fontSize: 12, marginTop: 2 },

  // Notification preview
  notifBox: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    gap: 4,
    marginTop: 4,
  },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  notifApp: { color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  notifTime: { color: '#475569', fontSize: 11 },
  notifTitle: { color: '#f1f5f9', fontSize: 14, fontWeight: '700' },
  notifBody: { color: '#94a3b8', fontSize: 13 },

  // Footer
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 16,
    paddingTop: 12,
    gap: 20,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1e293b' },
  dotActive: { width: 20, backgroundColor: '#7c3aed' },
  btn: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
