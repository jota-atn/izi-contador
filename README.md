# IziContador

App mobile que lê o extrato da fatura Nubank via Gmail e divide os gastos por pessoa — sem backend, direto do celular.

## Como funciona

1. Login com Google (OAuth, escopo `gmail.readonly`)
2. Busca o e-mail mais recente com extrato Nubank na caixa de entrada
3. Baixa o anexo CSV da fatura
4. Parseia e exibe os gastos agrupados por pessoa, com gráfico de pizza e total individual

### Sintaxe de anotação no Nubank

Para dividir gastos, edite a descrição da compra diretamente no app do Nubank:

| Sintaxe | Resultado |
|---|---|
| `Compra - Maria` | 100% para Maria |
| `Compra (metade Maria)` | 50% para você, 50% para Maria |
| `Compra (menos 30 Maria)` | R$ 30 para Maria, restante para você |
| `Compra (Joao=40, Maria=20)` | R$ 40 para João, R$ 20 para Maria |

## Stack

- **React Native** 0.85 + **Expo** SDK 56
- **@react-native-google-signin/google-signin** v16 — autenticação Google
- **Gmail API** — busca e download do extrato diretamente no cliente
- **papaparse** — parse do CSV da fatura
- **expo-sqlite** — histórico de faturas e estado pago/oculto
- **expo-secure-store** — categorias e regras de alocação
- **react-native-svg** + **react-native-chart-kit** — gráfico de pizza
- **NativeWind** (Tailwind CSS para RN) + tema escuro fixo

## Funcionalidades

- Relatório por pessoa com total individual
- Gráfico de pizza com divisão de gastos
- **Categorias** configuráveis (TRANSPORTE, ALMOÇO, STREAMING…)
- **Regras de alocação** — mapeia palavra-chave para pessoa (ex: `MERCADO → João`)
- **Histórico de faturas** — navega entre meses anteriores com `←` / `→`
- **Comparativo mensal** — mostra se você gastou mais ou menos que o mês anterior
- **Marcar como pago** — controle de quem já acertou a parte dele
- **Ocultar card** — colapsa o card de uma pessoa no mês atual
- Card de **"Não identificados"** — gastos que não foram categorizados nem alocados
- Compartilhamento por pessoa (formato WhatsApp com markdown)
- Pull-to-refresh para recarregar a fatura

## Variáveis de ambiente

Crie um `.env` na raiz com:

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<web_application_client_id>
```

O client ID é gerado no [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials. Deve ser do tipo **Web application** (não Android nem Desktop).

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

As variáveis de ambiente precisam estar configuradas no painel EAS (eas.expo.dev → projeto → Environment Variables).

## Estrutura

```
src/
  auth/
    useGoogleAuth.ts          # hook de autenticação Google
  components/
    HeaderMenu.tsx            # menu dropdown ☰
    PersonCard.tsx            # card de gastos por pessoa
    SemCategoriaCard.tsx      # itens não identificados
    PieChartCard.tsx          # gráfico de pizza
    TotalCard.tsx             # total geral + comparativo mensal
    MonthSelector.tsx         # navegação entre meses
    CategoriasModal.tsx       # CRUD de categorias
    RegrasModal.tsx           # CRUD de regras de alocação
    icons/                    # ícones SVG nativos
  config/
    categorias.ts             # categorias padrão + SecureStore
    regrasAlocacao.ts         # regras padrão + SecureStore
  gmail/
    gmailApi.ts               # busca e download do extrato
  hooks/
    useRelatorio.ts           # fetch + parse da fatura
    useHistorico.ts           # histórico de faturas
    useEstadoFatura.ts        # estado pago/oculto por pessoa
    useCategorias.ts          # CRUD de categorias
    useRegrasAlocacao.ts      # CRUD de regras de alocação
  parser/
    parseFatura.ts            # parse do CSV com divisão por pessoa
  storage/
    db.ts                     # singleton SQLite
    historico.ts              # CRUD de faturas no SQLite
    estadoFatura.ts           # CRUD de estado no SQLite
  types/
    index.ts                  # tipos compartilhados
  utils/
    meses.ts                  # helpers de formatação de mês
scripts/
  postinstall.js              # restaura arquivos npm faltantes pós-install
```
