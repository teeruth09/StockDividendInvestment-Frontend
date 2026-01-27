// contexts/AuthContext.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LoginDto, RegisterDto, User } from '@/types/user';
import { loginApi, registerApi } from '@/lib/api/auth';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation'

interface JwtPayload {
  sub: string;
  username: string;
  exp: number; // expiry time (timestamp)
}

interface AuthContextType {
  user: User | null; //ตอนนี้ส่งแค่ username
  token: string | null;
  register: (credentials: RegisterDto) => Promise<void>;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()

  const login = async (credentials: LoginDto) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { accessToken } = await loginApi(credentials);
      localStorage.setItem('x-access-token', accessToken);
      setToken(accessToken); // หรือ jwtDecode(access_token)
      const userInfo = decodeToken(accessToken);
      if (userInfo) setUser(userInfo);
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
      else {
        setError("เข้าสู่ระบบไม่สำเร็จ");
      }
      throw err; // ส่งต่อ error ให้ component จัดการ
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterDto) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { accessToken } = await registerApi(credentials);
      localStorage.setItem('x-access-token', accessToken);
      setToken(accessToken); // หรือ jwtDecode(access_token)
      const userInfo = decodeToken(accessToken);
      if (userInfo) setUser(userInfo);
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
      else {
        setError("เข้าสู่ระบบไม่สำเร็จ");
      }
      
      throw err; // ส่งต่อ error ให้ component จัดการ
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
      try {
      localStorage.removeItem('x-access-token');
      setToken(null);
      setUser(null);
      setError(null);
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [router]);

  const decodeToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return {
          username: decoded.username,
          user_id: decoded.sub,
      }
    } catch {
      return null;
    }
  };

  const clearError = () => {
    setError(null);
  };

  // เช็ค token เมื่อ app เริ่มต้น
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('x-access-token');
        if (storedToken) {
            const decoded = jwtDecode<JwtPayload>(storedToken);
            const now = Date.now() / 1000;
            if (decoded.exp < now) {
            console.warn('Token expired');
            logout(); // clear expired token
            } else {
            setToken(storedToken);
            const userInfo = decodeToken(storedToken);
            if (userInfo) setUser(userInfo);
            }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        logout(); // clear invalid token
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      register,
      login,
      logout,
      isLoading,
      isAuthenticated: !!token && !!user,
      error,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}