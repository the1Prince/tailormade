import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tailormade_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/users/me')
      .then(({ data }) => {
        if (data.role === 'admin') setUser(data);
        else localStorage.removeItem('tailormade_admin_token');
      })
      .catch(() => localStorage.removeItem('tailormade_admin_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (usernameOrEmail, password) => {
    const { data } = await api.post('/auth/login', { usernameOrEmail, password });
    if (data.user.role !== 'admin') throw new Error('Admin access only');
    localStorage.setItem('tailormade_admin_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('tailormade_admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
