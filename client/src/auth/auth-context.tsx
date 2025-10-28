import React, { createContext, useState, useEffect, ReactNode } from 'react';
import authService from './auth-service'; // Функція для отримання ролі користувача
import userService from '../user/user-service';

interface AuthContextProps {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  userRole: string | null; // Додано роль
  login: (token: string, role: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Додаємо стан для завантаження

  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        const isValid = await authService.validateToken();
        if (!isValid) {
          logout();
        } else {
          const role = await authService.getUserRole();
          const id = (await userService.getCurrentUserId()).id;
          setUserId(id);
          setUserRole(role);
          setIsAuthenticated(true);
        }
      }
      setLoading(false); // Закінчуємо завантаження після перевірки
    };
    checkToken();
  }, [token]);

  const login = (newToken: string, role: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, userId, userRole, login, logout }}>
      {!loading && children} {/* Не рендеримо дітей, поки йде завантаження */}
    </AuthContext.Provider>
  );
};

