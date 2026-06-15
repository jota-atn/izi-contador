import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gasto, RelatorioPessoa } from '../types';
import { formatMesAnoUpper } from '../utils/meses';
import { IconShare } from './icons/IconShare';
import { IconChevron } from './icons/IconChevron';
import { IconCheck } from './icons/IconCheck';

interface Props {
  pessoa: RelatorioPessoa;
  mes: string;
  isMesAtual: boolean;
  oculto: boolean;
  pago: boolean;
  onToggleOculto: () => void;
  onTogglePago: () => void;
}

function formatItemShare(item: Gasto): string {
  const parcelaMatch = / - (\d+\/\d+)$/.exec(item.descricao);
  if (parcelaMatch) {
    const base = item.descricao.slice(0, parcelaMatch.index);
    return `- ${base} - ${item.valor.toFixed(2)} - ${parcelaMatch[1]}`;
  }
  return `- ${item.descricao} - ${item.valor.toFixed(2)}`;
}

async function compartilharPessoa(pessoa: RelatorioPessoa, mes: string) {
  const itens = pessoa.itens.map(formatItemShare).join('\n');
  const texto = [
    `*FATURA ${formatMesAnoUpper(mes)}*`,
    `*${pessoa.dono}*`,
    itens,
    '————————',
    `*TOTAL = R$${pessoa.total_individual.toFixed(2)}*`,
  ].join('\n');
  await Share.share({ message: texto });
}

export function PersonCard({ pessoa, mes, isMesAtual, oculto, pago, onToggleOculto, onTogglePago }: Props) {
  const accentColor = pago ? '#4ade80' : '#7c3aed';
  const expanded = !oculto;

  return (
    <View style={[s.card, pago && s.cardPago]}>
      <View style={s.header}>
        <View style={s.left}>
          <View style={[s.bar, { backgroundColor: accentColor }]} />
          <Text style={s.name}>{pessoa.dono}</Text>
        </View>

        <View style={s.right}>
          <Text style={[s.total, pago && s.totalPago]}>
            R$ {pessoa.total_individual.toFixed(2)}
          </Text>

          <TouchableOpacity onPress={onTogglePago} style={[s.iconBtn, pago && s.iconBtnPago]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <IconCheck size={12} color={pago ? '#4ade80' : '#334155'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => compartilharPessoa(pessoa, mes)} style={s.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <IconShare size={13} color="#a78bfa" />
          </TouchableOpacity>

          {isMesAtual && (
            <TouchableOpacity onPress={onToggleOculto} style={s.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <IconChevron size={14} color="#475569" up={expanded} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {expanded && (
        <View style={s.body}>
          {pessoa.itens.map((item, idx) => (
            <View key={idx} style={s.row}>
              <View style={s.descCol}>
                <Text style={s.desc}>{item.descricao}</Text>
                <Text style={s.date}>{item.data}</Text>
              </View>
              <View style={s.badge}>
                <Text style={s.badgeText}>R$ {item.valor.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  cardPago: { borderColor: '#14532d' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#1e293b40',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  bar: { width: 6, height: 20, borderRadius: 3 },
  name: { color: '#fff', fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.3 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  total: { color: '#a78bfa', fontFamily: 'monospace', fontWeight: '700', fontSize: 16, marginRight: 4 },
  totalPago: { color: '#4ade80' },
  iconBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  iconBtnPago: { backgroundColor: '#052e16', borderWidth: 1, borderColor: '#14532d' },
  body: { paddingHorizontal: 24, paddingVertical: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  descCol: { flex: 1, marginRight: 16 },
  desc: { color: '#cbd5e1', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  date: { color: '#475569', fontSize: 10, marginTop: 2 },
  badge: { backgroundColor: '#1e293b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#94a3b8', fontFamily: 'monospace', fontSize: 11, fontWeight: '700' },
});
