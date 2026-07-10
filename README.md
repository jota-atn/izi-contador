# IziContador

App mobile que lê o extrato da fatura Nubank via Gmail e divide os gastos por pessoa — sem backend, direto do celular.

## Como funciona

1. Login com Google (OAuth, escopo `gmail.readonly`)
2. Busca o e-mail mais recente com extrato Nubank na caixa de entrada
3. Baixa o anexo CSV da fatura
4. Parseia e exibe os gastos agrupados por pessoa, com gráfico de pizza e total individual
5. Fica salvo no SQLite local — dá pra navegar entre os meses anteriores mesmo offline

### Sintaxe de anotação no Nubank

Para dividir gastos, edite a descrição da compra diretamente no app do Nubank:

| Sintaxe                      | Resultado                            |
| ----------------------------- | ------------------------------------- |
| `Compra - Maria`              | 100% para Maria                       |
| `Compra (metade Maria)`       | 50% para você, 50% para Maria         |
| `Compra - metade Maria`       | 50% para você, 50% para Maria (via traço) |
| `Compra (menos 30 Maria)`     | R$ 30 para Maria, restante para você  |
| `Compra - menos 30 Maria`     | R$ 30 para Maria, restante para você (via traço) |
| `Compra (Joao=40 Maria=20)`   | R$ 40 para João, R$ 20 para Maria     |

Prioridade de decisão de dono: **sufixo de nome** > **regra de alocação** > **categoria sem dono/regra** (vai para "Não identificados"). Um item que bate com uma categoria (ex.: "Almoço", "Streaming") mas não tem sufixo nem regra configurada **não é assumido como seu** — fica em "Não identificados" até ser alocado manualmente.

### Assinaturas recorrentes

Em vez de anotar a mesma divisão todo mês (ex.: Netflix dividido com as mesmas pessoas), cadastra-se uma vez em **Assinaturas** (menu ☰): palavra-chave + participantes com valor fixo cada. O valor real da fatura daquele mês já entra dividido automaticamente. Uma anotação manual no título naquele mês continua tendo prioridade sobre a divisão configurada.

## Stack

- **React Native** 0.85 + **Expo** SDK 56
- **@react-native-google-signin/google-signin** — autenticação Google
- **Gmail API** — busca e download do extrato diretamente no cliente
- **papaparse** — parse do CSV da fatura
- **expo-sqlite** — histórico de faturas, edições/alocações manuais, estado pago/oculto, histórico de chat do IziBot
- **expo-secure-store** — categorias, regras de alocação, assinaturas, chave Pix, preferências
- **expo-notifications** — lembrete mensal de fechamento de fatura
- **expo-print** + **expo-sharing** — exportação de relatório mensal em PDF
- **react-native-svg** + **react-native-chart-kit** — gráfico de pizza e evolução por pessoa (IziStats)
- **react-native-qrcode-svg** — QR Code Pix por pessoa
- **react-native-reanimated** + **react-native-gesture-handler** — animações e swipe-to-pay
- **Gemini API** (`gemini-2.5-flash`, via REST/SSE direto, sem SDK) — IziBot, assistente de análise da fatura
- **NativeWind** (Tailwind CSS para RN) + tema escuro fixo — só em telas de layout simples; layout com `gap`/precisão fina usa `StyleSheet` nativo

## Funcionalidades

- Relatório por pessoa com total individual, navegação entre meses (`←` / `→`)
- Gráfico de pizza (mês atual) e gráfico de evolução multi-linha por pessoa (**IziStats**)
- **Categorias** configuráveis (Transporte, Almoço, Necessidades, Streaming…)
- **Regras de alocação** — mapeia palavra-chave para pessoa (ex.: `MERCADO → João`)
- **Assinaturas recorrentes** — divide automaticamente uma cobrança fixa (ex.: Netflix) entre participantes configurados
- **Editar/realocar item** — toca em qualquer compra (inclusive em "Não identificados") pra trocar o dono, renomear ou deletar
- Card de **"Não identificados"** — gastos que não foram categorizados nem alocados a ninguém
- Card de **anotações inválidas** — avisa quando uma anotação de split não fecha a conta
- **Marcar como pago** (swipe) e **ocultar card** — controle de quem já acertou a parte dele
- **Comparativo mensal** — mostra se você gastou mais ou menos que o mês anterior
- **Busca** — filtra pessoas/itens pelo nome ou descrição
- **QR Code Pix** por pessoa e compartilhamento por pessoa (formato WhatsApp com markdown)
- **Exportar PDF** do relatório mensal
- **Notificação mensal** de lembrete de fechamento de fatura
- **IziBot** — chat com IA (Gemini) que analisa a fatura e sugere ações, com chips de sugestão persistidos
- **Onboarding guiado** na primeira abertura + tela "Como anotar" com a sintaxe de divisão
- Pull-to-refresh para recarregar a fatura

## Variáveis de ambiente

