import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { StoredTokens } from '../types';
import { loadTokens, saveTokens, clearTokens } from './tokenStorage';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET ?? '';

const ACTIVE_CLIENT_ID = Platform.OS === 'android' ? ANDROID_CLIENT_ID : CLIENT_ID;
const ACTIVE_SECRET = Platform.OS === 'android' ? '' : CLIENT_SECRET;

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

export function useGoogleAuth() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const tokensRef = useRef<StoredTokens | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  });

  useEffect(() => {
    loadTokens().then((saved) => {
      tokensRef.current = saved;
      setStatus(saved ? 'authenticated' : 'unauthenticated');
    });
  }, []);

  useEffect(() => {
    if (response?.type !== 'success') return;
    const auth = response.authentication;
    if (!auth) return;

    const tokens: StoredTokens = {
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken ?? null,
      expiresAt: Date.now() + (auth.expiresIn ?? 3600) * 1000,
    };

    saveTokens(tokens);
    tokensRef.current = tokens;
    setStatus('authenticated');
  }, [response]);

  const signIn = useCallback(() => promptAsync(), [promptAsync]);

  const signOut = useCallback(async () => {
    await clearTokens();
    tokensRef.current = null;
    setStatus('unauthenticated');
  }, []);

  // Retorna um access token sempre válido, renovando silenciosamente se necessário.
  // Retorna null se não conseguir renovar (usuário precisa refazer login).
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const tokens = tokensRef.current;
    if (!tokens) return null;

    const isExpired = Date.now() >= tokens.expiresAt - 60_000;
    if (!isExpired) return tokens.accessToken;

    if (!tokens.refreshToken || (!ACTIVE_SECRET && Platform.OS !== 'android')) return null;

    try {
      const params: Record<string, string> = {
        client_id: ACTIVE_CLIENT_ID,
        refresh_token: tokens.refreshToken,
        grant_type: 'refresh_token',
      };
      if (ACTIVE_SECRET) params.client_secret = ACTIVE_SECRET;

      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params).toString(),
      });

      const data = await res.json();
      if (!data.access_token) return null;

      const updated: StoredTokens = {
        ...tokens,
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
      };

      await saveTokens(updated);
      tokensRef.current = updated;
      return updated.accessToken;
    } catch {
      return null;
    }
  }, []);

  return { status, signIn, signOut, getAccessToken, request };
}
