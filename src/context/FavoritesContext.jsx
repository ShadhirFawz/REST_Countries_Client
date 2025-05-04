// src/context/FavoritesContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getFavorites } from '../services/api';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshFavorites = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [token]);

  return (
    <FavoritesContext.Provider value={{ favorites, loading, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}