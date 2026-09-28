// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('quizarena_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('quizarena_token');
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem('quizarena_user', JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem('quizarena_token');
        localStorage.removeItem('quizarena_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user, token } = await authApi.login({ email, password });
    localStorage.setItem('quizarena_token', token);
    localStorage.setItem('quizarena_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { user, token } = await authApi.register({ name, email, password, role: 'student' });
    localStorage.setItem('quizarena_token', token);
    localStorage.setItem('quizarena_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('quizarena_token');
    localStorage.removeItem('quizarena_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
