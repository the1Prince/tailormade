import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('tailormade_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/users/me');
        setUser(data);
      } catch {
        await SecureStore.deleteItemAsync('tailormade_token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (usernameOrEmail, password) => {
    const { data } = await api.post('/auth/login', { usernameOrEmail, password });
    await SecureStore.setItemAsync('tailormade_token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (username, password, email, name) => {
    const { data } = await api.post('/auth/register', {
      username,
      password,
      ...(email && { email }),
      ...(name && { name }),
    });
    await SecureStore.setItemAsync('tailormade_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('tailormade_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
