import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err: any) {
          if (err.response?.status !== 429) {
            localStorage.clear();
          }
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (data: any) => {
    const res = await api.post('/auth/login', data);
    const { access_token, refresh_token, user: userData } = res.data;
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    localStorage.setItem('uid', userData.id);
    setUser(userData);
    window.location.href = '/dashboard';
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    const { access_token, refresh_token, user: userData } = res.data;
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    localStorage.setItem('uid', userData.id);
    setUser(userData);
    window.location.href = '/dashboard';
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (data: Partial<User>) => {
    if (user) setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
