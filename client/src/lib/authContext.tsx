import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/auth";
import { loginUser, registerUser, getMe, googleLoginUser } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "student" | "agency",
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // On mount: check localStorage for existing token
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      // Validate token and fetch user
      getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token invalid or expired — clear
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const data = await loginUser(email, password);
      // Drop any cached data from a previous user before switching identity.
      queryClient.clear();
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
    },
    [queryClient],
  );

  const loginWithGoogle = useCallback(
    async (credential: string): Promise<void> => {
      const data = await googleLoginUser(credential);
      queryClient.clear();
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
    },
    [queryClient],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: "student" | "agency",
    ): Promise<void> => {
      const data = await registerUser(name, email, password, role);
      // Drop any cached data from a previous user before switching identity.
      queryClient.clear();
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    // Clear cached queries so the next user (or re-login) starts with no stale data.
    queryClient.clear();
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, loginWithGoogle, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