Crie um `.env` na raiz com:

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<web_application_client_id>
EXPO_PUBLIC_GEMINI_API_KEY=<gemini_api_key>
```

- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` é gerado no [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials. Deve ser do tipo **Web application** (não Android nem Desktop).
- `EXPO_PUBLIC_GEMINI_API_KEY` é gerado no [Google AI Studio](https://aistudio.google.com/apikey), usado pelo IziBot.

Além disso, o build Android depende de um `google-services.json` na raiz (Firebase, usado pelo Google Sign-In / notificações).

Para builds via EAS, as mesmas variáveis precisam estar configuradas no painel (eas.expo.dev → projeto → Environment Variables).

## Rodando

### Desenvolvimento (recomendado)

```bash
npm install
npx expo start
```

Use um **EAS Development Build** no celular para ter todos os módulos nativos com hot reload:

```bash
npx eas-cli build --profile development --platform android
```

Instale o APK gerado no celular. A partir daí, `npx expo start` conecta automaticamente.

### Build de preview (APK interno)

```bash
npx eas-cli build --profile preview --platform android
```

### Testes, lint e typecheck

```bash
npm test
npm run lint
npm run typecheck
```

## Estrutura

```
src/
  auth/
    useGoogleAuth.ts          # hook de autenticação Google
  components/
    HeaderMenu.tsx            # menu dropdown ☰
    PersonCard.tsx             # card de gastos por pessoa (swipe-to-pay, editar item, QR Pix)
    SemCategoriaCard.tsx       # itens não identificados (alocáveis)
    AnotacoesInvalidasCard.tsx # avisos de split que não fecha a conta
    PieChartCard.tsx           # gráfico de pizza
    TotalCard.tsx              # total geral + comparativo mensal + ações (pagar, PDF)
    MonthSelector.tsx          # navegação entre meses
    SearchBar.tsx              # busca de pessoas/itens
    EditarItemModal.tsx        # editar dono/descrição ou deletar um item
    CategoriasModal.tsx        # CRUD de categorias
    RegrasModal.tsx            # CRUD de regras de alocação
    AssinaturasModal.tsx       # CRUD de assinaturas recorrentes
    PixKeyModal.tsx            # cadastro da chave Pix
    QRCodeModal.tsx            # QR Code Pix por pessoa
    ModalNotificacoes.tsx      # configurar lembrete de fechamento
    OnboardingModal.tsx        # apresentação guiada na primeira vez
    TutorialModal.tsx          # tela "Como anotar"
    icons/                     # ícones SVG nativos (react-native-svg)
  config/
    categorias.ts              # categorias padrão + SecureStore
    regrasAlocacao.ts          # regras padrão + SecureStore
    assinaturas.ts             # assinaturas recorrentes + SecureStore
  gmail/
    gmailApi.ts                # busca e download do extrato
  hooks/
    useRelatorio.ts             # fetch + parse da fatura
    useHistorico.ts             # histórico de faturas (SQLite)
    useEdicoesFatura.ts         # edições/alocações manuais por item (SQLite)
    useEstadoFatura.ts          # estado pago/oculto por pessoa (SQLite)
    useCategorias.ts            # CRUD de categorias
    useRegrasAlocacao.ts        # CRUD de regras de alocação
    useAssinaturas.ts           # CRUD de assinaturas recorrentes
    usePixKey.ts                # chave Pix do usuário
    useNotificacoes.ts          # agendamento do lembrete mensal
    useOnboarding.ts            # controla exibição do onboarding
  parser/
    parseFatura.ts              # parse do CSV: split, categorias, regras, assinaturas
  screens/
    EstatsScreen.tsx             # IziStats — evolução de gastos por pessoa
    IziBotScreen.tsx             # chat com o IziBot (Gemini)
  services/
    geminiApi.ts                 # streaming SSE direto na API do Gemini
  storage/
    db.ts                        # migração/singleton SQLite
    historico.ts                 # CRUD de faturas no SQLite
    edicoesFatura.ts             # CRUD de edições/alocações manuais no SQLite
    estadoFatura.ts              # CRUD de estado pago/oculto no SQLite
    chatHistory.ts                # histórico de mensagens do IziBot no SQLite
  types/
    index.ts                     # tipos compartilhados
  utils/
    aplicarEdicoes.ts             # aplica edições manuais sobre o relatório parseado
    busca.ts                      # filtro de pessoas/itens
    exportarPdf.ts / gerarPdfHtml.ts  # exportação do relatório em PDF
    hashFatura.ts                 # hash pra detectar mudança na fatura sincronizada
    meses.ts                      # helpers de formatação de mês
    pixPayload.ts                 # payload BR Code do QR Pix
    serializarHistorico.ts        # serialização do histórico pro IziBot
    haptic.ts                     # feedback tátil
scripts/
  postinstall.js                 # restaura arquivos npm faltantes pós-install
```
