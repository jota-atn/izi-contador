import { useState, useCallback } from 'react';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
});

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

export function useGoogleAuth() {
  const [status, setStatus] = useState<AuthStatus>(() =>
    GoogleSignin.hasPreviousSignIn() ? 'authenticated' : 'unauthenticated'
  );

  const signIn = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      setStatus('authenticated');
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

  return { status, signIn, signOut, getAccessToken };
}
