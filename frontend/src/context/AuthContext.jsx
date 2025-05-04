// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getFavorites } from '../services/api';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000'; // Or your backend base URL

// Add token to all requests if available
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // State management
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Authentication methods
  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      const res = await axios.post('/api/auth/login', { email, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      await fetchUser();
      await loadFavorites();
      return res.data;
    } catch (error) {
      setAuthLoading(false);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setAuthLoading(true);
      const res = await axios.post('/api/auth/register', userData);
      const token = res.data.token;
      localStorage.setItem('token', token);
      await fetchUser();
      await loadFavorites();
      return res.data;
    } catch (error) {
      setAuthLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setFavorites([]);
    setAuthLoading(false);
  };

  // User data management
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthLoading(false);
        return;
      }

      const res = await axios.get('/api/auth/me');
      setUser(res.data);
      return res.data;
    } catch (error) {
      logout();
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Favorites management
  const loadFavorites = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    // Clear favorites immediately if no token to prevent stale data
    if (!token) {
      setFavorites([]);
      return;
    }
  
    setFavoritesLoading(true);
    try {
      const favs = await getFavorites();
      setFavorites(favs);
      return favs; // Still return the value in case consumers need it
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setFavorites([]); // Clear on error to maintain consistent state
      throw error; // Re-throw to allow error handling by consumers
    } finally {
      setFavoritesLoading(false);
    }
  }, []);

  const updateFavorites = (newFavorites) => {
    setFavorites(newFavorites);
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await fetchUser();
        if (user) {
          await loadFavorites();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };
    
    initializeAuth();

    // Optional: Add event listener for storage changes to sync across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          logout();
        } else {
          fetchUser().then(loadFavorites);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Context value
  const contextValue = {
    user,
    authLoading,
    favorites,
    favoritesLoading,
    token: localStorage.getItem('token'),
    login,
    register,
    logout,
    fetchUser,
    loadFavorites,
    updateFavorites
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};