import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
const API = axios.create({ baseURL: API_BASE_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('connectict_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('connectict_token');
    if (token) {
      API.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('connectict_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('connectict_token', token);
    return API.get('/auth/me').then(res => { setUser(res.data); return res.data; });
  };

  const logout = () => {
    localStorage.removeItem('connectict_token');
    setUser(null);
  };

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { API };
