import { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Refresh profile when token changes
  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  async function fetchProfile() {
    try {
      const response = await apiClient.get('/auth/profile/');
      setUser(response.data);
    } catch (error) {
      console.error('Profile fetch failed:', error);
      // Do not force logout on profile fetch failure; keep token/user from login
    } finally {
      setLoading(false);
    }
  }

  async function register(username, email, password, password2) {
    try {
      const response = await apiClient.post('/auth/register/', {
        username, email, password, password2
      });
      
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  }

  async function login(username, password) {
    try {
      const response = await apiClient.post('/auth/login/', {
        username, password
      });
      
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Login failed' 
      };
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}