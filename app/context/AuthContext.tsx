import * as React from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => void;
  signUp: (name: string, email: string, password: string) => void;
  signOut: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_KEY = 'auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Mock sign in - always succeeds
  const signIn = React.useCallback((email: string, _password: string) => {
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
    };
    setUser(mockUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
  }, []);

  // Mock sign up - always succeeds
  const signUp = React.useCallback((name: string, email: string, _password: string) => {
    const mockUser: User = {
      id: '1',
      email,
      name,
    };
    setUser(mockUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
  }, []);

  const signOut = React.useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
    }),
    [user, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
