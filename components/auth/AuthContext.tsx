'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isPhoneVerified: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setPhoneVerified: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isPhoneVerified: false,
  signInWithGoogle: async () => {},
  logout: async () => {},
  setPhoneVerified: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        // Only set auth cookie if user is both authenticated and phone verified
        if (isPhoneVerified) {
          document.cookie = 'auth=true; path=/';
          router.push('/');
        } else {
          document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          router.push('/login');
        }
      } else {
        // Remove the cookie when user is not authenticated
        document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        setIsPhoneVerified(false);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [isPhoneVerified]);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        // Don't redirect here, let the phone verification handle it
        setIsPhoneVerified(false);
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      setError(error.message || 'Failed to sign in with Google');
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      router.push('/login');
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError(error.message || 'Failed to sign out');
    }
  };

  const setPhoneVerified = (value: boolean) => {
    setIsPhoneVerified(value);
    if (value && user) {
      document.cookie = 'auth=true; path=/';
      router.push('/');
    } else {
      document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        isPhoneVerified,
        signInWithGoogle, 
        logout,
        setPhoneVerified
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
