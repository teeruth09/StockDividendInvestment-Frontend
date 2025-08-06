// contexts/AuthContext.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginDto, User } from '@/types/user';
import { loginApi } from '@/lib/api/auth';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  username: string;
  exp: number; // expiry time (timestamp)
}

interface AuthContextType {
  user: User | null;
  token: string | null;
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
            setUser({
                user_id: decoded.sub,
                username: decoded.username,
            });
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
  }, []);

  const login = async (credentials: LoginDto) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { access_token } = await loginApi(credentials);
      localStorage.setItem('x-access-token', access_token);
      setToken(access_token); // หรือ jwtDecode(access_token)

      // TODO: ดึง user info จาก token หรือ API call
      // const userInfo = decodeToken(accessToken) หรือ fetchUserInfo(accessToken);
      // setUser(userInfo);
      
      // ตอนนี้ใช้ข้อมูลจาก credentials ก่อน
      setUser({
        user_id: 'temp_id',
        username: credentials.username
      });
      
    } catch (err: any) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
      throw err; // ส่งต่อ error ให้ component จัดการ
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('x-access-token');
      setToken(null);
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
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