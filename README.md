# IziContador

App mobile que lê o extrato da fatura Nubank via Gmail e exibe um relatório de gastos por pessoa — sem backend, direto do celular.

## Como funciona

1. Login com Google (OAuth, escopo `gmail.readonly`)
2. Busca o e-mail mais recente com extrato Nubank na caixa de entrada
3. Baixa o anexo CSV da fatura
4. Parseia e exibe os gastos agrupados por pessoa, com gráfico de pizza e total individual

## Stack

- **React Native** 0.85 + **Expo** SDK 56
- **NativeWind** (Tailwind CSS para RN) + tema escuro fixo
- **@react-native-google-signin/google-signin** v16 — autenticação
- **Gmail API** — busca e download do extrato diretamente no cliente
- **papaparse** — parse do CSV da fatura
- **react-native-svg** + **react-native-chart-kit** — gráfico de pizza

## Pré-requisitos

- Node.js 18+
- Android SDK com NDK 27.1 e CMake 3.22 (para build local)
- Conta Google com e-mails de extrato Nubank

## Variáveis de ambiente

Crie um `.env` na raiz com:

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<web_application_client_id>
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=<client_secret>
EXPO_PUBLIC_ANDROID_CLIENT_ID=<android_client_id>
```

Os client IDs são gerados no [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials:

| Variável | Tipo do cliente OAuth |
|---|---|
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | **Web application** (obrigatório para `webClientId`) |
| `EXPO_PUBLIC_ANDROID_CLIENT_ID` | Android (package `com.jota_atn.mobile` + SHA-1 do keystore) |

## Rodando localmente (Android)

```bash
npm install        # também roda o postinstall automaticamente
npx expo start     # inicia o Metro Bundler
```

Em outro terminal (com dispositivo USB conectado e depuração ativada):

```bash
npm run android                  # build + install no dispositivo
adb reverse tcp:8081 tcp:8081   # conecta o dispositivo ao Metro
```

> **Nota sobre o build local:** vários pacotes npm desta stack (react-native-reanimated, react-native-svg, react-native-gesture-handler) omitem arquivos da extração padrão do npm. O script `scripts/postinstall.js` restaura automaticamente esses arquivos dos tarballs oficiais após o `npm install`.

### SHA-1 do keystore de debug

Para o Google Sign-In funcionar no build local, o SHA-1 do `android/app/debug.keystore` precisa estar registrado no Google Cloud Console como um cliente Android:

```bash
keytool -list -v \
  -keystore android/app/debug.keystore \
  -alias androiddebugkey \
  -storepass android -keypass android
```

## Build EAS (nuvem)

```bash
eas build --profile preview --platform android
```

O perfil `preview` gera um APK interno. As variáveis de ambiente precisam estar configuradas no painel EAS (eas.expo.dev → projeto → Environment Variables).

## Estrutura

```
src/
  auth/
    useGoogleAuth.ts     # hook de autenticação Google
  components/
    LoginScreen.tsx
    PersonCard.tsx       # card de gastos por pessoa
    PieChartCard.tsx     # gráfico de pizza
    TotalCard.tsx        # total geral da fatura
    LoadingScreen.tsx
    ErrorScreen.tsx
  types.ts
scripts/
  postinstall.js         # restaura arquivos npm faltantes pós-install
```

## Status

Em desenvolvimento. O fluxo principal (login → busca → relatório) está funcionando. Visual e UX em progresso.
