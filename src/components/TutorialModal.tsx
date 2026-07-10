import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconClose } from './icons/IconClose';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface Regra {
  sintaxe: string;
  descricao: string;
  exemplo: string;
  resultado: string;
}

const REGRAS: Regra[] = [
  {
    sintaxe: '(metade NOME)',
    descricao: 'Divide o item 50/50 entre você e outra pessoa.',
    exemplo: 'RESTAURANTE (metade Sofia)',
    resultado: 'Você: R$50 · Sofia: R$50',
  },
  {
    sintaxe: 'ITEM - metade NOME',
    descricao: 'Mesma divisão 50/50, via sufixo.',
    exemplo: 'CINEMA - metade Ana',
    resultado: 'Você: R$40 · Ana: R$40',
  },
  {
    sintaxe: '(menos N NOME)',
    descricao: 'Separa um valor fixo para alguém; o restante fica com você.',
    exemplo: 'MERCADO (menos 30 Sofia)',
    resultado: 'Você: R$70 · Sofia: R$30',
  },
  {
    sintaxe: '(NOME=N NOME=N ...)',
    descricao:
      'Divide com valores explícitos. Se a soma for menor que o total, o item não é dividido e aparece no card de anotações inválidas.',
    exemplo: 'JANTAR (João=60 Sofia=40)',
    resultado: 'João: R$60 · Sofia: R$40',
  },
  {
    sintaxe: 'ITEM - NOME',
    descricao: 'Atribui o item inteiro a outra pessoa pelo sufixo.',
    exemplo: 'AMAZON - Pedro',
    resultado: 'Pedro: R$90',
  },
];

export function TutorialModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Como anotar</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconClose size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.intro}>
            Adicione anotações no título dos itens no extrato do Nubank para dividir gastos
            automaticamente.
          </Text>

          {REGRAS.map((r, i) => (
            <View key={i} style={s.card}>
              <View style={s.sintaxeRow}>
                <Text style={s.sintaxe}>{r.sintaxe}</Text>
              </View>
              <Text style={s.descricao}>{r.descricao}</Text>
              <View style={s.exemploBg}>
                <Text style={s.exemploLabel}>EXEMPLO</Text>
                <Text style={s.exemploTexto}>{r.exemplo}</Text>
                <View style={s.divider} />
                <Text style={s.resultadoTexto}>{r.resultado}</Text>
              </View>
            </View>
          ))}

          <View style={s.dica}>
            <Text style={s.dicaTitle}>Dicas</Text>
            <Text style={s.dicaItem}>
              • Nomes são normalizados: acentos ignorados, maiúsculas/minúsculas indiferentes.
            </Text>
            <Text style={s.dicaItem}>
              • Sufixo de nome tem prioridade máxima. Sem sufixo, vale a regra de alocação. Sem
              sufixo e sem regra, o item cai em &ldquo;Não identificados&rdquo; — mesmo que bata
              com uma categoria (ex.: &ldquo;Netflix&rdquo; ou &ldquo;Almoço&rdquo; sozinhos não
              são mais atribuídos a você automaticamente).
            </Text>
            <Text style={s.dicaItem}>
              • O separador no split múltiplo pode ser vírgula ou espaço.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: { color: '#fff', fontSize: 17, fontWeight: '800' },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 12 },
  intro: { color: '#64748b', fontSize: 13, lineHeight: 20, marginBottom: 4 },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  sintaxeRow: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sintaxe: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 0.2,
  },
  descricao: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  exemploBg: {
    backgroundColor: '#020617',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  exemploLabel: {
    color: '#334155',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  exemploTexto: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  divider: { height: 1, backgroundColor: '#1e293b' },
  resultadoTexto: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  dica: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    gap: 8,
    marginTop: 4,
  },
  dicaTitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  dicaItem: { color: '#475569', fontSize: 12, lineHeight: 18 },
});
