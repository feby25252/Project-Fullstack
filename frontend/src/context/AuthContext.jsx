import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('lensique_token');
    const savedUser = localStorage.getItem('lensique_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('lensique_token');
        localStorage.removeItem('lensique_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('lensique_token', newToken);
    localStorage.setItem('lensique_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('lensique_token');
    localStorage.removeItem('lensique_user');
    setToken(null);
    setUser(null);
  }, []);

  const isLoggedIn = !!token;
  const isAdmin = user?.role_id === 1;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isLoggedIn, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
