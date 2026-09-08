import { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Assinatura } from '../config/assinaturas';
import { PessoasContato } from '../config/pessoasContato';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { IconClose } from './icons/IconClose';
import { IconShare } from './icons/IconShare';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  assinaturas: Assinatura[];
  pessoas: string[];
  contatos: PessoasContato;
  pixKey: string;
  salvarAssinatura: (assinatura: Assinatura) => void;
  removerAssinatura: (nome: string) => void;
  salvarContato: (nome: string, email: string) => void;
}

interface ParticipanteForm {
  pessoa: string;
  email: string;
}

const PARTICIPANTE_VAZIO: ParticipanteForm = { pessoa: '', email: '' };

interface CobrancaPessoa {
  pessoa: string;
  email: string;
  itens: { nome: string; valor: number }[];
  total: number;
}

export function AssinaturasContent({
  assinaturas,
  pessoas,
  contatos,
  pixKey,
  salvarAssinatura,
  removerAssinatura,
  salvarContato,
}: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [nome, setNome] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [valorReferencia, setValorReferencia] = useState('');
  const [participantes, setParticipantes] = useState<ParticipanteForm[]>([PARTICIPANTE_VAZIO]);
  const [editandoOriginal, setEditandoOriginal] = useState<string | null>(null);
  const kbHeight = useKeyboardHeight();

  function resetForm() {
    setNome('');
    setKeywordInput('');
    setKeywords([]);
    setValorReferencia('');
    setParticipantes([PARTICIPANTE_VAZIO]);
    setEditandoOriginal(null);
  }

  function handleEditar(a: Assinatura) {
    setNome(a.nome);
    setKeywords(a.keywords);
    setValorReferencia(String(a.valorReferencia));
    setParticipantes(
      a.participantes.map((p) => ({ pessoa: p, email: contatos[p.trim().toUpperCase()] ?? '' })),
    );
    setEditandoOriginal(a.nome);
  }

  function handleAddKeyword() {
    const kw = keywordInput.trim().toUpperCase();
    if (!kw || keywords.includes(kw)) return;
    setKeywords((prev) => [...prev, kw]);
    setKeywordInput('');
  }

  function handleRemoveKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }

  function handleParticipanteChange(idx: number, campo: keyof ParticipanteForm, valor: string) {
    setParticipantes((prev) => prev.map((p, i) => (i === idx ? { ...p, [campo]: valor } : p)));
  }

  function handleAddParticipanteRapido(pessoa: string) {
    const email = contatos[pessoa.trim().toUpperCase()] ?? '';
    setParticipantes((prev) => {
      // se só tem uma linha vazia, preenche ela em vez de criar uma nova
      if (prev.length === 1 && !prev[0].pessoa && !prev[0].email) {
        return [{ pessoa, email }];
      }
      return [...prev, { pessoa, email }];
    });
  }

  function handleAddParticipanteRow() {
    setParticipantes((prev) => [...prev, PARTICIPANTE_VAZIO]);
  }

  function handleRemoveParticipanteRow(idx: number) {
    setParticipantes((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  }

  function handleSalvar() {
    const nm = nome.trim();
    if (!nm) return;

    if (keywords.length === 0) {
      Alert.alert('Assinatura incompleta', 'Adicione ao menos uma palavra-chave.');
      return;
    }

    const valor = parseFloat(valorReferencia.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      Alert.alert('Assinatura incompleta', 'Informe o valor de referência da assinatura.');
      return;
    }

    const validos = participantes
      .map((p) => ({ pessoa: p.pessoa.trim(), email: p.email.trim() }))
      .filter((p) => p.pessoa);

    if (validos.length === 0) {
      Alert.alert('Assinatura incompleta', 'Adicione ao menos uma pessoa.');
      return;
    }

    // renomeou a assinatura durante a edição — remove a entrada antiga
    if (editandoOriginal && editandoOriginal.toUpperCase() !== nm.toUpperCase()) {
      removerAssinatura(editandoOriginal);
    }

    salvarAssinatura({
      nome: nm,
      keywords,
      valorReferencia: valor,
      participantes: validos.map((p) => p.pessoa),
    });
    for (const p of validos) {
      if (p.email) salvarContato(p.pessoa, p.email);
    }
    resetForm();
  }

  function handleRemover(nm: string) {
    Alert.alert('Remover assinatura', `Remover a divisão automática de "${nm}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          if (editandoOriginal === nm) resetForm();
          removerAssinatura(nm);
        },
      },
    ]);
  }

  function handleEnviarCobranca(c: CobrancaPessoa) {
    if (!c.email) {
      Alert.alert('Sem e-mail cadastrado', `Cadastre o e-mail de ${c.pessoa} pra poder cobrar.`);
      return;
    }
    const linhas = c.itens.map((i) => `${i.nome} - R$ ${i.valor.toFixed(2)}`);
    linhas.push(`TOTAL = R$ ${c.total.toFixed(2)}`);
    if (pixKey) linhas.push(`Pix: ${pixKey}`);
    const url = `mailto:${c.email}?subject=${encodeURIComponent(
      'Cobrança de assinaturas',
    )}&body=${encodeURIComponent(linhas.join('\n'))}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Erro', 'Não foi possível abrir o app de e-mail.'),
    );
  }

  const nomesJaAdicionados = new Set(
    participantes.map((p) => p.pessoa.trim().toUpperCase()).filter(Boolean),
  );
  const pessoasRapidas = pessoas.filter((p) => !nomesJaAdicionados.has(p.trim().toUpperCase()));

  const cobrancas = useMemo(() => {
    const porPessoa = new Map<string, CobrancaPessoa>();
    for (const a of assinaturas) {
      if (a.participantes.length === 0) continue;
      const parte = a.valorReferencia / a.participantes.length;
      for (const p of a.participantes) {
        const key = p.trim().toUpperCase();
        if (!porPessoa.has(key)) {
          porPessoa.set(key, { pessoa: p, email: contatos[key] ?? '', itens: [], total: 0 });
        }
        const entry = porPessoa.get(key)!;
        entry.itens.push({ nome: a.nome, valor: parte });
        entry.total += parte;
      }
    }
    return [...porPessoa.values()];
  }, [assinaturas, contatos]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[s.scroll, kbHeight > 0 && { paddingBottom: kbHeight + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={s.hint}>
        Cadastre uma assinatura recorrente (ex.: Prime Video) com uma ou mais palavras-chave que a
        reconheçam na fatura, e quem divide ela com você. Todo mês o valor real da fatura é dividido
        igualmente entre os participantes automaticamente — sem precisar anotar nada. Uma anotação
        manual no título daquele mês sempre tem prioridade.
      </Text>

      {assinaturas.map((a) => (
        <TouchableOpacity
          key={a.nome}
          style={[s.card, editandoOriginal === a.nome && s.cardEditando]}
          onPress={() => handleEditar(a)}
          activeOpacity={0.8}
        >
          <View style={s.catHeader}>
            <Text style={s.catName}>{a.nome}</Text>
            <TouchableOpacity onPress={() => handleRemover(a.nome)} style={s.removeBtn}>
              <Text style={s.removeBtnText}>Remover</Text>
            </TouchableOpacity>
          </View>
          <View style={s.cardBody}>
            <Text style={s.keywordsHint}>Reconhece: {a.keywords.join(', ')}</Text>
            <Text style={s.valorRefText}>
              Referência: R$ {a.valorReferencia.toFixed(2)} · ~R${' '}
              {(a.valorReferencia / a.participantes.length).toFixed(2)} por pessoa
            </Text>
            <View style={s.chips}>
              {a.participantes.map((p) => (
                <View key={p} style={s.chip}>
                  <Text style={s.chipText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {assinaturas.length === 0 && <Text style={s.empty}>Nenhuma assinatura cadastrada.</Text>}

      <View style={[s.card, { marginTop: 8 }]}>
        <View style={s.formHeaderRow}>
          <Text style={s.newCatLabel}>
            {editandoOriginal ? 'Editando assinatura' : 'Nova assinatura'}
          </Text>
          {editandoOriginal && (
            <TouchableOpacity
              onPress={resetForm}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={s.cancelarEdicaoText}>Cancelar edição</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.cardBody}>
          <TextInput
            style={s.input}
            placeholder="Nome (ex: Prime Video)"
            placeholderTextColor={colors.placeholder}
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <View style={s.chips}>
            {keywords.map((kw) => (
              <TouchableOpacity key={kw} onPress={() => handleRemoveKeyword(kw)} style={s.chip}>
                <Text style={s.chipText}>{kw}</Text>
                <IconClose size={10} color={colors.textFaint} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.inputRow}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Palavra-chave (ex: AMAZONPRIMEBR)"
              placeholderTextColor={colors.placeholder}
              value={keywordInput}
              onChangeText={setKeywordInput}
              onSubmitEditing={handleAddKeyword}
              autoCapitalize="characters"
              returnKeyType="done"
            />
            <TouchableOpacity onPress={handleAddKeyword} style={s.addKeywordBtn}>
              <Text style={s.addKeywordBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={s.input}
            placeholder="Valor de referência (ex: 15,00)"
            placeholderTextColor={colors.placeholder}
            value={valorReferencia}
            onChangeText={setValorReferencia}
            keyboardType="decimal-pad"
          />

          {participantes.map((p, idx) => (
            <View key={idx} style={s.participanteRow}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Pessoa"
                placeholderTextColor={colors.placeholder}
                value={p.pessoa}
                onChangeText={(t) => handleParticipanteChange(idx, 'pessoa', t)}
                autoCapitalize="words"
              />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="E-mail (opcional)"
                placeholderTextColor={colors.placeholder}
                value={p.email}
                onChangeText={(t) => handleParticipanteChange(idx, 'email', t)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity
                onPress={() => handleRemoveParticipanteRow(idx)}
                style={s.removeParticipanteBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconClose size={12} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}

          {pessoasRapidas.length > 0 && (
            <View style={s.rapidasWrap}>
              <Text style={s.rapidasLabel}>Adicionar</Text>
              <View style={s.rapidasChips}>
                {pessoasRapidas.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={s.chipRapido}
                    onPress={() => handleAddParticipanteRapido(p)}
                  >
                    <Text style={s.chipRapidoText}>+ {p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity onPress={handleAddParticipanteRow} style={s.addParticipanteBtn}>
            <Text style={s.addParticipanteText}>+ Novo nome</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSalvar} style={s.saveBtn}>
            <Text style={s.saveBtnText}>
              {editandoOriginal ? 'Salvar alterações' : 'Salvar assinatura'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {cobrancas.length > 0 && (
        <View style={[s.card, { marginTop: 8 }]}>
          <View style={s.cardBody}>
            <Text style={s.newCatLabel}>Cobrar assinaturas</Text>
            <Text style={s.hint}>
              Baseado no valor de referência de cada assinatura, dividido igualmente. Abre um
              rascunho no seu app de e-mail pra cada pessoa — você confere e envia.
            </Text>
            {cobrancas.map((c) => (
              <View key={c.pessoa} style={s.cobrancaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cobrancaNome}>{c.pessoa}</Text>
                  <Text style={s.cobrancaDetalhe}>
                    {c.itens.map((i) => `${i.nome} R$${i.valor.toFixed(2)}`).join(' · ')}
                  </Text>
                  <Text style={s.cobrancaTotal}>Total: R$ {c.total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleEnviarCobranca(c)}
                  style={s.enviarBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <IconShare size={16} color={colors.accentLight} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    scroll: { padding: 16, paddingBottom: 40 },
    hint: { color: c.placeholder, fontSize: 12, lineHeight: 18, marginBottom: 20 },
    card: {
      backgroundColor: c.bgElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
      marginBottom: 12,
    },
    cardEditando: { borderColor: c.accent },
    catHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    catName: {
      color: c.accentLight,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    removeBtn: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: c.dangerSurface,
      borderWidth: 1,
      borderColor: c.dangerBorder,
    },
    removeBtnText: { color: c.danger, fontSize: 11, fontWeight: '700' },
    keywordsHint: { color: c.textFaint, fontSize: 11, fontWeight: '600' },
    valorRefText: { color: c.textSecondary, fontSize: 11, fontWeight: '700', marginTop: 4 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 14, paddingTop: 8 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.bgElevated2,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    chipText: { color: c.textSecondary, fontSize: 12, fontWeight: '700' },
    empty: { color: c.borderStrong, fontSize: 13, textAlign: 'center', marginVertical: 24 },
    formHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 14,
    },
    cancelarEdicaoText: { color: c.danger, fontSize: 11, fontWeight: '700' },
    cardBody: { padding: 14, gap: 10 },
    newCatLabel: {
      color: c.textFaint,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    input: {
      backgroundColor: c.bgElevated2,
      color: c.textPrimary,
      fontSize: 13,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    addKeywordBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addKeywordBtnText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 26 },
    participanteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    removeParticipanteBtn: { padding: 4 },
    rapidasWrap: { marginTop: 2, gap: 6 },
    rapidasLabel: {
      color: c.placeholder,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    rapidasChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chipRapido: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: c.accentSurface,
      borderWidth: 1,
      borderColor: c.accentSurfaceBorder,
    },
    // tom claro específico deste chip, sem token equivalente exato — mantido
    chipRapidoText: { color: '#c4b5fd', fontSize: 12, fontWeight: '700' },
    addParticipanteBtn: { paddingVertical: 8, alignItems: 'flex-start' },
    addParticipanteText: { color: c.accentLight, fontSize: 12, fontWeight: '700' },
    saveBtn: {
      backgroundColor: c.accent,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 4,
    },
    saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
    cobrancaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    cobrancaNome: {
      color: c.accentLight,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    cobrancaDetalhe: { color: c.textFaint, fontSize: 11, marginTop: 2 },
    cobrancaTotal: { color: c.textSecondary, fontSize: 12, fontWeight: '700', marginTop: 2 },
    enviarBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.accentSurface,
      borderWidth: 1,
      borderColor: c.accentSurfaceBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
