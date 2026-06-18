import { StyleSheet, Text, View } from 'react-native';
import { IconSparkle } from '../components/icons/IconSparkle';

export function IziBotScreen() {
  return (
    <View style={s.container}>
      <View style={s.iconWrap}>
        <IconSparkle size={36} color="#7c3aed" />
      </View>

      <Text style={s.title}>
        Izi<Text style={s.titleAccent}>Bot</Text>
      </Text>

      <Text style={s.desc}>
        Seu assistente de IA para analisar gastos, identificar padrões e te ajudar a economizar —
        direto nas suas faturas.
      </Text>

      <View style={s.badge}>
        <Text style={s.badgeText}>Em desenvolvimento</Text>
      </View>

      <View style={s.featureList}>
        {[
          'Análise automática dos seus hábitos de consumo',
          'Alertas sobre gastos incomuns',
          'Sugestões personalizadas de economia',
          'Chat com IA para tirar dúvidas sobre seus gastos',
        ].map((item) => (
          <View key={item} style={s.featureRow}>
            <View style={s.bullet} />
            <Text style={s.featureText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  iconWrap: {
    backgroundColor: '#1e0a3c',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3b0764',
  },
  title: {
    color: '#f1f5f9',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  titleAccent: { color: '#7c3aed' },
  desc: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#1e0a3c',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b0764',
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 28,
  },
  badgeText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featureList: { alignSelf: 'stretch', gap: 12 },
  featureRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3b0764', marginTop: 6 },
  featureText: { color: '#475569', fontSize: 13, flex: 1, lineHeight: 20 },
});
