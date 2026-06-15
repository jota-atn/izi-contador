import { useState, useCallback } from 'react';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
});

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

export function useGoogleAuth() {
  const [status, setStatus] = useState<AuthStatus>(() =>
    GoogleSignin.hasPreviousSignIn() ? 'authenticated' : 'unauthenticated'
  );
  const [userName, setUserName] = useState<string>(() => {
    const u = GoogleSignin.getCurrentUser();
    return u?.user.givenName ?? u?.user.name?.split(' ')[0] ?? 'Eu';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return GoogleSignin.getCurrentUser()?.user.email ?? '';
  });

  const signIn = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      if (result.type === 'success') {
        const given = result.data.user.givenName ?? result.data.user.name?.split(' ')[0] ?? 'Eu';
        setUserName(given);
        setUserEmail(result.data.user.email ?? '');
        setStatus('authenticated');
      }
    } catch (error) {
      if (isErrorWithCode(error) && error.code !== statusCodes.SIGN_IN_CANCELLED) {
        console.error('[GoogleSignin] signIn error:', error);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('[GoogleSignin] signOut error:', error);
    }
    setStatus('unauthenticated');
    setUserName('Eu');
    setUserEmail('');
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const { accessToken } = await GoogleSignin.getTokens();
      return accessToken;
    } catch {
      try {
        await GoogleSignin.signInSilently();
        const { accessToken } = await GoogleSignin.getTokens();
        return accessToken;
      } catch {
        setStatus('unauthenticated');
        return null;
      }
    }
  }, []);

  return { status, userName, userEmail, signIn, signOut, getAccessToken };
}
