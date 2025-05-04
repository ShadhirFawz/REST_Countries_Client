// src/services/api.js
import axios from 'axios';

const API_BASE = '/api/countries';

export const getAllCountries = async (page = 1, limit = 5) => {
  try {
    const response = await axios.get(`/api/countries/all?page=${page}&limit=${limit}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching countries:', err);
    throw err;
  }
};

export const searchCountries = async (query, filterType = 'name') => {
  try {
    const endpointMap = {
      'name': `${API_BASE}/name/${query}`,
      'code': `${API_BASE}/code/${query}`,
      'language': `${API_BASE}/language/${query}`,
      'region': `${API_BASE}/region/${query}`,
      'subregion': `${API_BASE}/subregion/${query}`,
      'capital': `${API_BASE}/capital/${query}`,
      'translation': `${API_BASE}/translation/${query}`
    };

    const response = await axios.get(endpointMap[filterType]);
    return response.data;
  } catch (err) {
    console.error('Error searching countries:', err);
    throw err;
  }
};

// Favorites API
export const addFavorite = async (countryData) => {
  try {
    const response = await axios.post('/api/favorites', countryData);
    return response.data;
  } catch (err) {
    console.error('Error adding favorite:', err);
    throw err;
  }
};

export const removeFavorite = async (code) => {
  try {
    const response = await axios.delete(`/api/favorites/${code}`);
    return response.data;
  } catch (err) {
    console.error('Error removing favorite:', err);
    throw err;
  }
};

export const getFavorites = async () => {
  try {
    const response = await axios.get('/api/favorites');
    return response.data;
  } catch (err) {
    console.error('Error fetching favorites:', err);
    throw err;
  }
};