import * as React from "react";
import {
  login as apiLogin,
  register as apiRegister,
} from "~/api/generated";
import type { User } from "~/api/generated";

export type { User };

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signOut: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_KEY = "auth_user";
const TOKEN_STORAGE_KEY = "auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  // Restore user from localStorage after hydration (client-only)
  React.useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // Invalid stored data, ignore
      }
    }
    setIsAuthLoading(false);
  }, []);

  const signIn = React.useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const res = await apiLogin({ email, password });

      if (res.status !== 200) {
        return res.data.message;
      }

      const authedUser = res.data.user;
      setUser(authedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authedUser));
      localStorage.setItem(TOKEN_STORAGE_KEY, res.data.accessToken);
      return null;
    },
    [],
  );

  const signUp = React.useCallback(
    async (name: string, email: string, password: string): Promise<string | null> => {
      const res = await apiRegister({ email, password, name });

      if (res.status !== 201) {
        return res.data.message;
      }

      const authedUser = res.data.user;
      setUser(authedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authedUser));
      localStorage.setItem(TOKEN_STORAGE_KEY, res.data.accessToken);
      return null;
    },
    [],
  );

  const signOut = React.useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAuthLoading,
      signIn,
      signUp,
      signOut,
    }),
    [user, isAuthLoading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
